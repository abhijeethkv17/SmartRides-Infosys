package com.rideshare.repository;

import com.rideshare.model.Payment;
import com.rideshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByBookingId(Long bookingId);
    
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);
    
    List<Payment> findByPassengerOrderByCreatedAtDesc(User passenger);
    
    List<Payment> findByDriverOrderByCreatedAtDesc(User driver);
    
    List<Payment> findByStatusOrderByCreatedAtDesc(String status);
    
    List<Payment> findByDriverAndStatusOrderByCreatedAtDesc(User driver, String status);
}