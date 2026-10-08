package com.queuecut.api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "trips")
public class Trip {
    @Id
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "park_id", nullable = false)
    private String parkId;

    @Column(name = "visit_date", nullable = false)
    private String visitDate;

    @Column(name = "payload", nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    public String getId()              { return id; }
    public void setId(String id)       { this.id = id; }
    public String getUserId()          { return userId; }
    public void setUserId(String v)    { this.userId = v; }
    public String getParkId()          { return parkId; }
    public void setParkId(String v)    { this.parkId = v; }
    public String getVisitDate()       { return visitDate; }
    public void setVisitDate(String v) { this.visitDate = v; }
    public String getPayload()         { return payload; }
    public void setPayload(String v)   { this.payload = v; }
    public String getCreatedAt()       { return createdAt; }
    public void setCreatedAt(String v) { this.createdAt = v; }
}