package com.queuecut.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
@SuppressWarnings("null")
public class WebSocketConfig implements WebSocketConfigurer {

    private final com.queuecut.api.service.TelemetryWebSocketHandler telemetryHandler;

    public WebSocketConfig(com.queuecut.api.service.TelemetryWebSocketHandler telemetryHandler) {
        this.telemetryHandler = telemetryHandler;
    }

    @Override
    public void registerWebSocketHandlers(@org.springframework.lang.NonNull WebSocketHandlerRegistry registry) {
        registry.addHandler(telemetryHandler, "/api/v1/telemetry/ws", "/api/v1/ws", "/ws")
                .setAllowedOriginPatterns("*");
    }
}