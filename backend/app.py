import os
import time
import traceback
import logging
import sys

from dotenv import load_dotenv
from contextlib import asynccontextmanager

import signal
import uvicorn
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

if ".env" in os.listdir() and os.getenv("MODE") != "prod":
    load_dotenv(dotenv_path=".env")
else:
    time.sleep(5)  # wait for database to start

from src import recommendation
from src.common.apis import gmail
from src.common.apis.responses.spotify_responses import TopArtistResponse
from src.data_gathering import assert_data
from src.database import Crew, CrewMember, UserSuggestions, UserSuggestions
from websocket_client import WebsocketClient


def assert_keys(body: dict, keys: list[str]) -> list[str]:
    missing = [key for key in keys if key not in body.keys()]
    if missing:
        raise HTTPException(status_code=401, detail=f"Missing credentials: {missing}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """this is so that we can ctrl+c the server before it starts, if we want to cancel the database build"""

    def receive_signal(signalNumber, frame):
        print("Received:", signalNumber)
        sys.exit()

    signal.signal(signal.SIGINT, receive_signal)
    assert_data()
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ws_client = WebsocketClient()

logger.remove()
logger.add(
    sys.stderr,
    colorize=True,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <10}</level> | <level>{message}</level>",
    level="DEBUG",  # if os.environ.get("MODE") == "dev" else "INFO",
)


# Custom handler for integrating loguru with standard logging
class InterceptHandler(logging.Handler):
    def emit(self, record):
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


# Replace Uvicorn's logger with our custom loguru logger
logging.getLogger("uvicorn").handlers = [InterceptHandler()]
logging.getLogger("uvicorn.access").handlers = [InterceptHandler()]


@app.post("/api/authorize/")
async def authorize_user(request: Request):
    """Authorize a user to use the app, creating suggestions and storing their data in the database for future use in services

    Args:
        request (Request): FastAPI request object, needs to contain the user_id and access_token in the body

    Raises:
        HTTPException: If user is not authorized

    Returns:
        json: Success message
    """
    body = await request.json()
    assert_keys(body, ["user_id", "access_token"])

    try:
        user_suggestions = UserSuggestions.create(
            name=body.get("username", body["user_id"]),
            id=body["user_id"],
            access_token=body["access_token"],
            picture_url=body.get(
                "user_picture_url",
                "https://i.scdn.co/image/ab6761610000e5eb58efbed422ab46484466822b",
            ),
        )
        logger.debug(
            f"Recommendations for {body['user_id']} ({body['username']}) generated"
        )
    except Exception:
        if os.getenv("MODE") == "dev":
            raise
        logger.error(
            f"Failed to recommend festivals for {body['user_id']} ({body['username']})",
            traceback.format_exc(),
        )
        gmail.send_mail(
            "Failed to recommend festivals",
            traceback.format_exc(),
        )
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return {"message": "Success"}


@app.get("/api/suggestions/")
async def get_suggestions(request: Request):
    """Get the suggestions for a user, needs to contain the access_token in the query parameters

    Args:
        request (Request): FastAPI request object

    Raises:
        HTTPException: 401 if user is not authorized
        HTTPException: 404 if no suggestions are found

    Returns:
        json: Suggestions for the user
    """
    if "access_token" in request.query_params:
        suggestions = UserSuggestions.get_or_none(
            UserSuggestions.access_token == request.query_params["access_token"]
        )
        if not suggestions:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    else:
        raise HTTPException(status_code=401, detail="Missing credentials")

    if not suggestions:
        raise HTTPException(status_code=404, detail="No suggestions found")

    return suggestions.json


@app.post("/api/crews/")
async def create_crew(request: Request):
    """Create a crew with the specified name and crew name, needs to contain the access_token, specified_name and crew_name in the body

    Args:
        request (Request): FastAPI request object

    Raises:
        HTTPException: 401 if user is not authorized
        HTTPException: 500 if there is an internal server error

    Returns:
        _type_: _description_
    """
    body = await request.json()
    assert_keys(body, ["access_token", "specified_name", "crew_name"])
    creator_suggestions = UserSuggestions.get_or_none(
        UserSuggestions.access_token == body["access_token"]
    )

    if not creator_suggestions:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    active_memberships = [
        membership
        for membership in creator_suggestions.user.memberships
        if membership.crew.active
    ]

    if len(active_memberships) >= int(os.getenv("MAX_CREW_MEMBERS", 5)):
        logger.error(f"User {creator_suggestions.user.id} has max number of crews")
        raise HTTPException(status_code=401, detail="Max number of crews reached")

    try:
        crew_suggestions = recommendation.recommend_n_crew_festivals(
            users=[creator_suggestions], user_n=50, result_n=5
        )
        crew = Crew.create(
            name=body["crew_name"],
            creator=creator_suggestions.user,
            crew_suggestions=crew_suggestions,
            specified_name=body["specified_name"],
            creator_suggestions=creator_suggestions,
        )
        return {"message": "Success", "id": crew.id}

    except Exception as e:
        logger.exception("Failed to recommend festivals", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/api/crews/join/")
async def join_crew(request: Request):
    """Join a crew with the specified name and crew name, needs to contain the users access_token, specified_name and crew_id in the body

    Args:
        request (Request): FastAPI request object

    Raises:
        HTTPException: 401 if user is not authorized
        HTTPException: 404 if crew does not exist
        HTTPException: 409 if max number of crew members is reached or user is already in crew

    Returns:
        json: success message
    """
    body = await request.json()
    assert_keys(body, ["access_token", "specified_name", "crew_id"])
    user_suggestions = UserSuggestions.get_or_none(
        UserSuggestions.access_token == body["access_token"]
    )

    if not user_suggestions:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    crew = Crew.get_by_id(body["crew_id"])
    if not crew or not crew.active:
        raise HTTPException(status_code=404, detail="Crew does not exist")

    if len(crew.members) >= int(os.getenv("MAX_CREW_MEMBERS", 4)):
        raise HTTPException(
            status_code=409, detail="Max number of crew members reached"
        )

    if user_suggestions.user in {member.user for member in crew.members}:
        raise HTTPException(status_code=409, detail="User already in crew")

    CrewMember.create(
        crew=crew,
        user=user_suggestions.user,
        data=user_suggestions,
        specified_name=body["specified_name"],
    )

    suggestions = recommendation.recommend_n_crew_festivals(
        users=[member.data for member in crew.members if member.is_active],
        user_n=50,
        result_n=5,
    )
    crew.suggestions = suggestions
    crew.save()

    await ws_client.notify_crew_of_change(crew.id)

    return {"message": "Success"}


@app.post("/api/crews/delete/")
async def delete_crew(request: Request):
    """Delete (or leave if user not creator) a crew with the specified crew_id, needs to contain the users access_token and crew_id in the body

    Args:
        request (Request): FastAPI request object

    Raises:
        HTTPException: 401 if user is not authorized
        HTTPException: 404 if crew does not exist
        HTTPException: 403 if user is not in crew

    Returns:
        json: success message
    """
    body = await request.json()
    assert_keys(body, ["access_token", "crew_id"])

    user_suggestions = UserSuggestions.get_or_none(
        UserSuggestions.access_token == body["access_token"]
    )
    if not user_suggestions:
        raise HTTPException(status_code=401, detail="Invalid user credentials")

    crew = Crew.get_by_id(body["crew_id"])
    if not crew or not crew.active:
        raise HTTPException(status_code=404, detail="Crew does not exist")

    if crew.creator == user_suggestions.user:
        for crew_member in crew.members:
            crew_member.is_active = False
            crew_member.save()
        crew.active = False
        crew.save()
    elif user_suggestions.user in {member.user for member in crew.members}:
        member = CrewMember.get(
            CrewMember.user == user_suggestions.user, CrewMember.crew == crew
        )
        member.is_active = False
        member.save()

        suggestions = recommendation.recommend_n_crew_festivals(
            users=[member.data for member in crew.members if member.is_active],
            user_n=50,
            result_n=5,
        )
        crew.suggestions = suggestions
        crew.save()

        await ws_client.notify_crew_of_change(crew.id)

    else:
        raise HTTPException(status_code=403, detail="Forbidden, user not in crew")
    return {"message": "Success"}


@app.get("/api/crews/all/")
async def get_crews(request: Request):
    """Get all crews for a user, needs to contain the users access_token in the query parameters

    Args:
        request (Request): FastAPI request object

    Raises:
        HTTPException: 401 if user is not authorized

    Returns:
        json: List of crews for the user
    """
    assert_keys(request.query_params, ["access_token"])

    user_suggestions = UserSuggestions.get_or_none(
        UserSuggestions.access_token == request.query_params["access_token"]
    )
    if not user_suggestions:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # select all crews where user is a member
    response = []
    for membership in user_suggestions.user.memberships:
        if not membership.crew.active:
            continue
        if not membership.is_active:
            continue
        # select crew members of crew
        profile_pictures = [
            member.user.picture_url for member in membership.crew.members
        ]
        response.append(
            {
                "name": membership.crew.name,
                "id": membership.crew.id,
                "profile_pictures": profile_pictures,
            }
        )
    return response


@app.post("/api/crews/edit/")
async def edit_crew(request: Request):
    """Edit a crew with the specified crew_id, needs to contain the users access_token and crew_id in the body
       and can contain the new name of the crew

    Args:
        request (Request): FastAPI request object

    Raises:
        HTTPException: 401 if user is not authorized
        HTTPException: 404 if crew does not exist
        HTTPException: 403 if user is not creator of crew

    Returns:
        json: success message
    """
    body = await request.json()
    assert_keys(body, ["crew_id", "access_token"])

    creator_suggestions = UserSuggestions.get_or_none(
        UserSuggestions.access_token == body["access_token"]
    )
    if not creator_suggestions:
        raise HTTPException(status_code=401, detail="Invalid user credentials")

    crew = Crew.get_by_id(body["crew_id"])
    if not crew or not crew.active:
        raise HTTPException(status_code=404, detail="Crew does not exist")
    if not crew.creator == creator_suggestions.user:
        raise HTTPException(status_code=403, detail="Must be creator to edit group")
    if "name" in body:
        crew.name = body["name"]

    crew.save()

    await ws_client.notify_crew_of_change(crew.id)

    return {"message": "Success"}


@app.get("/api/crews/")
async def get_crew_suggestions(request: Request):
    """Get the suggestions for a crew, needs to contain the crew_id and access_token in the query parameters

    Args:
        request (Request): FastAPI request object

    Raises:
        HTTPException: 401 if user is not authorized
        HTTPException: 404 if crew does not exist
        HTTPException: 403 if user is not in crew

    Returns:
        json: Suggestions for the crew
    """
    assert_keys(request.query_params, ["crew_id", "access_token"])
    user_suggestions = UserSuggestions.get_or_none(
        UserSuggestions.access_token == request.query_params["access_token"]
    )
    if not user_suggestions:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    crew = Crew.get_or_none(Crew.id == request.query_params["crew_id"])
    if not crew or not crew.active:
        logger.error(f"Crew {request.query_params['crew_id']} not found")
        raise HTTPException(status_code=404, detail="Crew not found")

    if user_suggestions.user not in {member.user for member in crew.members}:
        logger.error(
            f"User {request.query_params['user_id']} not in crew {request.query_params['crew_id']}"
        )
        raise HTTPException(status_code=403, detail="Invalid credentials")
    member_info = []
    for member in crew.members:
        member_info.append(
            {
                "name": member.specified_name,
                "id": member.user.id,
                "picture_url": member.user.picture_url,
                "top_artists": member.data.top_3_artists,
            }
        )
    return {
        "name": crew.name,
        "id": crew.id,
        "members": member_info,
        "suggestions": crew.suggestions,
        "creator": crew.creator.id,
    }


@app.get("/api/home/")
async def get_home_preview(request: Request):
    """Get the home preview data for a user, needs to contain the access_token in the query parameters

    Args:
        request (Request): FastAPI request object

    Raises:
        HTTPException: 401 if user is not authorized

    Returns:
        json: Home preview data for the user
    """
    assert_keys(request.query_params, ["access_token"])
    user_suggestions = UserSuggestions.get_or_none(
        UserSuggestions.access_token == request.query_params["access_token"]
    )
    if not user_suggestions:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    top_2_suggestions = []
    for suggestion in user_suggestions.json:
        top_2_suggestions.append(
            {
                "name": suggestion["name"],
                "location": suggestion["location"],
                "date": suggestion["date_str"],
                "img": suggestion["headliner_img_url"],
            }
        )
        if len(top_2_suggestions) == 2:
            break
    active_memberships = [
        membership
        for membership in user_suggestions.user.memberships
        if membership.is_active
    ]
    if not active_memberships:
        crew_response = None
    else:
        crew_with_most_members = max(
            (membership.crew for membership in active_memberships),
            key=lambda crew: len(crew.members),
        )
        crew_response = {
            "name": crew_with_most_members.name,
            "id": crew_with_most_members.id,
            "member_pictures": [
                member.user.picture_url for member in crew_with_most_members.members
            ],
        }

    return {"individual": top_2_suggestions, "crew": crew_response}


@app.websocket("/api/crew_updates/")
async def websocket_endpoint(
    websocket: WebSocket, access_token: str = None, crew_id: str = None
):
    """Websocket endpoint for crew updates, needs to contain the access_token and crew_id in the query parameters
        sends "update" to the client when there is a change in the crew to let the client know to update
    Args:
        websocket (WebSocket): FastAPI websocket object
        access_token (str, optional): user access token
        crew_id (str, optional): crew id

    """
    logger.info(f"New websocket connection {websocket}")
    if not access_token or not crew_id:
        logger.error("Invalid websocket connection")
        await websocket.close()
        return
    user_suggestions = UserSuggestions.get_or_none(
        UserSuggestions.access_token == access_token
    )
    if not user_suggestions:
        logger.error(f"Invalid token {access_token}")
        await websocket.close()
        return
    crew = Crew.get_or_none(Crew.id == crew_id)
    if not crew:
        logger.error(f"Invalid crew {crew_id}")
        await websocket.close()
        return

    if user_suggestions.user not in {member.user for member in crew.members}:
        logger.error(f"User {user_suggestions.user.id} not in crew {crew_id}")
        await websocket.close()
    logger.info(f"Adding connection {websocket} to crew {crew_id}")
    await websocket.accept()
    ws_client.add_connection(crew_id, websocket)

    try:
        while True:
            # Keep the connection alive and listen for any incoming messages.
            # Depending on your application's requirements, you might want to process these messages or simply keep the connection open.
            data = await websocket.receive_text()
            logger.debug(f"Received message {data} from {user_suggestions.user.id}")
            # Here you can handle incoming messages as needed
    except WebSocketDisconnect:
        logger.info(
            f"WebSocket disconnected for user {user_suggestions.user.id} in crew {crew_id}"
        )
    finally:
        ws_client.remove_connection(crew_id, websocket)
        logger.info(
            f"Removed WebSocket connection for user {user_suggestions.user.id} in crew {crew_id}"
        )


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=os.getenv("MODE") == "dev")
