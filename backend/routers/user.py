from loguru import logger
from fastapi import APIRouter, Request
from pydantic import BaseModel

from dependencies.user import handle_user_authorization
from models.user import UserAuthorizationData

router = APIRouter()


class AuthorizationBody(BaseModel):
    user_id: str
    access_token: str
    username: str = None
    user_picture_url: str = None


@router.post("/")
async def authorize_user(request: Request, body: AuthorizationBody):
    """Authorize a user to use the app, creating suggestions and storing their data in the database for future use in services

    Args:
        request (Request): FastAPI request object
        body (AuthorizationBody): Body of the request containing the user_id and access_token

    Raises:
        HTTPException: If user is not authorized

    Returns:
        json: Success message
    """
    handle_user_authorization(
        user_access_token=body.access_token,
        user_id=body.user_id,
        username=body.username,
        user_picture_url=body.user_picture_url,
    )
    logger.debug(f"Recommendations for {body.user_id} ({body.username}) generated")

    return {"message": "Success"}


@router.get("/suggestions")
async def get_suggestions(request: Request):
    """Get the suggestions for a user, needs to contain the access_token in the query parameters

    Returns:
        json: Suggestions for the user
    """
    return request.state.authorization.json
