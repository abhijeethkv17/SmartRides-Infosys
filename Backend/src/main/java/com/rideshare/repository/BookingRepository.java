package com.rideshare.repository;

import com.rideshare.model.Booking;
import com.rideshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPassengerOrderByBookingTimeDesc(User passenger);
    List<Booking> findByRideDriverOrderByBookingTimeDesc(User driver);
}