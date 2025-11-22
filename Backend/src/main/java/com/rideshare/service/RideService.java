package com.rideshare.service;

import com.rideshare.dto.RideRequest;
import com.rideshare.dto.RideResponse;
import com.rideshare.model.Ride;
import com.rideshare.model.Role;
import com.rideshare.model.User;
import com.rideshare.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RideService {
    
    @Autowired
    private RideRepository rideRepository;
    
    @Autowired
    private UserService userService;
    
    public RideResponse postRide(RideRequest request) {
        User driver = userService.getCurrentUser();
        
        if (driver.getRole() != Role.DRIVER) {
            throw new RuntimeException("Only drivers can post rides");
        }
        
        Ride ride = new Ride();
        ride.setSource(request.getSource());
        ride.setDestination(request.getDestination());
        ride.setDepartureDateTime(request.getDepartureDateTime());
        ride.setAvailableSeats(request.getAvailableSeats());
        ride.setTotalSeats(request.getAvailableSeats());
        ride.setPricePerKm(request.getPricePerKm());
        ride.setDriver(driver);
        ride.setStatus("ACTIVE");
        
        Ride savedRide = rideRepository.save(ride);
        return RideResponse.fromRide(savedRide);
    }
    
    public RideResponse updateRide(Long id, RideRequest request) {
        User currentUser = userService.getCurrentUser();
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to edit this ride");
        }

        ride.setSource(request.getSource());
        ride.setDestination(request.getDestination());
        ride.setDepartureDateTime(request.getDepartureDateTime());
        // Assuming updating available seats resets the capacity logic for simplicity in Milestone 1
        ride.setAvailableSeats(request.getAvailableSeats());
        ride.setTotalSeats(request.getAvailableSeats()); 
        ride.setPricePerKm(request.getPricePerKm());
        
        Ride updatedRide = rideRepository.save(ride);
        return RideResponse.fromRide(updatedRide);
    }

    public void deleteRide(Long id) {
        User currentUser = userService.getCurrentUser();
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to delete this ride");
        }

        rideRepository.delete(ride);
    }
    
    public List<RideResponse> searchRides(String source, String destination, LocalDateTime date) {
        if (date == null) {
            date = LocalDateTime.now();
        }
        List<Ride> rides = rideRepository.searchRides(source, destination, date);
        return rides.stream().map(RideResponse::fromRide).collect(Collectors.toList());
    }
    
    public List<RideResponse> getDriverRides() {
        User driver = userService.getCurrentUser();
        List<Ride> rides = rideRepository.findByDriverOrderByDepartureDateTimeDesc(driver);
        return rides.stream().map(RideResponse::fromRide).collect(Collectors.toList());
    }
    
    public RideResponse getRideById(Long id) {
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        return RideResponse.fromRide(ride);
    }
    
    public List<RideResponse> getAllActiveRides() {
        List<Ride> rides = rideRepository.findByStatusOrderByDepartureDateTimeAsc("ACTIVE");
        return rides.stream().map(RideResponse::fromRide).collect(Collectors.toList());
    }
}