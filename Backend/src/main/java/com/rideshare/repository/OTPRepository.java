package com.rideshare.repository;

import com.rideshare.model.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByEmailAndOtpCodeAndVerifiedFalse(String email, String otpCode);
    Optional<OTP> findByEmailAndOtpCode(String email, String otpCode);
    List<OTP> findByEmailAndVerifiedFalse(String email);
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
    void deleteByEmail(String email);
}