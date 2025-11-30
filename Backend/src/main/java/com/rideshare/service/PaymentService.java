package com.rideshare.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
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
    
    @Transactional
    public Payment createPaymentOrder(Long bookingId) throws RazorpayException {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (paymentRepository.findByBookingId(bookingId).isPresent()) {
            throw new RuntimeException("Payment already exists for this booking");
        }
        
        Double amount = booking.getEstimatedFare();
        Double platformCommission = amount * PLATFORM_COMMISSION_RATE;
        Double driverEarnings = amount - platformCommission;
        
        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int)(amount * 100));
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", "booking_" + bookingId);
        
        JSONObject notes = new JSONObject();
        notes.put("booking_id", bookingId);
        notes.put("passenger_id", booking.getPassenger().getId());
        notes.put("driver_id", booking.getRide().getDriver().getId());
        orderRequest.put("notes", notes);
        
        Order order = razorpayClient.orders.create(orderRequest);
        
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
    
    @Transactional
    public Payment verifyAndCompletePayment(String razorpayOrderId, 
                                            String razorpayPaymentId, 
                                            String razorpaySignature) throws RazorpayException {
        
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
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
        
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setStatus("SUCCESS");
        payment.setCompletedAt(LocalDateTime.now());
        
        return paymentRepository.save(payment);
    }
    
    @Transactional
    public Payment handlePaymentFailure(String razorpayOrderId, String failureReason) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        payment.setStatus("FAILED");
        payment.setFailureReason(failureReason);
        
        return paymentRepository.save(payment);
    }
    
    public Payment getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found for this booking"));
    }
    
    public List<Payment> getPassengerPayments() {
        User passenger = userService.getCurrentUser();
        // Updated to use _Id method
        return paymentRepository.findByPassenger_IdOrderByCreatedAtDesc(passenger.getId());
    }
    
    public List<Payment> getDriverEarnings() {
        User driver = userService.getCurrentUser();
        // Updated to use _Id method
        return paymentRepository.findByDriver_IdAndStatusOrderByCreatedAtDesc(driver.getId(), "SUCCESS");
    }
    
    public List<Payment> getAllDriverPayments() {
        User driver = userService.getCurrentUser();
        // Updated to use _Id method
        return paymentRepository.findByDriver_IdOrderByCreatedAtDesc(driver.getId());
    }
    
    @Transactional
    public Payment processRefund(Long paymentId) throws RazorpayException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        if (!"SUCCESS".equals(payment.getStatus())) {
            throw new RuntimeException("Can only refund successful payments");
        }
        
        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        
        JSONObject refundRequest = new JSONObject();
        refundRequest.put("amount", (int)(payment.getAmount() * 100));
        
        razorpayClient.payments.refund(payment.getRazorpayPaymentId(), refundRequest);
        
        payment.setStatus("REFUNDED");
        payment.setRefundedAt(LocalDateTime.now());
        
        return paymentRepository.save(payment);
    }
    
    public Double getTotalEarnings(User driver) {
        // Updated to use _Id method
        List<Payment> successfulPayments = paymentRepository
                .findByDriver_IdAndStatusOrderByCreatedAtDesc(driver.getId(), "SUCCESS");
        
        return successfulPayments.stream()
                .mapToDouble(Payment::getDriverEarnings)
                .sum();
    }
    
    public String getRazorpayKey() {
        return razorpayKeyId;
    }
}