package com.rideshare.service;

import com.rideshare.model.OTP;
import com.rideshare.model.User;
import com.rideshare.repository.OTPRepository;
import com.rideshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class OTPService {
    
    @Autowired
    private OTPRepository otpRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Value("${otp.expiration}")
    private Long otpExpiration;
    
    @Transactional
    public void generateAndSendOTP(String email) {
        // Check if user exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email"));
        
        // Invalidate any existing OTPs for this email
        List<OTP> existingOTPs = otpRepository.findByEmailAndVerifiedFalse(email);
        otpRepository.deleteAll(existingOTPs);
        
        // Generate 6-digit OTP
        String otpCode = generateOTPCode();
        
        // Save OTP to database
        OTP otp = new OTP();
        otp.setEmail(email);
        otp.setOtpCode(otpCode);
        otp.setVerified(false);
        otp.setExpiresAt(LocalDateTime.now().plusSeconds(otpExpiration / 1000));
        otpRepository.save(otp);
        
        // Send OTP via email
        emailService.sendOTPEmail(email, otpCode, user.getName());
    }
    
    public boolean verifyOTP(String email, String otpCode) {
        OTP otp = otpRepository.findByEmailAndOtpCode(email, otpCode)
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));
        
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
        
        // Don't mark as verified yet - just validate it exists and is not expired
        return true;
    }
    
    @Transactional
    public boolean verifyAndConsumeOTP(String email, String otpCode) {
        OTP otp = otpRepository.findByEmailAndOtpCode(email, otpCode)
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));
        
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
        
        if (otp.getVerified()) {
            throw new RuntimeException("OTP has already been used");
        }
        
        // Mark as verified and used
        otp.setVerified(true);
        otpRepository.save(otp);
        
        return true;
    }
    
    private String generateOTPCode() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
    
    @Transactional
    public void cleanupExpiredOTPs() {
        otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}