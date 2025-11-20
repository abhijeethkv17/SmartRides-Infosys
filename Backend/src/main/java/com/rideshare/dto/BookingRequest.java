package com.rideshare.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {
    
    @NotNull(message = "Ride ID is required")
    private Long rideId;
    
    @NotNull(message = "Number of seats is required")
    @Min(value = 1, message = "At least 1 seat must be booked")
    private Integer seatsBooked;
    
    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;
    
    @NotBlank(message = "Drop location is required")
    private String dropLocation;
    
    @NotNull(message = "Distance is required for fare calculation")
    @Min(value = 1, message = "Distance must be at least 1 km")
    private Double distanceKm;
}