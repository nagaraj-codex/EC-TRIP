package com.queuecut.notification;

import jakarta.persistence.*;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "notification_type", nullable = false)
    private String notificationType;

    @Column(nullable = false)
    private int read = 0;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    public String getId()               { return id; }
    public void setId(String id)        { this.id = id; }
    public String getUserId()           { return userId; }
    public void setUserId(String v)     { this.userId = v; }
    public String getTitle()            { return title; }
    public void setTitle(String v)      { this.title = v; }
    public String getMessage()          { return message; }
    public void setMessage(String v)    { this.message = v; }
    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String v) { this.notificationType = v; }
    public boolean isRead()             { return read != 0; }
    public void setRead(int v)          { this.read = v; }
    public String getCreatedAt()        { return createdAt; }
    public void setCreatedAt(String v)  { this.createdAt = v; }
}