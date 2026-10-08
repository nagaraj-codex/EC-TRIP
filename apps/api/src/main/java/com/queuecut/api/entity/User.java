package com.queuecut.api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    public String getId()            { return id; }
    public void setId(String id)     { this.id = id; }
    public String getName()          { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail()         { return email; }
    public void setEmail(String e)   { this.email = e; }
    public String getPasswordHash()  { return passwordHash; }
    public void setPasswordHash(String h) { this.passwordHash = h; }
    public String getCreatedAt()     { return createdAt; }
    public void setCreatedAt(String c) { this.createdAt = c; }
}