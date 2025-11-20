package com.rideshare.service;

import com.rideshare.dto.BookingRequest;
import com.rideshare.dto.BookingResponse;
import com.rideshare.model.Booking;
import com.rideshare.model.Ride;
import com.rideshare.model.Role;
import com.rideshare.model.User;
import com.rideshare.repository.BookingRepository;
import com.rideshare.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private RideRepository rideRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmailService emailService;
    
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User passenger = userService.getCurrentUser();
        
        if (passenger.getRole() != Role.PASSENGER) {
            throw new RuntimeException("Only passengers can book rides");
        }
        
        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        
        if (ride.getAvailableSeats() < request.getSeatsBooked()) {
            throw new RuntimeException("Not enough seats available");
        }
        
        if (ride.getDriver().getId().equals(passenger.getId())) {
            throw new RuntimeException("Driver cannot book their own ride");
        }
        
        // Calculate fare
        Double estimatedFare = request.getDistanceKm() * ride.getPricePerKm() * request.getSeatsBooked();
        
        Booking booking = new Booking();
        booking.setRide(ride);
        booking.setPassenger(passenger);
        booking.setSeatsBooked(request.getSeatsBooked());
        booking.setPickupLocation(request.getPickupLocation());
        booking.setDropLocation(request.getDropLocation());
        booking.setEstimatedFare(estimatedFare);
        booking.setStatus("CONFIRMED");
        
        // Update available seats
        ride.setAvailableSeats(ride.getAvailableSeats() - request.getSeatsBooked());
        rideRepository.save(ride);
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // Send confirmation emails asynchronously
        try {
            // Send confirmation email to passenger
            emailService.sendBookingConfirmationToPassenger(savedBooking);
            
            // Send notification email to driver
            emailService.sendBookingNotificationToDriver(savedBooking);
            
            System.out.println("Booking confirmation emails sent successfully");
        } catch (Exception e) {
            System.err.println("Failed to send booking emails: " + e.getMessage());
            // Don't fail the booking if email sending fails
        }
        
        return BookingResponse.fromBooking(savedBooking);
    }
    
    public List<BookingResponse> getPassengerBookings() {
        User passenger = userService.getCurrentUser();
        List<Booking> bookings = bookingRepository.findByPassengerOrderByBookingTimeDesc(passenger);
        return bookings.stream().map(BookingResponse::fromBooking).collect(Collectors.toList());
    }
    
    public List<BookingResponse> getDriverBookings() {
        User driver = userService.getCurrentUser();
        List<Booking> bookings = bookingRepository.findByRideDriverOrderByBookingTimeDesc(driver);
        return bookings.stream().map(BookingResponse::fromBooking).collect(Collectors.toList());
    }
}