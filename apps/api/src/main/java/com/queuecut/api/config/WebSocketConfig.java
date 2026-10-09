package com.queuecut.api.config;

import com.queuecut.api.service.TelemetryWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final TelemetryWebSocketHandler telemetryHandler;
    private final AppProperties props;

    public WebSocketConfig(TelemetryWebSocketHandler telemetryHandler, AppProperties props) {
        this.telemetryHandler = telemetryHandler;
        this.props = props;
    }

    @Override
    public void registerWebSocketHandlers(@NonNull WebSocketHandlerRegistry registry) {
        String[] origins = props.telemetry().allowedOrigins().split(",");
        for (int i = 0; i < origins.length; i++) {
            origins[i] = origins[i].trim();
        }
        
        registry.addHandler(telemetryHandler, "/ws/telemetry")
                .setAllowedOrigins(origins);
    }
}