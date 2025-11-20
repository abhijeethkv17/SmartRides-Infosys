package com.rideshare.service;

import com.rideshare.dto.AuthResponse;
import com.rideshare.dto.CompleteLoginRequest;
import com.rideshare.dto.LoginRequest;
import com.rideshare.dto.RegisterRequest;
import com.rideshare.model.Role;
import com.rideshare.model.User;
import com.rideshare.repository.UserRepository;
import com.rideshare.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private OTPService otpService;
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        
        if (request.getRole() == Role.DRIVER) {
            if (request.getCarModel() == null || request.getLicensePlate() == null || request.getVehicleCapacity() == null) {
                throw new RuntimeException("Driver must provide vehicle details");
            }
            user.setCarModel(request.getCarModel());
            user.setLicensePlate(request.getLicensePlate());
            user.setVehicleCapacity(request.getVehicleCapacity());
        }
        
        User savedUser = userRepository.save(user);
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);
        
        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), 
                               savedUser.getEmail(), savedUser.getRole());
    }
    
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return new AuthResponse(token, user.getId(), user.getName(), 
                               user.getEmail(), user.getRole());
    }
    
    public AuthResponse completeLogin(CompleteLoginRequest request) {
        // Verify OTP and consume it (mark as used)
        try {
            otpService.verifyAndConsumeOTP(request.getEmail(), request.getOtp());
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired OTP: " + e.getMessage());
        }
        
        // Authenticate with password
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = tokenProvider.generateToken(authentication);
            
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return new AuthResponse(token, user.getId(), user.getName(), 
                                   user.getEmail(), user.getRole());
        } catch (Exception e) {
            throw new RuntimeException("Password is incorrect! Please try again!");
        }
    }
}