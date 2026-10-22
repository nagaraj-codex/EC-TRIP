package com.queuecut.notification;

import com.queuecut.auth.AuthService;
import com.queuecut.common.ApiException;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notif;
    private final AuthService auth;

    public NotificationController(NotificationService notif, AuthService auth) { this.notif = notif; this.auth = auth; }

    private String requireUserId(HttpServletRequest req) {
        String token = getSessionToken(req);
        if (token == null) throw new ApiException(401, "Authentication required");
        return auth.getUserForSession(token)
            .orElseThrow(() -> new ApiException(401, "Session expired or invalid")).getId();
    }

    private String getSessionToken(HttpServletRequest req) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) if ("queuecut_session".equals(c.getName())) return c.getValue();
        return null;
    }

    @GetMapping
    public Map<String, Object> list(HttpServletRequest req) {
        return Map.of("status", "success", "data", notif.listNotifications(requireUserId(req)));
    }

    @PostMapping("/{id}/read")
    public Map<String, Object> markRead(@PathVariable String id, HttpServletRequest req) {
        String userId = requireUserId(req);
        boolean ok = notif.markRead(userId, id);
        if (!ok) throw new ApiException(404, "Notification not found");
        return Map.of("status", "success", "notification_id", id, "read", true);
    }

    @PostMapping("/read-all")
    public Map<String, Object> markAllRead(HttpServletRequest req) {
        notif.markAllRead(requireUserId(req));
        return Map.of("status", "success", "read", true);
    }
}