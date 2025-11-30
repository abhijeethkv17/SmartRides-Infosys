package com.rideshare.repository;

import com.rideshare.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByBookingId(Long bookingId);
    
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);
    
    // UPDATED: Use underscore to explicitly traverse to the ID property
    List<Payment> findByPassenger_IdOrderByCreatedAtDesc(Long passengerId);
    
    // UPDATED: Use underscore to explicitly traverse to the ID property
    List<Payment> findByDriver_IdOrderByCreatedAtDesc(Long driverId);
    
    List<Payment> findByStatusOrderByCreatedAtDesc(String status);
    
    // UPDATED: Use underscore to explicitly traverse to the ID property
    List<Payment> findByDriver_IdAndStatusOrderByCreatedAtDesc(Long driverId, String status);
}