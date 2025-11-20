package com.rideshare.controller;

import com.rideshare.dto.ApiResponse;
import com.rideshare.dto.UserResponse;
import com.rideshare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile() {
        try {
            UserResponse userResponse = userService.getCurrentUserProfile();
            return ResponseEntity.ok(new ApiResponse(true, "Profile fetched successfully", userResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}