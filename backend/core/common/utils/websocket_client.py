import os
import uuid
from fastapi import WebSocket
from loguru import logger
from config import settings

class WebsocketClient:
    def __init__(self):
        self.connections = dict()

    def add_connection(self, crew_id: uuid.UUID | str, connection: WebSocket):
        if isinstance(crew_id, uuid.UUID):
            crew_id = str(crew_id)
        logger.info(f"Adding connection {connection} to crew {crew_id}")
        if crew_id not in self.connections:
            self.connections[crew_id] = []

        if len(self.connections[crew_id]) > int(settings.max_crew_members):
            raise ValueError("Crew already has too many connections")
        self.connections[crew_id].append(connection)
        logger.info(f"Connections for crew {crew_id}: {self.connections[crew_id]}")

    def get_connections(self, crew_id: uuid.UUID | str) -> list[WebSocket]:
        if isinstance(crew_id, uuid.UUID):
            crew_id = str(crew_id)
        logger.info(f"Getting connections for crew {crew_id}")
        return self.connections[crew_id]

    def remove_connection(self, crew_id: uuid.UUID | str, connection: WebSocket):
        if isinstance(crew_id, uuid.UUID):
            crew_id = str(crew_id)
        logger.info(f"Removing connection {connection} from crew {crew_id}")
        try:
            self.connections[crew_id].remove(connection)
        except ValueError:
            logger.warning(f"Connection {connection} not found in crew {crew_id}")

    async def notify_crew_of_change(self, crew_id: uuid.UUID | str):
        if isinstance(crew_id, uuid.UUID):
            crew_id = str(crew_id)
        logger.info(f"Sending update to crew {crew_id}")
        connections = self.get_connections(crew_id)
        for connection in connections:
            logger.info(f"Sending update to {connection}")
            await connection.send_text("update")
