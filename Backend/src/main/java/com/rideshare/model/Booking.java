package com.rideshare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ride_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"bookings"})
    private Ride ride;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "passenger_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"ridesPosted", "bookings", "password"})
    private User passenger;
    
    @NotNull(message = "Number of seats is required")
    @Min(value = 1, message = "At least 1 seat must be booked")
    @Column(nullable = false)
    private Integer seatsBooked;
    
    @Column(nullable = false)
    private String pickupLocation;
    
    @Column(nullable = false)
    private String dropLocation;
    
    @Column(nullable = false)
    private Double estimatedFare;
    
    @Column(nullable = false)
    private String status = "CONFIRMED"; // CONFIRMED, CANCELLED, COMPLETED
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime bookingTime;
}