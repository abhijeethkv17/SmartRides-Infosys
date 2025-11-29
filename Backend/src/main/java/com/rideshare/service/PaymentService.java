package com.rideshare.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;
import com.razorpay.Utils;
import com.rideshare.model.Booking;
import com.rideshare.model.Payment;
import com.rideshare.model.User;
import com.rideshare.repository.BookingRepository;
import com.rideshare.repository.PaymentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserService userService;
    
    @Value("${razorpay.key.id}")
    private String razorpayKeyId;
    
    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;
    
    @Value("${razorpay.currency:INR}")
    private String currency;
    
    private static final Double PLATFORM_COMMISSION_RATE = 0.10; // 10%
    
    /**
     * Create a Razorpay order for booking payment
     */
    @Transactional
    public Payment createPaymentOrder(Long bookingId) throws RazorpayException {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Check if payment already exists
        if (paymentRepository.findByBookingId(bookingId).isPresent()) {
            throw new RuntimeException("Payment already exists for this booking");
        }
        
        // Calculate commission and driver earnings
        Double amount = booking.getEstimatedFare();
        Double platformCommission = amount * PLATFORM_COMMISSION_RATE;
        Double driverEarnings = amount - platformCommission;
        
        // Create Razorpay order
        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int)(amount * 100)); // Amount in paise
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", "booking_" + bookingId);
        
        JSONObject notes = new JSONObject();
        notes.put("booking_id", bookingId);
        notes.put("passenger_id", booking.getPassenger().getId());
        notes.put("driver_id", booking.getRide().getDriver().getId());
        orderRequest.put("notes", notes);
        
        Order order = razorpayClient.orders.create(orderRequest);
        
        // Save payment record
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setPassenger(booking.getPassenger());
        payment.setDriver(booking.getRide().getDriver());
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setRazorpayOrderId(order.get("id"));
        payment.setStatus("PENDING");
        payment.setPlatformCommission(platformCommission);
        payment.setDriverEarnings(driverEarnings);
        
        return paymentRepository.save(payment);
    }
    
    /**
     * Verify and complete payment
     */
    @Transactional
    public Payment verifyAndCompletePayment(String razorpayOrderId, 
                                            String razorpayPaymentId, 
                                            String razorpaySignature) throws RazorpayException {
        
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        // Verify signature
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", razorpayOrderId);
        options.put("razorpay_payment_id", razorpayPaymentId);
        options.put("razorpay_signature", razorpaySignature);
        
        boolean isValidSignature = Utils.verifyPaymentSignature(options, razorpayKeySecret);
        
        if (!isValidSignature) {
            payment.setStatus("FAILED");
            payment.setFailureReason("Invalid signature");
            paymentRepository.save(payment);
            throw new RuntimeException("Payment signature verification failed");
        }
        
        // Update payment status
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setStatus("SUCCESS");
        payment.setCompletedAt(LocalDateTime.now());
        
        return paymentRepository.save(payment);
    }
    
    /**
     * Handle payment failure
     */
    @Transactional
    public Payment handlePaymentFailure(String razorpayOrderId, String failureReason) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        payment.setStatus("FAILED");
        payment.setFailureReason(failureReason);
        
        return paymentRepository.save(payment);
    }
    
    /**
     * Get payment by booking ID
     */
    public Payment getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found for this booking"));
    }
    
    /**
     * Get passenger's payment history
     */
    public List<Payment> getPassengerPayments() {
        User passenger = userService.getCurrentUser();
        return paymentRepository.findByPassengerOrderByCreatedAtDesc(passenger);
    }
    
    /**
     * Get driver's earnings history
     */
    public List<Payment> getDriverEarnings() {
        User driver = userService.getCurrentUser();
        return paymentRepository.findByDriverAndStatusOrderByCreatedAtDesc(driver, "SUCCESS");
    }
    
    /**
     * Get all driver payments (including pending)
     */
    public List<Payment> getAllDriverPayments() {
        User driver = userService.getCurrentUser();
        return paymentRepository.findByDriverOrderByCreatedAtDesc(driver);
    }
    
    /**
     * Process refund
     */
    @Transactional
    public Payment processRefund(Long paymentId) throws RazorpayException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        if (!"SUCCESS".equals(payment.getStatus())) {
            throw new RuntimeException("Can only refund successful payments");
        }
        
        // Process refund through Razorpay
        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        
        JSONObject refundRequest = new JSONObject();
        refundRequest.put("amount", (int)(payment.getAmount() * 100)); // Full refund
        
        // --- FIX APPLIED HERE ---
        // Instead of fetching and calling .refund() on the object, we call refund on the client
        // passing the Payment ID and the request options.
        razorpayClient.payments.refund(payment.getRazorpayPaymentId(), refundRequest);
        // --- FIX END ---
        
        payment.setStatus("REFUNDED");
        payment.setRefundedAt(LocalDateTime.now());
        
        return paymentRepository.save(payment);
    }
    
    /**
     * Get total earnings for driver
     */
    public Double getTotalEarnings(User driver) {
        List<Payment> successfulPayments = paymentRepository
                .findByDriverAndStatusOrderByCreatedAtDesc(driver, "SUCCESS");
        
        return successfulPayments.stream()
                .mapToDouble(Payment::getDriverEarnings)
                .sum();
    }
    
    /**
     * Get Razorpay key for frontend
     */
    public String getRazorpayKey() {
        return razorpayKeyId;
    }
}