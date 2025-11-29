package com.rideshare.controller;

import com.razorpay.RazorpayException;
import com.rideshare.dto.ApiResponse;
import com.rideshare.dto.PaymentVerificationRequest;
import com.rideshare.model.Payment;
import com.rideshare.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    /**
     * Create payment order for booking
     */
    @PostMapping("/create-order/{bookingId}")
    public ResponseEntity<?> createPaymentOrder(@PathVariable Long bookingId) {
        try {
            Payment payment = paymentService.createPaymentOrder(bookingId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", payment.getRazorpayOrderId());
            response.put("amount", payment.getAmount());
            response.put("currency", payment.getCurrency());
            response.put("keyId", paymentService.getRazorpayKey());
            response.put("paymentId", payment.getId());
            
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Payment order created successfully", response));
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to create payment order: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Verify payment
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        try {
            Payment payment = paymentService.verifyAndCompletePayment(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );
            
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Payment verified successfully", payment));
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Payment verification failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Handle payment failure
     */
    @PostMapping("/failure")
    public ResponseEntity<?> handlePaymentFailure(
            @RequestParam String razorpayOrderId,
            @RequestParam(required = false) String reason) {
        try {
            Payment payment = paymentService.handlePaymentFailure(
                    razorpayOrderId, 
                    reason != null ? reason : "Payment failed"
            );
            
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Payment failure recorded", payment));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get payment by booking ID
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBooking(@PathVariable Long bookingId) {
        try {
            Payment payment = paymentService.getPaymentByBookingId(bookingId);
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Payment retrieved successfully", payment));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get passenger's payment history
     */
    @GetMapping("/passenger/history")
    public ResponseEntity<?> getPassengerPaymentHistory() {
        try {
            List<Payment> payments = paymentService.getPassengerPayments();
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Payment history retrieved successfully", payments));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get driver's earnings
     */
    @GetMapping("/driver/earnings")
    public ResponseEntity<?> getDriverEarnings() {
        try {
            List<Payment> payments = paymentService.getDriverEarnings();
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Earnings retrieved successfully", payments));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get all driver payments
     */
    @GetMapping("/driver/all")
    public ResponseEntity<?> getAllDriverPayments() {
        try {
            List<Payment> payments = paymentService.getAllDriverPayments();
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Payments retrieved successfully", payments));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Process refund
     */
    @PostMapping("/refund/{paymentId}")
    public ResponseEntity<?> processRefund(@PathVariable Long paymentId) {
        try {
            Payment payment = paymentService.processRefund(paymentId);
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Refund processed successfully", payment));
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Refund failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get Razorpay key for frontend
     */
    @GetMapping("/razorpay-key")
    public ResponseEntity<?> getRazorpayKey() {
        try {
            String key = paymentService.getRazorpayKey();
            Map<String, String> response = new HashMap<>();
            response.put("keyId", key);
            
            return ResponseEntity.ok(new ApiResponse(true, 
                    "Razorpay key retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}