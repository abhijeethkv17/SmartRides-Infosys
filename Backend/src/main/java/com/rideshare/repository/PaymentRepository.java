package com.rideshare.repository;

import com.rideshare.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

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

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS'")
    Double getTotalRevenue();

    @Query("SELECT SUM(p.platformCommission) FROM Payment p WHERE p.status = 'SUCCESS'")
    Double getTotalPlatformCommission();

    @Query("SELECT SUM(p.driverEarnings) FROM Payment p WHERE p.status = 'SUCCESS'")
    Double getTotalDriverEarnings();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS' AND DATE(p.createdAt) = CURRENT_DATE")
    Double getRevenueToday();

    @Query("SELECT SUM(p.driverEarnings) FROM Payment p WHERE p.status = 'SUCCESS' AND p.driver.id = :driverId")
    Double getTotalEarningsForDriver(@Param("driverId") Long driverId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS' AND p.passenger.id = :passengerId")
    Double getTotalSpentByPassenger(@Param("passengerId") Long passengerId);

    List<Payment> findAllByOrderByCreatedAtDesc();

    List<Payment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByStatus(String status);
    }