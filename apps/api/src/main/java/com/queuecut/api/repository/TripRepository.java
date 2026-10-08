package com.queuecut.api.repository;

import com.queuecut.api.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TripRepository extends JpaRepository<Trip, String> {
    List<Trip> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Trip> findByIdAndUserId(String id, String userId);
}