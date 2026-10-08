package com.queuecut.api.repository;

import com.queuecut.api.entity.CrowdObservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface CrowdObservationRepository extends JpaRepository<CrowdObservation, String> {
    List<CrowdObservation> findByParkIdAndVisitDateOrderByCreatedAtDesc(String parkId, String visitDate);

    @Modifying @Transactional
    @Query("DELETE FROM CrowdObservation co WHERE co.createdAt < :cutoff")
    void deleteOlderThan(@Param("cutoff") String cutoff);
}