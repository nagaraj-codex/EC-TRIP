package com.queuecut.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class PromptBuilder {
    private final ObjectMapper mapper = new ObjectMapper();

    public String buildPrompt(Map<String, Object> parkData, Map<String, Object> tripReq) throws Exception {
        Map<String, Object> root = new LinkedHashMap<>();
        root.put("park", parkData);
        root.put("request", tripReq);
        return mapper.writeValueAsString(root);
    }
}
