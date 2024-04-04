import signal
import sys
import logging
from loguru import logger
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from core.data_gathering.ops import assert_data
from models.crew import Crew
from models.user import UserAuthorizationData
from config import settings, Mode
from routers import UserRouter, PreviewRouter, CrewRouter

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

app.include_router(UserRouter, prefix="/api/user")
app.include_router(PreviewRouter, prefix="/api/preview")
app.include_router(CrewRouter, prefix="/api/crew")

@app.middleware("http")
async def validate_access_token(request: Request, call_next):
    """Validates the access token in the request headers if needed and attaches the user's authorization data and if needed the crew to the request state

    Args:
        request (Request): FastAPI request object
        call_next (_type_): the next middleware in the chain

    Raises:
        HTTPException: 401 if access token is not provided
        HTTPException: 403 if user is not authorized
        HTTPException: 404 if crew is not found or not active
    """
    is_signup_request = request.url.path == "/api/user/" and request.method == "POST"
    if is_signup_request or isinstance(request, WebSocket):
        return await call_next(request)
    access_token =  request.headers.get("Authorization")
    if not access_token:
        raise HTTPException(status_code=401, detail="Access token required")
    try:
        request.state.authorization = UserAuthorizationData.get_by_id(access_token)
    except UserAuthorizationData.DoesNotExist:
        raise HTTPException(status_code=403, detail="User not authorized")
    
    is_create_crew_request = request.url.path == "/api/crew/" and request.method == "POST"
    crew_id_required = not request.url.path.startswith("/api/preview/") or is_create_crew_request
    if not crew_id_required:
        return await call_next(request)
    crew_id = request.query_params.get("crew_id")
    if not crew_id:
        raise HTTPException(status_code=403, detail="Crew id required")
    if not crew_id:
        return await call_next(request)
    try:
        crew = Crew.get_by_id(crew_id)
    except Crew.DoesNotExist:
        raise HTTPException(status_code=404, detail="Crew not found")
    if not crew.active:
        raise HTTPException(status_code=404, detail="Crew not found")
    request.state.crew = crew
    return await call_next(request)

if settings.mode == Mode.dev:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


logger.remove()
logger.add(
    sys.stderr,
    colorize=True,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <10}</level> | <level>{message}</level>",
    level="DEBUG",
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.mode == Mode.dev)