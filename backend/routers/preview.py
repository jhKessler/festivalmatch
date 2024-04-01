from dependencies.preview import build_user_home_preview, get_user_crews
from fastapi import APIRouter, Request


router = APIRouter()


@router.get("/home/")
async def get_home_preview(request: Request):
    user_auth = request.state.authorization
    return build_user_home_preview(user_auth)


@router.get("/crews/")
async def get_crews(request: Request):
    user_suggestions = request.state.authorization
    return get_user_crews(user_suggestions)
