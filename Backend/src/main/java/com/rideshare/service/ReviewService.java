package com.rideshare.service;

import com.rideshare.dto.ReviewRequest;
import com.rideshare.model.*;
import com.rideshare.repository.BookingRepository;
import com.rideshare.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Submit a review for a completed booking
     */
    @Transactional
    public Review submitReview(ReviewRequest request) {
        User currentUser = userService.getCurrentUser();
        
        // Get booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Validate: Only completed bookings can be reviewed
        if (!"COMPLETED".equals(booking.getStatus())) {
            throw new RuntimeException("Only completed rides can be reviewed");
        }
        
        // Validate: Ride must be completed
        if (!"COMPLETED".equals(booking.getRide().getStatus())) {
            throw new RuntimeException("Ride must be completed before reviewing");
        }
        
        // Check if user already submitted a review for this booking
        if (reviewRepository.existsByBookingIdAndReviewerId(booking.getId(), currentUser.getId())) {
            throw new RuntimeException("You have already reviewed this booking");
        }
        
        // Determine reviewer and reviewee
        User reviewee;
        String reviewType;
        
        if (currentUser.getId().equals(booking.getPassenger().getId())) {
            // Passenger reviewing driver
            reviewee = booking.getRide().getDriver();
            reviewType = "PASSENGER_TO_DRIVER";
        } else if (currentUser.getId().equals(booking.getRide().getDriver().getId())) {
            // Driver reviewing passenger
            reviewee = booking.getPassenger();
            reviewType = "DRIVER_TO_PASSENGER";
        } else {
            throw new RuntimeException("You are not authorized to review this booking");
        }
        
        // Create review
        Review review = new Review();
        review.setBooking(booking);
        review.setReviewer(currentUser);
        review.setReviewee(reviewee);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setReviewType(reviewType);
        
        Review savedReview = reviewRepository.save(review);
        
        // Send notification to reviewee
        try {
            String message = String.format(
                "%s rated you %d star%s%s",
                currentUser.getName(),
                request.getRating(),
                request.getRating() > 1 ? "s" : "",
                request.getComment() != null && !request.getComment().isEmpty() 
                    ? " and left a comment" : ""
            );
            
            notificationService.sendNotification(
                reviewee,
                "REVIEW_RECEIVED",
                message,
                savedReview.getId()
            );
        } catch (Exception e) {
            System.err.println("Failed to send review notification: " + e.getMessage());
        }
        
        return savedReview;
    }
    
    /**
     * Get reviews for a user
     */
    public List<Review> getReviewsForUser(Long userId) {
        User user = userService.getUserById(userId);
        return reviewRepository.findByRevieweeOrderByCreatedAtDesc(user);
    }
    
    /**
     * Get user's rating summary
     */
    public Map<String, Object> getUserRatingSummary(Long userId) {
        User user = userService.getUserById(userId);
        
        List<Review> reviews = reviewRepository.findByRevieweeOrderByCreatedAtDesc(user);
        Double averageRating = reviewRepository.getAverageRatingForUser(userId);
        Long totalReviews = reviewRepository.getTotalReviewsForUser(userId);
        
        // Calculate star distribution
        Map<Integer, Long> starCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            starCounts.put(i, 0L);
        }
        
        for (Review review : reviews) {
            starCounts.put(review.getRating(), starCounts.get(review.getRating()) + 1);
        }
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("averageRating", averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0);
        summary.put("totalReviews", totalReviews);
        summary.put("fiveStars", starCounts.get(5));
        summary.put("fourStars", starCounts.get(4));
        summary.put("threeStars", starCounts.get(3));
        summary.put("twoStars", starCounts.get(2));
        summary.put("oneStar", starCounts.get(1));
        summary.put("reviews", reviews);
        
        return summary;
    }
    
    /**
     * Check if user can review a booking
     */
    public boolean canReviewBooking(Long bookingId) {
        User currentUser = userService.getCurrentUser();
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Check if booking is completed
        if (!"COMPLETED".equals(booking.getStatus()) || !"COMPLETED".equals(booking.getRide().getStatus())) {
            return false;
        }
        
        // Check if user is part of the booking
        boolean isPassenger = currentUser.getId().equals(booking.getPassenger().getId());
        boolean isDriver = currentUser.getId().equals(booking.getRide().getDriver().getId());
        
        if (!isPassenger && !isDriver) {
            return false;
        }
        
        // Check if user already reviewed
        return !reviewRepository.existsByBookingIdAndReviewerId(bookingId, currentUser.getId());
    }
    
    /**
     * Get pending reviews for current user (bookings they can review)
     */
    public List<Booking> getPendingReviews() {
        User currentUser = userService.getCurrentUser();
        List<Booking> bookings;
        
        if (currentUser.getRole() == Role.DRIVER) {
            bookings = bookingRepository.findByRideDriverOrderByBookingTimeDesc(currentUser);
        } else {
            bookings = bookingRepository.findByPassengerOrderByBookingTimeDesc(currentUser);
        }
        
        // Filter: only completed bookings that haven't been reviewed yet
        return bookings.stream()
                .filter(b -> "COMPLETED".equals(b.getStatus()))
                .filter(b -> "COMPLETED".equals(b.getRide().getStatus()))
                .filter(b -> !reviewRepository.existsByBookingIdAndReviewerId(
                        b.getId(), currentUser.getId()))
                .toList();
    }
}