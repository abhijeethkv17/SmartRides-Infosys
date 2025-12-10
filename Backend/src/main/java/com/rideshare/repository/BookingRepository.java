package com.rideshare.repository;

import com.rideshare.model.Booking;
import com.rideshare.model.Ride;
import com.rideshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPassengerOrderByBookingTimeDesc(User passenger);
    List<Booking> findByRideDriverOrderByBookingTimeDesc(User driver);
    
    // NEW: Find all bookings for a specific ride
    List<Booking> findByRide(Ride ride);

    Long countByStatus(String status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE DATE(b.bookingTime) = CURRENT_DATE")
    Long countBookingsToday();

    List<Booking> findAllByOrderByBookingTimeDesc();

    List<Booking> findByStatusOrderByBookingTimeDesc(String status);

    List<Booking> findByBookingTimeBetween(LocalDateTime start, LocalDateTime end);
}