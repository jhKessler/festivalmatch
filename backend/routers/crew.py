from loguru import logger
from fastapi import APIRouter, HTTPException, Request, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from config import settings
from core import recommendation
from core.common.utils.websocket_client import WebsocketClient
from models.crew import Crew, CrewMember
from dependencies.crew import add_user_to_crew, remove_member_from_crew, delete_crew
from models.user import UserAuthorizationData

router = APIRouter()
ws_client = WebsocketClient()


class CreateCrewBody(BaseModel):
    crew_name: str
    specified_name: str


class JoinCrewBody(BaseModel):
    specified_name: str


class EditCrewBody(BaseModel):
    name: str


@router.post("/")
async def create_crew(request: Request, body: CreateCrewBody):
    user_auth = request.state.authorization

    active_memberships = [
        membership
        for membership in user_auth.user.memberships
        if membership.crew.active
    ]

    if len(active_memberships) >= int(settings.max_crew_memberships):
        logger.error(f"User {user_auth.user.id} has max number of crews")
        raise HTTPException(status_code=401, detail="Max number of crews reached")

    crew_suggestions = recommendation.recommend_n_crew_festivals(
        users=[user_auth], user_n=50, result_n=5
    )
    crew = Crew.create(
        name=body.crew_name,
        creator=user_auth.user,
        crew_suggestions=crew_suggestions,
        specified_name=body.specified_name,
        creator_suggestions=user_auth,
    )
    return {"message": "Success", "id": crew.id}


@router.post("/join/")
async def join_crew(request: Request, body: JoinCrewBody):
    user_auth = request.state.authorization
    crew = request.state.crew

    if len(crew.members) >= int(settings.max_crew_memberships):
        logger.error(f"Crew {crew.id} has max number of members")
        raise HTTPException(status_code=409, detail="Max number of members reached")

    if crew.is_member(user_auth.user):
        raise HTTPException(status_code=409, detail="User already in crew")

    add_user_to_crew(user_auth, crew, body.specified_name)

    return {"message": "Success"}


@router.post("/delete/")
async def delete_crew_endpoint(request: Request):
    user_auth = request.state.authorization
    crew = request.state.crew

    if crew.creator == user_auth.user:
        delete_crew(crew)
        return {"message": "Success"}

    user_to_member = {member.user: member for member in crew.members}
    if not (member := user_to_member.get(user_auth.user)):
        raise HTTPException(status_code=403, detail="User not in crew")
    remove_member_from_crew(member, crew)
    await ws_client.notify_crew_of_change(crew.id)
    return {"message": "Success"}


@router.post("/edit/")
async def edit_crew(request: Request, body: EditCrewBody):
    user_auth = request.state.authorization
    crew = request.state.crew

    if crew.creator != user_auth.user:
        raise HTTPException(status_code=403, detail="User not creator of crew")

    crew.name = body.name
    crew.save()

    await ws_client.notify_crew_of_change(crew.id)

    return {"message": "Success"}


@router.get("/")
async def get_crew_suggestions(request: Request):
    user_auth = request.state.authorization
    crew = request.state.crew
    if not crew.is_member(user_auth.user):
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


@router.websocket("/updates/")
async def websocket_endpoint(websocket: WebSocket, crew_id: str, token: str):
    try:
        user_auth = UserAuthorizationData.get_by_id(token)
    except UserAuthorizationData.DoesNotExist:
        raise HTTPException(status_code=403, detail="User not authorized")
    try:
        crew = Crew.get_by_id(crew_id)
    except Crew.DoesNotExist:
        raise HTTPException(status_code=404, detail="Crew not found")

    if not crew.is_member(user_auth.user):
        await websocket.close()
        return

    logger.info(
        f"Adding connection {websocket} to crew {crew.id} for user {user_auth.user.id}"
    )
    await websocket.accept()
    ws_client.add_connection(crew.id, websocket)

    try:
        while True:
            # Keep the connection alive and listen for any incoming messages.
            # Depending on your application's requirements, you might want to process these messages or simply keep the connection open.
            data = await websocket.receive_text()
            logger.debug(f"Received message {data} from {user_auth.user.id}")
            # Here you can handle incoming messages as needed
    except WebSocketDisconnect:
        logger.info(
            f"WebSocket disconnected for user {user_auth.user.id} in crew {crew.id}"
        )
    finally:
        ws_client.remove_connection(crew.id, websocket)
        logger.info(
            f"Removed WebSocket connection for user {user_auth.user.id} in crew {crew.id}"
        )
