package com.rideshare.service;

import com.rideshare.dto.UserResponse;
import com.rideshare.model.User;
import com.rideshare.repository.ReviewRepository;
import com.rideshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;
    
    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public UserResponse getCurrentUserProfile() {
        User user = getCurrentUser();
        UserResponse response = UserResponse.fromUser(user);
        
        // Fetch average rating
        Double avgRating = reviewRepository.getAverageRatingForUser(user.getId());
        response.setAverageRating(avgRating != null ? avgRating : 0.0);
        
        return response;
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}