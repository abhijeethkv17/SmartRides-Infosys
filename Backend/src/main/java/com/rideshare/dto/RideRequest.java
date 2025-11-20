package com.rideshare.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RideRequest {
    
    @NotBlank(message = "Source is required")
    private String source;
    
    @NotBlank(message = "Destination is required")
    private String destination;
    
    @NotNull(message = "Departure date and time is required")
    private LocalDateTime departureDateTime;
    
    @NotNull(message = "Available seats is required")
    @Min(value = 1, message = "At least 1 seat must be available")
    private Integer availableSeats;
    
    @NotNull(message = "Price per km is required")
    @Min(value = 0, message = "Price must be positive")
    private Double pricePerKm;
}