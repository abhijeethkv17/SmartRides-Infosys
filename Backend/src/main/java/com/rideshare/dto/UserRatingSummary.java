package com.rideshare.dto;

import com.rideshare.model.Review;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


// User Rating Summary DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
class UserRatingResponse {
    private Double averageRating;
    private Long totalReviews;
    private Integer fiveStars;
    private Integer fourStars;
    private Integer threeStars;
    private Integer twoStars;
    private Integer oneStar;
}