package com.queuecut.api.service;


import com.queuecut.api.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class NotificationService {
    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) { this.repo = repo; }

    public List<Map<String, Object>> listNotifications(String userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(n -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",                n.getId());
                    m.put("title",             n.getTitle());
                    m.put("message",           n.getMessage());
                    m.put("notification_type", n.getNotificationType());
                    m.put("read",              n.isRead());
                    m.put("created_at",        n.getCreatedAt());
                    return m;
                }).toList();
    }

    @Transactional
    public boolean markRead(String userId, String notificationId) {
        return repo.findByIdAndUserId(notificationId, userId).map(n -> {
            n.setRead(1);
            repo.save(n);
            return true;
        }).orElse(false);
    }

    @Transactional
    public void markAllRead(String userId) {
        repo.markAllRead(userId);
    }
}