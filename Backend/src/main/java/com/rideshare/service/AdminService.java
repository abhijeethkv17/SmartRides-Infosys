package com.rideshare.service;

import com.rideshare.dto.*;
import com.rideshare.model.*;
import com.rideshare.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RideRepository rideRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private NotificationService notificationService;

    /**
     * Get dashboard statistics
     */
    public AdminDashboardStats getDashboardStatistics() {
        AdminDashboardStats stats = new AdminDashboardStats();
        
        // User statistics
        long totalUsers = userRepository.count();
        long totalDrivers = userRepository.countByRole(Role.DRIVER);
        long totalPassengers = userRepository.countByRole(Role.PASSENGER);
        long activeUsersToday = userRepository.countActiveUsersToday();
        
        stats.setTotalUsers(totalUsers);
        stats.setTotalDrivers(totalDrivers);
        stats.setTotalPassengers(totalPassengers);
        stats.setActiveUsersToday(activeUsersToday);
        
        // Ride statistics
        long totalRides = rideRepository.count();
        long activeRides = rideRepository.countByStatus("ACTIVE");
        long completedRides = rideRepository.countByStatus("COMPLETED");
        long cancelledRides = rideRepository.countByStatus("CANCELLED");
        
        stats.setTotalRides(totalRides);
        stats.setActiveRides(activeRides);
        stats.setCompletedRides(completedRides);
        stats.setCancelledRides(cancelledRides);
        
        // Booking statistics
        long totalBookings = bookingRepository.count();
        long confirmedBookings = bookingRepository.countByStatus("CONFIRMED");
        long completedBookings = bookingRepository.countByStatus("COMPLETED");
        
        stats.setTotalBookings(totalBookings);
        stats.setConfirmedBookings(confirmedBookings);
        stats.setCompletedBookings(completedBookings);
        
        // Payment statistics
        Double totalRevenue = paymentRepository.getTotalRevenue();
        Double platformCommission = paymentRepository.getTotalPlatformCommission();
        Double driverEarnings = paymentRepository.getTotalDriverEarnings();
        long successfulPayments = paymentRepository.countByStatus("SUCCESS");
        
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : 0.0);
        stats.setPlatformCommission(platformCommission != null ? platformCommission : 0.0);
        stats.setDriverEarnings(driverEarnings != null ? driverEarnings : 0.0);
        stats.setSuccessfulPayments(successfulPayments);
        
        // Recent activity
        stats.setRidesToday(rideRepository.countRidesCreatedToday());
        stats.setBookingsToday(bookingRepository.countBookingsToday());
        stats.setRevenueToday(paymentRepository.getRevenueToday());
        
        // Growth metrics
        stats.setUserGrowthRate(calculateGrowthRate("users"));
        stats.setRideGrowthRate(calculateGrowthRate("rides"));
        stats.setRevenueGrowthRate(calculateGrowthRate("revenue"));
        
        return stats;
    }
    
    /**
     * Get all users with filtering
     */
    public List<UserManagementDTO> getAllUsers(String role, String status, String search) {
        List<User> users;
        
        if (search != null && !search.isEmpty()) {
            users = userRepository.searchUsers(search);
        } else if (role != null && !role.isEmpty()) {
            users = userRepository.findByRole(Role.valueOf(role));
        } else {
            users = userRepository.findAll();
        }
        
        return users.stream()
                .map(this::convertToUserManagementDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get user details with activity
     */
    public Map<String, Object> getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> details = new HashMap<>();
        details.put("user", convertToUserManagementDTO(user));
        
        if (user.getRole() == Role.DRIVER) {
            List<Ride> rides = rideRepository.findByDriverOrderByDepartureDateTimeDesc(user);
            List<Booking> bookings = bookingRepository.findByRideDriverOrderByBookingTimeDesc(user);
            Double earnings = paymentRepository.getTotalEarningsForDriver(user.getId());
            
            details.put("totalRides", rides.size());
            details.put("totalBookings", bookings.size());
            details.put("totalEarnings", earnings != null ? earnings : 0.0);
            details.put("recentRides", rides.stream().limit(10).collect(Collectors.toList()));
        } else {
            List<Booking> bookings = bookingRepository.findByPassengerOrderByBookingTimeDesc(user);
            Double spent = paymentRepository.getTotalSpentByPassenger(user.getId());
            
            details.put("totalBookings", bookings.size());
            details.put("totalSpent", spent != null ? spent : 0.0);
            details.put("recentBookings", bookings.stream().limit(10).collect(Collectors.toList()));
        }
        
        // Reviews
        Double avgRating = reviewRepository.getAverageRatingForUser(userId);
        Long totalReviews = reviewRepository.getTotalReviewsForUser(userId);
        
        details.put("averageRating", avgRating != null ? avgRating : 0.0);
        details.put("totalReviews", totalReviews);
        
        return details;
    }
    
    /**
     * Toggle user block status
     */
    @Transactional
    public UserManagementDTO toggleUserBlock(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setBlocked(!user.isBlocked());
        User updated = userRepository.save(user);
        
        // Send notification to user
        String message = user.isBlocked() 
                ? "Your account has been blocked by admin. Contact support for details."
                : "Your account has been unblocked. You can now use the platform.";
        
        try {
            notificationService.sendNotification(user, "ACCOUNT_STATUS", message, null);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
        
        return convertToUserManagementDTO(updated);
    }
    
    /**
     * Verify driver
     */
    @Transactional
    public UserManagementDTO verifyDriver(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != Role.DRIVER) {
            throw new RuntimeException("User is not a driver");
        }
        
        user.setVerified(true);
        User updated = userRepository.save(user);
        
        // Send notification
        try {
            notificationService.sendNotification(
                    user,
                    "DRIVER_VERIFIED",
                    "Congratulations! Your driver account has been verified by admin.",
                    null
            );
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
        
        return convertToUserManagementDTO(updated);
    }
    
    /**
     * Get all rides with filtering
     */
    public List<RideResponse> getAllRides(String status, String search) {
        List<Ride> rides;
        
        if (search != null && !search.isEmpty()) {
            rides = rideRepository.searchRidesByRoute(search);
        } else if (status != null && !status.isEmpty()) {
            rides = rideRepository.findByStatusOrderByDepartureDateTimeDesc(status);
        } else {
            rides = rideRepository.findAllByOrderByDepartureDateTimeDesc();
        }
        
        return rides.stream()
                .map(RideResponse::fromRide)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all bookings
     */
    public List<BookingResponse> getAllBookings(String status) {
        List<Booking> bookings;
        
        if (status != null && !status.isEmpty()) {
            bookings = bookingRepository.findByStatusOrderByBookingTimeDesc(status);
        } else {
            bookings = bookingRepository.findAllByOrderByBookingTimeDesc();
        }
        
        return bookings.stream()
                .map(BookingResponse::fromBooking)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all payments
     */
    public List<Payment> getAllPayments(String status) {
        if (status != null && !status.isEmpty()) {
            return paymentRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            return paymentRepository.findAllByOrderByCreatedAtDesc();
        }
    }
    
    /**
     * Cancel ride (admin action)
     */
    @Transactional
    public void cancelRide(Long rideId, String reason) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        
        if (!"ACTIVE".equals(ride.getStatus())) {
            throw new RuntimeException("Only active rides can be cancelled");
        }
        
        ride.setStatus("CANCELLED");
        rideRepository.save(ride);
        
        // Notify driver
        try {
            notificationService.sendNotification(
                    ride.getDriver(),
                    "RIDE_CANCELLED_ADMIN",
                    "Your ride has been cancelled by admin. Reason: " + reason,
                    ride.getId()
            );
        } catch (Exception e) {
            System.err.println("Failed to notify driver: " + e.getMessage());
        }
        
        // Notify passengers and cancel bookings
        List<Booking> bookings = bookingRepository.findByRide(ride);
        for (Booking booking : bookings) {
            if ("CONFIRMED".equals(booking.getStatus())) {
                booking.setStatus("CANCELLED");
                bookingRepository.save(booking);
                
                try {
                    notificationService.sendNotification(
                            booking.getPassenger(),
                            "RIDE_CANCELLED_ADMIN",
                            "Your booked ride has been cancelled by admin. Reason: " + reason,
                            booking.getId()
                    );
                } catch (Exception e) {
                    System.err.println("Failed to notify passenger: " + e.getMessage());
                }
            }
        }
    }
    
    /**
     * Get analytics for date range
     */
    public Map<String, Object> getAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Rides analytics
        List<Ride> rides = rideRepository.findByCreatedAtBetween(startDate, endDate);
        analytics.put("ridesCreated", rides.size());
        analytics.put("ridesCompleted", rides.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count());
        
        // Bookings analytics
        List<Booking> bookings = bookingRepository.findByBookingTimeBetween(startDate, endDate);
        analytics.put("bookingsCreated", bookings.size());
        analytics.put("bookingsCompleted", bookings.stream().filter(b -> "COMPLETED".equals(b.getStatus())).count());
        
        // Revenue analytics
        List<Payment> payments = paymentRepository.findByCreatedAtBetween(startDate, endDate);
        Double revenue = payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum();
        
        analytics.put("totalRevenue", revenue);
        analytics.put("successfulPayments", payments.stream().filter(p -> "SUCCESS".equals(p.getStatus())).count());
        
        // User analytics
        List<User> newUsers = userRepository.findByCreatedAtBetween(startDate, endDate);
        analytics.put("newUsers", newUsers.size());
        analytics.put("newDrivers", newUsers.stream().filter(u -> u.getRole() == Role.DRIVER).count());
        analytics.put("newPassengers", newUsers.stream().filter(u -> u.getRole() == Role.PASSENGER).count());
        
        return analytics;
    }
    
    /**
     * Generate report
     */
    public Map<String, Object> generateReport(String reportType, LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> report = new HashMap<>();
        report.put("reportType", reportType);
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        report.put("generatedAt", LocalDateTime.now());
        
        switch (reportType.toUpperCase()) {
            case "REVENUE":
                report.put("data", generateRevenueReport(startDate, endDate));
                break;
            case "RIDES":
                report.put("data", generateRidesReport(startDate, endDate));
                break;
            case "USERS":
                report.put("data", generateUsersReport(startDate, endDate));
                break;
            case "COMPREHENSIVE":
                report.put("data", generateComprehensiveReport(startDate, endDate));
                break;
            default:
                throw new RuntimeException("Invalid report type");
        }
        
        return report;
    }
    
    /**
     * Get activity logs
     */
    public List<Map<String, Object>> getActivityLogs(int page, int size) {
        List<Map<String, Object>> logs = new ArrayList<>();
        
        // Get recent rides
        List<Ride> recentRides = rideRepository.findAll(PageRequest.of(page, size / 3)).getContent();
        for (Ride ride : recentRides) {
            Map<String, Object> log = new HashMap<>();
            log.put("timestamp", ride.getCreatedAt());
            log.put("type", "RIDE_CREATED");
            log.put("user", ride.getDriver().getName());
            log.put("details", ride.getSource() + " → " + ride.getDestination());
            logs.add(log);
        }
        
        // Get recent bookings
        List<Booking> recentBookings = bookingRepository.findAll(PageRequest.of(page, size / 3)).getContent();
        for (Booking booking : recentBookings) {
            Map<String, Object> log = new HashMap<>();
            log.put("timestamp", booking.getBookingTime());
            log.put("type", "BOOKING_CREATED");
            log.put("user", booking.getPassenger().getName());
            log.put("details", booking.getSeatsBooked() + " seats");
            logs.add(log);
        }
        
        // Sort by timestamp
        logs.sort((a, b) -> ((LocalDateTime) b.get("timestamp")).compareTo((LocalDateTime) a.get("timestamp")));
        
        return logs;
    }
    
    // Helper methods
    
    private UserManagementDTO convertToUserManagementDTO(User user) {
        UserManagementDTO dto = new UserManagementDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setBlocked(user.isBlocked());
        dto.setVerified(user.isVerified());
        dto.setCreatedAt(user.getCreatedAt());
        
        if (user.getRole() == Role.DRIVER) {
            dto.setCarModel(user.getCarModel());
            dto.setLicensePlate(user.getLicensePlate());
            dto.setVehicleCapacity(user.getVehicleCapacity());
        }
        
        Double avgRating = reviewRepository.getAverageRatingForUser(user.getId());
        dto.setAverageRating(avgRating != null ? avgRating : 0.0);
        
        return dto;
    }
    
    private Double calculateGrowthRate(String metric) {
        // Simplified growth rate calculation
        return 0.0;
    }
    
    private Map<String, Object> generateRevenueReport(LocalDateTime start, LocalDateTime end) {
        List<Payment> payments = paymentRepository.findByCreatedAtBetween(start, end);
        Map<String, Object> report = new HashMap<>();
        
        report.put("totalTransactions", payments.size());
        report.put("successfulTransactions", payments.stream().filter(p -> "SUCCESS".equals(p.getStatus())).count());
        report.put("totalRevenue", payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum());
        report.put("platformCommission", payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .mapToDouble(Payment::getPlatformCommission)
                .sum());
        
        return report;
    }
    
    private Map<String, Object> generateRidesReport(LocalDateTime start, LocalDateTime end) {
        List<Ride> rides = rideRepository.findByCreatedAtBetween(start, end);
        Map<String, Object> report = new HashMap<>();
        
        report.put("totalRides", rides.size());
        report.put("completedRides", rides.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count());
        report.put("cancelledRides", rides.stream().filter(r -> "CANCELLED".equals(r.getStatus())).count());
        report.put("completionRate", calculateCompletionRate(rides));
        
        return report;
    }
    
    private Map<String, Object> generateUsersReport(LocalDateTime start, LocalDateTime end) {
        List<User> users = userRepository.findByCreatedAtBetween(start, end);
        Map<String, Object> report = new HashMap<>();
        
        report.put("newUsers", users.size());
        report.put("newDrivers", users.stream().filter(u -> u.getRole() == Role.DRIVER).count());
        report.put("newPassengers", users.stream().filter(u -> u.getRole() == Role.PASSENGER).count());
        
        return report;
    }
    
    private Map<String, Object> generateComprehensiveReport(LocalDateTime start, LocalDateTime end) {
        Map<String, Object> report = new HashMap<>();
        report.put("revenue", generateRevenueReport(start, end));
        report.put("rides", generateRidesReport(start, end));
        report.put("users", generateUsersReport(start, end));
        return report;
    }
    
    private Double calculateCompletionRate(List<Ride> rides) {
        if (rides.isEmpty()) return 0.0;
        long completed = rides.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();
        return (completed * 100.0) / rides.size();
    }
}