package com.rideshare.controller;

import com.rideshare.dto.*;
import com.rideshare.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            AdminDashboardStats stats = adminService.getDashboardStatistics();
            return ResponseEntity.ok(new ApiResponse(true, "Statistics retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get all users with filtering
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        try {
            var users = adminService.getAllUsers(role, status, search);
            return ResponseEntity.ok(new ApiResponse(true, "Users retrieved successfully", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get user details by ID
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserDetails(@PathVariable Long userId) {
        try {
            var userDetails = adminService.getUserDetails(userId);
            return ResponseEntity.ok(new ApiResponse(true, "User details retrieved", userDetails));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Block/Unblock user
     */
    @PutMapping("/users/{userId}/toggle-block")
    public ResponseEntity<?> toggleUserBlock(@PathVariable Long userId) {
        try {
            var user = adminService.toggleUserBlock(userId);
            return ResponseEntity.ok(new ApiResponse(true, "User status updated", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Verify driver
     */
    @PutMapping("/users/{userId}/verify-driver")
    public ResponseEntity<?> verifyDriver(@PathVariable Long userId) {
        try {
            var user = adminService.verifyDriver(userId);
            return ResponseEntity.ok(new ApiResponse(true, "Driver verified successfully", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get all rides with filtering
     */
    @GetMapping("/rides")
    public ResponseEntity<?> getAllRides(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        try {
            var rides = adminService.getAllRides(status, search);
            return ResponseEntity.ok(new ApiResponse(true, "Rides retrieved successfully", rides));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get all bookings with filtering
     */
    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings(
            @RequestParam(required = false) String status) {
        try {
            var bookings = adminService.getAllBookings(status);
            return ResponseEntity.ok(new ApiResponse(true, "Bookings retrieved successfully", bookings));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get all payments
     */
    @GetMapping("/payments")
    public ResponseEntity<?> getAllPayments(
            @RequestParam(required = false) String status) {
        try {
            var payments = adminService.getAllPayments(status);
            return ResponseEntity.ok(new ApiResponse(true, "Payments retrieved successfully", payments));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Cancel ride (admin action)
     */
    @PutMapping("/rides/{rideId}/cancel")
    public ResponseEntity<?> cancelRide(
            @PathVariable Long rideId,
            @RequestParam String reason) {
        try {
            adminService.cancelRide(rideId, reason);
            return ResponseEntity.ok(new ApiResponse(true, "Ride cancelled by admin"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get platform analytics
     */
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            var analytics = adminService.getAnalytics(startDate, endDate);
            return ResponseEntity.ok(new ApiResponse(true, "Analytics retrieved", analytics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Generate report
     */
    @GetMapping("/reports/generate")
    public ResponseEntity<?> generateReport(
            @RequestParam String reportType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            var report = adminService.generateReport(reportType, startDate, endDate);
            return ResponseEntity.ok(new ApiResponse(true, "Report generated", report));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get recent activity logs
     */
    @GetMapping("/activity-logs")
    public ResponseEntity<?> getActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            var logs = adminService.getActivityLogs(page, size);
            return ResponseEntity.ok(new ApiResponse(true, "Activity logs retrieved", logs));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}