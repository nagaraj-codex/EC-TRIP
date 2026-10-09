package com.queuecut.api.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.Arrays;
import java.util.List;

@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        @NotBlank String frontendUrl,
        @NotNull Cors cors,
        @NotNull Auth auth,
        @NotNull Google google,
        @NotNull Gemini gemini,
        @NotNull Resend resend,
        @NotNull OpenMeteo openMeteo,
        @NotBlank String osrmUrl,
        @NotBlank String nagerUrl,
        @NotBlank String sunriseSunsetUrl,
        @NotBlank String catalogPath,
        @NotNull Intelligence intelligence,
        @NotNull Telemetry telemetry
) {
    public record Cors(
            @NotBlank String origins
    ) {
        public List<String> getOriginList() {
            return Arrays.stream(origins.split(","))
                    .map(s -> s.trim()).filter(s -> !s.isBlank()).toList();
        }
    }

    public record Auth(
            @NotBlank String cookieName,
            boolean cookieSecure,
            @NotBlank String cookieSamesite,
            int sessionDays,
            @NotBlank String sessionTtl
    ) {}

    public record Google(
            String clientId,
            String clientSecret,
            @NotBlank String redirectUri
    ) {
        public boolean isConfigured() {
            return clientId != null && !clientId.isBlank() && clientSecret != null && !clientSecret.isBlank();
        }
    }

    public record Gemini(
            String apiKey,
            @NotBlank String model
    ) {
        public boolean isConfigured() {
            return apiKey != null && !apiKey.isBlank();
        }
    }

    public record Resend(
            String apiKey
    ) {
        public boolean isConfigured() {
            return apiKey != null && !apiKey.isBlank();
        }
    }

    public record OpenMeteo(
            @NotBlank String forecastUrl,
            @NotBlank String airQualityUrl
    ) {}

    public record Intelligence(
            @NotBlank String openMeteoBaseUrl,
            @NotBlank String nagerBaseUrl,
            @NotBlank String httpTimeout,
            @NotBlank String cacheTtlWeather,
            @NotBlank String cacheTtlHolidays
    ) {}

    public record Telemetry(
            @NotBlank String broadcastInterval,
            @NotBlank String allowedOrigins
    ) {}
}