package com.queuecut.api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "crowd_observations")
public class CrowdObservation {
    @Id
    private String id;

    @Column(name = "park_id", nullable = false)
    private String parkId;

    @Column(name = "visit_date", nullable = false)
    private String visitDate;

    @Column(name = "observed_crowd", nullable = false)
    private String observedCrowd;

    @Column(name = "observed_wait_top_ride_minutes", nullable = false)
    private int observedWaitTopRideMinutes;

    @Column(name = "fasttrack_purchased", nullable = false)
    private int fasttrackPurchased;

    @Column(name = "location_proximity_checked", nullable = false)
    private int locationProximityChecked;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    public String getId()                { return id; }
    public void setId(String id)         { this.id = id; }
    public String getParkId()            { return parkId; }
    public void setParkId(String v)      { this.parkId = v; }
    public String getVisitDate()         { return visitDate; }
    public void setVisitDate(String v)   { this.visitDate = v; }
    public String getObservedCrowd()     { return observedCrowd; }
    public void setObservedCrowd(String v) { this.observedCrowd = v; }
    public int getObservedWaitTopRideMinutes() { return observedWaitTopRideMinutes; }
    public void setObservedWaitTopRideMinutes(int v) { this.observedWaitTopRideMinutes = v; }
    public boolean isFasttrackPurchased() { return fasttrackPurchased != 0; }
    public void setFasttrackPurchased(int v) { this.fasttrackPurchased = v; }
    public boolean isLocationProximityChecked() { return locationProximityChecked != 0; }
    public void setLocationProximityChecked(int v) { this.locationProximityChecked = v; }
    public String getCreatedAt()         { return createdAt; }
    public void setCreatedAt(String v)   { this.createdAt = v; }
}