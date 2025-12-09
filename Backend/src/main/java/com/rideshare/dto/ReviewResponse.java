package com.rideshare.dto;

import com.rideshare.model.Review;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Response DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
class ReviewResponse {
    private Long id;
    private Long bookingId;
    private Integer rating;
    private String comment;
    private String reviewType;
    private LocalDateTime createdAt;
    private ReviewerInfo reviewer;
    private RevieweeInfo reviewee;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewerInfo {
        private Long id;
        private String name;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevieweeInfo {
        private Long id;
        private String name;
        private String role;
    }
    
    public static ReviewResponse fromReview(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setBookingId(review.getBooking().getId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setReviewType(review.getReviewType());
        response.setCreatedAt(review.getCreatedAt());
        
        ReviewerInfo reviewerInfo = new ReviewerInfo(
            review.getReviewer().getId(),
            review.getReviewer().getName()
        );
        response.setReviewer(reviewerInfo);
        
        RevieweeInfo revieweeInfo = new RevieweeInfo(
            review.getReviewee().getId(),
            review.getReviewee().getName(),
            review.getReviewee().getRole().name()
        );
        response.setReviewee(revieweeInfo);
        
        return response;
    }
}