package com.rideshare.repository;

import com.rideshare.model.Review;
import com.rideshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Find review by booking ID and reviewer
    Optional<Review> findByBookingIdAndReviewerId(Long bookingId, Long reviewerId);
    
    // Check if review exists for a booking and reviewer
    boolean existsByBookingIdAndReviewerId(Long bookingId, Long reviewerId);
    
    // Get all reviews for a user (as reviewee)
    List<Review> findByRevieweeOrderByCreatedAtDesc(User reviewee);
    
    // Calculate average rating for a user
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId")
    Double getAverageRatingForUser(@Param("userId") Long userId);
    
    // Get total review count for a user
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee.id = :userId")
    Long getTotalReviewsForUser(@Param("userId") Long userId);
    
    // Get reviews by type (driver reviews or passenger reviews)
    List<Review> findByRevieweeAndReviewTypeOrderByCreatedAtDesc(User reviewee, String reviewType);
}