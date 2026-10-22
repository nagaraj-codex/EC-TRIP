package com.queuecut.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1/download")
public class DownloadController {

    private final ObjectMapper mapper = new ObjectMapper();

    public record ExportRequest(
        Object user,
        Map<String, Object> settings,
        List<Map<String, Object>> saved_trips
    ) {}

    @PostMapping("/export")
    public ResponseEntity<String> export(@RequestBody ExportRequest req) throws Exception {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("user", req.user() != null ? req.user() : "Guest");
        payload.put("settings", req.settings() != null ? req.settings() : Map.of());
        payload.put("saved_trips", req.saved_trips() != null ? req.saved_trips() : List.of());
        payload.put("exported_at", OffsetDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        payload.put("app", "QueueCut");

        String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(payload);
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=\"queuecut-export.json\"");
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        return new ResponseEntity<>(json, headers, HttpStatus.OK);
    }
}