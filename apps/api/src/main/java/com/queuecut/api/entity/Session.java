package com.queuecut.api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sessions")
public class Session {
    @Id
    @Column(name = "token_hash")
    private String tokenHash;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "expires_at", nullable = false)
    private String expiresAt;

    public String getTokenHash()          { return tokenHash; }
    public void setTokenHash(String v)    { this.tokenHash = v; }
    public String getUserId()             { return userId; }
    public void setUserId(String v)       { this.userId = v; }
    public String getExpiresAt()          { return expiresAt; }
    public void setExpiresAt(String v)    { this.expiresAt = v; }
}