import json
import logging
from typing import List, Dict, Any, Optional, Union
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket Telemetry"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("WebSocket client connected. Total active: %d", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info("WebSocket client disconnected. Total active: %d", len(self.active_connections))

    async def broadcast(self, message: Union[str, Dict[str, Any]]):
        """Broadcast payload to all active connected clients."""
        payload_str = json.dumps(message) if isinstance(message, dict) else str(message)
        dead_connections = []
        for connection in list(self.active_connections):
            try:
                await connection.send_text(payload_str)
            except Exception as e:
                logger.debug("Failed sending to connection: %s", e)
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)

manager = ConnectionManager()

class AlertPayload(BaseModel):
    title: str = Field(default="Live Telemetry Alert")
    message: str = Field(default="Sudden weather shift or surge detected near theme park.")
    level: str = Field(default="warning")  # "info" | "warning" | "surge" | "deal"
    park_id: Optional[str] = "wonderla-chennai"
    badge: Optional[str] = "LIVE"

@router.websocket("/telemetry/ws")
@router.websocket("/ws")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Initial welcome handshake
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "status": "connected",
            "service": "QueueCut v3.0 Live Telemetry",
            "timestamp": "now"
        }))
        while True:
            # Keep alive and receive any client ping
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.debug("WebSocket error: %s", e)
        manager.disconnect(websocket)

@router.post("/telemetry/trigger-alert", tags=["WebSocket Telemetry"])
@router.post("/trigger-alert", tags=["WebSocket Telemetry"])
async def trigger_live_alert(message: Optional[str] = None, payload: Optional[AlertPayload] = None):
    """
    Webhook endpoint to trigger instant broadcast alerts to all connected PWA & web clients.
    """
    alert_dict = {
        "type": "telemetry_alert",
        "title": payload.title if payload else "⛈️ Weather Flash Advisory",
        "message": message or (payload.message if payload else "Sudden rain clouds detected near Wonderla Chennai. Water park remains open, outdoor coasters may pause."),
        "level": payload.level if payload else "warning",
        "park_id": payload.park_id if payload else "wonderla-chennai",
        "badge": payload.badge if payload else "RADAR 2KM"
    }
    await manager.broadcast(alert_dict)
    return {
        "status": "broadcast_complete",
        "recipients_count": len(manager.active_connections),
        "payload": alert_dict
    }
