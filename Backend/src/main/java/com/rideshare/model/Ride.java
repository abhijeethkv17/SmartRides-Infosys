package com.rideshare.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rides")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ride {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Source is required")
    @Column(nullable = false)
    private String source;
    
    @NotBlank(message = "Destination is required")
    @Column(nullable = false)
    private String destination;
    
    @NotNull(message = "Departure date and time is required")
    @Column(nullable = false)
    private LocalDateTime departureDateTime;
    
    @NotNull(message = "Available seats is required")
    @Min(value = 1, message = "At least 1 seat must be available")
    @Column(nullable = false)
    private Integer availableSeats;
    
    @Column(nullable = false)
    private Integer totalSeats;
    
    @NotNull(message = "Price per km is required")
    @Min(value = 0, message = "Price must be positive")
    private Double pricePerKm;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "driver_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"ridesPosted", "bookings", "password"})
    private User driver;
    
    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Booking> bookings = new ArrayList<>();
    
    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, CANCELLED
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}