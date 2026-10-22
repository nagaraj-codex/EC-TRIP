package com.queuecut.common;

import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1/news")
public class NewsController {

    @GetMapping
    public org.springframework.http.ResponseEntity<Map<String, Object>> listNews(@RequestParam(required=false) String park_id) {
        // Disabled logic
        return org.springframework.http.ResponseEntity.status(501).body(Map.of(
            "status", "UNAVAILABLE",
            "source", "official_park_feed",
            "fetched_at", OffsetDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
            "error", "Official feed integration is not configured",
            "data", List.of()
        ));
    }
}