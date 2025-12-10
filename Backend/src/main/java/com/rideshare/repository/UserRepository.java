package com.rideshare.repository;

import com.rideshare.model.Role;
import com.rideshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

    Long countByRole(Role role);
    
    List<User> findByRole(Role role);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startOfDay")
    Long countActiveUsersToday(@Param("startOfDay") LocalDateTime startOfDay);
    
    default Long countActiveUsersToday() {
        return countActiveUsersToday(LocalDateTime.now().withHour(0).withMinute(0).withSecond(0));
    }

    List<User> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // 2. Fix for searchUsers
    // This searches for a user by name OR email (case-insensitive)
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchUsers(@Param("keyword") String keyword);
}