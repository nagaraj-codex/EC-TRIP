package com.queuecut.api.controller;

import com.queuecut.api.service.ChatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chat;

    public ChatController(ChatService chat) { this.chat = chat; }

    public record ChatRequest(
        @NotBlank String prompt,
        Map<String, Object> context
    ) {}

    @PostMapping("/ask")
    public Map<String, Object> ask(@Valid @RequestBody ChatRequest req) {
        Map<String, Object> ctx = req.context() != null ? req.context() : Map.of();
        return chat.chat(req.prompt(), ctx);
    }
}