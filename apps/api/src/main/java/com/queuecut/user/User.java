package com.queuecut.user;

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

    @Column(name = "email_verified")
    private boolean emailVerified = false;

    @Column(name = "verification_token_hash")
    private String verificationTokenHash;

    @Column(name = "verification_token_expires_at")
    private String verificationTokenExpiresAt;

    @Column(name = "reset_token_hash")
    private String resetTokenHash;

    @Column(name = "reset_token_expires_at")
    private String resetTokenExpiresAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean b) { this.emailVerified = b; }
    
    public String getVerificationTokenHash() { return verificationTokenHash; }
    public void setVerificationTokenHash(String s) { this.verificationTokenHash = s; }
    
    public String getVerificationTokenExpiresAt() { return verificationTokenExpiresAt; }
    public void setVerificationTokenExpiresAt(String s) { this.verificationTokenExpiresAt = s; }
    
    public String getResetTokenHash() { return resetTokenHash; }
    public void setResetTokenHash(String s) { this.resetTokenHash = s; }
    
    public String getResetTokenExpiresAt() { return resetTokenExpiresAt; }
    public void setResetTokenExpiresAt(String s) { this.resetTokenExpiresAt = s; }
}