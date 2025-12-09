package com.rideshare.controller;

import com.rideshare.dto.ApiResponse;
import com.rideshare.dto.ReviewRequest;
import com.rideshare.model.Booking;
import com.rideshare.model.Review;
import com.rideshare.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {
    
    @Autowired
    private ReviewService reviewService;
    
    /**
     * Submit a review for a booking
     */
    @PostMapping
    public ResponseEntity<?> submitReview(@Valid @RequestBody ReviewRequest request) {
        try {
            Review review = reviewService.submitReview(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Review submitted successfully", review));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get reviews for a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReviewsForUser(@PathVariable Long userId) {
        try {
            List<Review> reviews = reviewService.getReviewsForUser(userId);
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Reviews retrieved successfully", reviews));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get user's rating summary
     */
    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<?> getUserRatingSummary(@PathVariable Long userId) {
        try {
            Map<String, Object> summary = reviewService.getUserRatingSummary(userId);
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Rating summary retrieved successfully", summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Check if current user can review a booking
     */
    @GetMapping("/can-review/{bookingId}")
    public ResponseEntity<?> canReviewBooking(@PathVariable Long bookingId) {
        try {
            boolean canReview = reviewService.canReviewBooking(bookingId);
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Check completed", Map.of("canReview", canReview)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get pending reviews for current user
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingReviews() {
        try {
            List<Booking> pendingReviews = reviewService.getPendingReviews();
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Pending reviews retrieved successfully", pendingReviews));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}