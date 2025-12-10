package com.rideshare.controller;

import com.rideshare.dto.ApiResponse;
import com.rideshare.dto.AuthResponse;
import com.rideshare.dto.LoginRequest;
import com.rideshare.model.User;
import com.rideshare.repository.UserRepository;
import com.rideshare.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AdminAuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Direct login for ADMIN users (bypasses OTP)
     * This should be used only for admin accounts
     * 
     * POST /api/auth/admin-login
     * Body: { "email": "admin@smartrides.com", "password": "Admin@123" }
     */
    @PostMapping("/admin-login")
    public ResponseEntity<?> adminDirectLogin(@Valid @RequestBody LoginRequest request) {
        try {
            // First check if user exists and is ADMIN
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Security check: Only allow ADMIN role to use this endpoint
            if (!"ADMIN".equals(user.getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "This endpoint is only for admin users"));
            }
            
            // Authenticate with password
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = tokenProvider.generateToken(authentication);
            
            AuthResponse response = new AuthResponse(
                token, 
                user.getId(), 
                user.getName(), 
                user.getEmail(), 
                user.getRole()
            );
            
            return ResponseEntity.ok(new ApiResponse(true, "Admin login successful", response));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid email or password"));
        }
    }
}