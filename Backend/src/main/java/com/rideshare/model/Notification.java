package com.rideshare.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;
    
    @Column(nullable = false)
    private String type; // BOOKING_NEW, RIDE_CANCELLED, etc.
    
    @Column(nullable = false)
    private String message;
    
    private Long relatedId; // RideID or BookingID
    
    @Column(nullable = false)
    private boolean isRead = false;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}