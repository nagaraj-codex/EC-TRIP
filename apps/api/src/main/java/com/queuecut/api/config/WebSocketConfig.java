package com.queuecut.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
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
    @SuppressWarnings("null")
    public void registerWebSocketHandlers(@NonNull WebSocketHandlerRegistry registry) {
        registry.addHandler(telemetryHandler, "/api/v1/telemetry/ws", "/api/v1/ws", "/ws")
                .setAllowedOriginPatterns("*");
    }
}