package com.rideshare.service;

import com.rideshare.dto.RideRequest;
import com.rideshare.dto.RideResponse;
import com.rideshare.model.Booking;
import com.rideshare.model.Ride;
import com.rideshare.model.Role;
import com.rideshare.model.User;
import com.rideshare.repository.BookingRepository;
import com.rideshare.repository.ReviewRepository;
import com.rideshare.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RideService {
    
    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private RouteMatchingService routeMatchingService;

    @Autowired
    private ReviewRepository reviewRepository;

    // Helper method to populate driver rating
    private void populateDriverRating(RideResponse response) {
        if (response.getDriver() != null) {
            Double rating = reviewRepository.getAverageRatingForUser(response.getDriver().getId());
            response.getDriver().setAverageRating(rating != null ? rating : 0.0);
        }
    }
    
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
    
    @Transactional
    public RideResponse completeRide(Long id) {
        User currentUser = userService.getCurrentUser();
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to complete this ride");
        }
        
        if (!ride.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("Only active rides can be marked as completed");
        }

        ride.setStatus("COMPLETED");
        Ride completedRide = rideRepository.save(ride);
        
        List<Booking> bookings = bookingRepository.findByRide(ride);
        for (Booking booking : bookings) {
            if ("CONFIRMED".equals(booking.getStatus())) {
                booking.setStatus("COMPLETED");
                bookingRepository.save(booking);
                
                try {
                    notificationService.sendNotification(
                        booking.getPassenger(),
                        "RIDE_COMPLETED",
                        "Your ride has arrived! Please rate your experience.",
                        ride.getId()
                    );
                } catch (Exception e) {
                    System.err.println("Failed to notify passenger: " + e.getMessage());
                }
            }
        }
        
        return RideResponse.fromRide(completedRide);
    }
    
    public RideResponse cancelRide(Long id) {
        User currentUser = userService.getCurrentUser();
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to cancel this ride");
        }
        
        if (!ride.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("Only active rides can be cancelled");
        }

        ride.setStatus("CANCELLED");
        Ride cancelledRide = rideRepository.save(ride);
        
        List<Booking> bookings = bookingRepository.findByRide(ride);
        
        for (Booking booking : bookings) {
            try {
                notificationService.sendNotification(
                    booking.getPassenger(),
                    "RIDE_CANCELLED",
                    "Alert: Your ride from " + ride.getSource() + " to " + ride.getDestination() + " has been cancelled by the driver.",
                    ride.getId()
                );
            } catch (Exception e) {
                System.err.println("Failed to notify passenger: " + e.getMessage());
            }
            
            booking.setStatus("CANCELLED");
            bookingRepository.save(booking);
        }
        
        return RideResponse.fromRide(cancelledRide);
    }
    
    public List<RideResponse> searchRides(String source, String destination, LocalDate date) {
        LocalDateTime startDateTime;
        LocalDateTime endDateTime;

        if (date != null) {
            startDateTime = date.atStartOfDay();
            endDateTime = date.plusDays(1).atStartOfDay();
        } else {
            startDateTime = LocalDateTime.now();
            endDateTime = startDateTime.plusYears(100); 
        }
        
        List<Ride> allRides = rideRepository.searchRides(source, destination, startDateTime, endDateTime);
        
        List<RouteMatchingService.RideMatch> matches = 
                routeMatchingService.matchRides(allRides, source, destination);
        
        List<RideResponse> responses = new ArrayList<>();
        
        for (RouteMatchingService.RideMatch match : matches) {
            RideResponse response = RideResponse.fromRide(match.getRide());
            
            // Populate Driver Rating
            populateDriverRating(response);

            response.setMatchType(match.getMatchType().name());
            response.setMatchScore(match.getMatchScore());
            response.setMatchDescription(match.getMatchDescription());
            response.setExtraDistanceKm(match.getExtraDistanceKm());
            response.setSuggestedPickup(match.getSuggestedPickup());
            response.setSuggestedDrop(match.getSuggestedDrop());
            
            responses.add(response);
        }
        
        return responses;
    }
    
    public List<RideResponse> getDriverRides() {
        User driver = userService.getCurrentUser();
        List<Ride> rides = rideRepository.findByDriverOrderByDepartureDateTimeDesc(driver);
        // Note: We don't necessarily need to populate the driver's own rating for their own dashboard view of rides,
        // but if needed, we can add it here.
        return rides.stream().map(RideResponse::fromRide).collect(Collectors.toList());
    }
    
    public RideResponse getRideById(Long id) {
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        RideResponse response = RideResponse.fromRide(ride);
        populateDriverRating(response);
        return response;
    }
    
    public List<RideResponse> getAllActiveRides() {
        List<Ride> rides = rideRepository.findByStatusOrderByDepartureDateTimeAsc("ACTIVE");
        List<RideResponse> responses = rides.stream()
                .map(RideResponse::fromRide)
                .collect(Collectors.toList());
        
        // Populate ratings
        responses.forEach(this::populateDriverRating);
        
        return responses;
    }
}