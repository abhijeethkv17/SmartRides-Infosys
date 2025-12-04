package com.rideshare.dto;

import com.rideshare.model.Ride;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RideResponse {
    private Long id;
    private String source;
    private String destination;
    private LocalDateTime departureDateTime;
    private Integer availableSeats;
    private Integer totalSeats;
    private Double pricePerKm;
    private String status;
    private LocalDateTime createdAt;
    private DriverInfo driver;
    
    // NEW: Route matching metadata
    private String matchType;           // EXACT, ALONG_ROUTE, PARTIAL_DETOUR
    private Double matchScore;          // 0-100, higher is better
    private String matchDescription;    // Human-readable match explanation
    private Double extraDistanceKm;     // Extra distance for driver
    private String suggestedPickup;     // Suggested pickup location
    private String suggestedDrop;       // Suggested drop location
    
    @Data
    public static class DriverInfo {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String carModel;
        private String licensePlate;
        private Integer vehicleCapacity;
    }
    
    public static RideResponse fromRide(Ride ride) {
        RideResponse response = new RideResponse();
        response.setId(ride.getId());
        response.setSource(ride.getSource());
        response.setDestination(ride.getDestination());
        response.setDepartureDateTime(ride.getDepartureDateTime());
        response.setAvailableSeats(ride.getAvailableSeats());
        response.setTotalSeats(ride.getTotalSeats());
        response.setPricePerKm(ride.getPricePerKm());
        response.setStatus(ride.getStatus());
        response.setCreatedAt(ride.getCreatedAt());
        
        DriverInfo driverInfo = new DriverInfo();
        driverInfo.setId(ride.getDriver().getId());
        driverInfo.setName(ride.getDriver().getName());
        driverInfo.setEmail(ride.getDriver().getEmail());
        driverInfo.setPhone(ride.getDriver().getPhone());
        driverInfo.setCarModel(ride.getDriver().getCarModel());
        driverInfo.setLicensePlate(ride.getDriver().getLicensePlate());
        driverInfo.setVehicleCapacity(ride.getDriver().getVehicleCapacity());
        response.setDriver(driverInfo);
        
        return response;
    }
}