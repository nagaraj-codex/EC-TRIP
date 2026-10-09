package com.queuecut.api.repository;

import com.queuecut.api.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, String> {
    @Query("SELECT s FROM Session s WHERE s.tokenHash = :hash AND s.expiresAt > :now")
    Optional<Session> findValidSession(@Param("hash") String hash, @Param("now") String now);
    void deleteByTokenHash(String tokenHash);
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Session s WHERE s.userId = :userId")
    void deleteByUserId(@org.springframework.data.repository.query.Param("userId") String userId);
}
