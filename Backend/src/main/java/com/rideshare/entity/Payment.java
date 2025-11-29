package com.rideshare.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @ManyToOne
    @JoinColumn(name = "passenger_id", nullable = false)
    private User passenger;
    
    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;
    
    @Column(nullable = false)
    private Double amount;
    
    @Column(nullable = false)
    private String currency = "INR";
    
    // Payment gateway fields
    @Column(unique = true)
    private String razorpayOrderId;
    
    @Column(unique = true)
    private String razorpayPaymentId;
    
    private String razorpaySignature;
    
    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, SUCCESS, FAILED, REFUNDED
    
    @Column(length = 1000)
    private String failureReason;
    
    // Commission calculation
    @Column(nullable = false)
    private Double platformCommission;
    
    @Column(nullable = false)
    private Double driverEarnings;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime completedAt;
    
    private LocalDateTime refundedAt;
}