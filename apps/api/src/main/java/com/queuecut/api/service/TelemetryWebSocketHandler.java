package com.queuecut.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@SuppressWarnings("null")
public class TelemetryWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(TelemetryWebSocketHandler.class);
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(@org.springframework.lang.NonNull WebSocketSession session) throws Exception {
        sessions.add(session);
        log.info("WebSocket client connected. Total: {}", sessions.size());
        Map<String, Object> welcome = new LinkedHashMap<>();
        welcome.put("type",      "connection_established");
        welcome.put("status",    "connected");
        welcome.put("service",   "QueueCut v3.0 Live Telemetry");
        welcome.put("timestamp", java.time.Instant.now().toString());
        session.sendMessage(new TextMessage(mapper.writeValueAsString(welcome)));
    }

    @Override
    public void afterConnectionClosed(@org.springframework.lang.NonNull WebSocketSession session, @org.springframework.lang.NonNull CloseStatus status) {
        sessions.remove(session);
        log.info("WebSocket client disconnected. Total: {}", sessions.size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Keep-alive pings handled implicitly
    }

    public void broadcast(Map<String, Object> payload) {
        String text;
        try { text = mapper.writeValueAsString(payload); }
        catch (Exception e) { return; }
        List<WebSocketSession> dead = new ArrayList<>();
        for (WebSocketSession s : sessions) {
            try {
                if (s.isOpen()) s.sendMessage(new TextMessage(text));
                else dead.add(s);
            } catch (Exception e) {
                dead.add(s);
            }
        }
        sessions.removeAll(dead);
    }

    public int getConnectionCount() { return sessions.size(); }
}