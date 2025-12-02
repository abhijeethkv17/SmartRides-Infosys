package com.rideshare.repository;

import com.rideshare.model.Notification;
import com.rideshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Fetch unread notifications sorted by newest first
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);
    
    // Optional: Fetch all recent notifications
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
}