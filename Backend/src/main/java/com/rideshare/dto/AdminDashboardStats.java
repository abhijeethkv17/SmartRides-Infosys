// AdminDashboardStats.java
package com.rideshare.dto;

import lombok.Data;

@Data
public class AdminDashboardStats {
    // User statistics
    private Long totalUsers;
    private Long totalDrivers;
    private Long totalPassengers;
    private Long activeUsersToday;
    
    // Ride statistics
    private Long totalRides;
    private Long activeRides;
    private Long completedRides;
    private Long cancelledRides;
    
    // Booking statistics
    private Long totalBookings;
    private Long confirmedBookings;
    private Long completedBookings;
    
    // Payment statistics
    private Double totalRevenue;
    private Double platformCommission;
    private Double driverEarnings;
    private Long successfulPayments;
    
    // Today's activity
    private Long ridesToday;
    private Long bookingsToday;
    private Double revenueToday;
    
    // Growth rates (percentage)
    private Double userGrowthRate;
    private Double rideGrowthRate;
    private Double revenueGrowthRate;
}

