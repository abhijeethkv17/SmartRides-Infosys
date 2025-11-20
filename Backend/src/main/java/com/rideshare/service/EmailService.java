package com.rideshare.service;

import com.rideshare.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendOTPEmail(String toEmail, String otp, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Smart Ride Sharing - Login OTP");
            message.setText(buildOTPEmailBody(userName, otp));
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }
    
    public void sendBookingConfirmationToPassenger(Booking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(booking.getPassenger().getEmail());
            message.setSubject("Ride Booking Confirmed - Smart Ride Sharing");
            message.setText(buildPassengerBookingEmailBody(booking));
            
            mailSender.send(message);
            System.out.println("Booking confirmation email sent to passenger: " + booking.getPassenger().getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send booking confirmation to passenger: " + e.getMessage());
            // Don't throw exception to avoid blocking the booking process
        }
    }
    
    public void sendBookingNotificationToDriver(Booking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(booking.getRide().getDriver().getEmail());
            message.setSubject("New Booking Received - Smart Ride Sharing");
            message.setText(buildDriverBookingEmailBody(booking));
            
            mailSender.send(message);
            System.out.println("Booking notification email sent to driver: " + booking.getRide().getDriver().getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send booking notification to driver: " + e.getMessage());
            // Don't throw exception to avoid blocking the booking process
        }
    }
    
    private String buildOTPEmailBody(String userName, String otp) {
        return String.format(
            "Hello %s,\n\n" +
            "Your OTP for logging into Smart Ride Sharing is: %s\n\n" +
            "This OTP is valid for 5 minutes.\n\n" +
            "If you did not request this OTP, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Smart Ride Sharing Team",
            userName, otp
        );
    }
    
    private String buildPassengerBookingEmailBody(Booking booking) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String departureTime = booking.getRide().getDepartureDateTime().format(formatter);
        
        return String.format(
            "Dear %s,\n\n" +
            "Your ride has been successfully booked! Here are your booking details:\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
            "BOOKING CONFIRMATION\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "Booking ID: #%d\n" +
            "Status: %s\n\n" +
            "JOURNEY DETAILS:\n" +
            "----------------\n" +
            "From: %s\n" +
            "To: %s\n" +
            "Departure: %s\n\n" +
            "YOUR PICKUP & DROP:\n" +
            "-------------------\n" +
            "Pickup Point: %s\n" +
            "Drop Point: %s\n\n" +
            "BOOKING DETAILS:\n" +
            "----------------\n" +
            "Seats Booked: %d\n" +
            "Total Fare: ₹%.2f\n\n" +
            "DRIVER INFORMATION:\n" +
            "-------------------\n" +
            "Driver Name: %s\n" +
            "Contact: %s\n" +
            "Vehicle: %s (%s)\n" +
            "Vehicle Capacity: %d seats\n\n" +
            "IMPORTANT NOTES:\n" +
            "----------------\n" +
            "• Please arrive at the pickup point 10 minutes before departure time\n" +
            "• Driver's contact number: %s\n" +
            "• Keep your booking ID handy for reference\n" +
            "• Payment: ₹%.2f\n\n" +
            "Need to make changes? Contact the driver directly or visit our website.\n\n" +
            "Have a safe and pleasant journey!\n\n" +
            "Best regards,\n" +
            "Smart Ride Sharing Team\n" +
            "support@smartridesharing.com",
            
            // Passenger details
            booking.getPassenger().getName(),
            booking.getId(),
            booking.getStatus(),
            
            // Journey details
            booking.getRide().getSource(),
            booking.getRide().getDestination(),
            departureTime,
            
            // Pickup and drop
            booking.getPickupLocation(),
            booking.getDropLocation(),
            
            // Booking details
            booking.getSeatsBooked(),
            booking.getEstimatedFare(),
            
            // Driver information
            booking.getRide().getDriver().getName(),
            booking.getRide().getDriver().getPhone(),
            booking.getRide().getDriver().getCarModel(),
            booking.getRide().getDriver().getLicensePlate(),
            booking.getRide().getDriver().getVehicleCapacity(),
            
            // Important notes
            booking.getRide().getDriver().getPhone(),
            booking.getEstimatedFare()
        );
    }
    
    private String buildDriverBookingEmailBody(Booking booking) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String departureTime = booking.getRide().getDepartureDateTime().format(formatter);
        
        return String.format(
            "Dear %s,\n\n" +
            "Great news! You have received a new booking for your ride.\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
            "NEW BOOKING NOTIFICATION\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "Booking ID: #%d\n" +
            "Booking Status: %s\n\n" +
            "YOUR RIDE DETAILS:\n" +
            "------------------\n" +
            "Route: %s → %s\n" +
            "Departure: %s\n" +
            "Available Seats: %d / %d\n\n" +
            "PASSENGER INFORMATION:\n" +
            "----------------------\n" +
            "Name: %s\n" +
            "Contact: %s\n" +
            "Email: %s\n\n" +
            "BOOKING DETAILS:\n" +
            "----------------\n" +
            "Pickup Point: %s\n" +
            "Drop Point: %s\n" +
            "Seats Booked: %d\n" +
            "Fare Amount: ₹%.2f\n\n" +
            "RIDE SUMMARY:\n" +
            "-------------\n" +
            "Total Seats in Vehicle: %d\n" +
            "Remaining Available Seats: %d\n" +
            "Total Bookings for this Ride: Check Dashboard\n\n" +
            "ACTION REQUIRED:\n" +
            "----------------\n" +
            "• Contact the passenger before departure: %s\n" +
            "• Confirm pickup location and time\n" +
            "• Ensure vehicle is clean and ready\n" +
            "• Arrive at pickup point on time\n\n" +
            "PAYMENT INFORMATION:\n" +
            "--------------------\n" +
            "Payment Amount: ₹%.2f\n" +
            "Payment will be transferred after ride completion.\n\n" +
            "You can view all your bookings and ride details on your dashboard.\n\n" +
            "Thank you for being a valued driver on Smart Ride Sharing!\n\n" +
            "Best regards,\n" +
            "Smart Ride Sharing Team\n" +
            "support@smartridesharing.com",
            
            // Driver details
            booking.getRide().getDriver().getName(),
            booking.getId(),
            booking.getStatus(),
            
            // Ride details
            booking.getRide().getSource(),
            booking.getRide().getDestination(),
            departureTime,
            booking.getRide().getAvailableSeats(),
            booking.getRide().getTotalSeats(),
            
            // Passenger information
            booking.getPassenger().getName(),
            booking.getPassenger().getPhone(),
            booking.getPassenger().getEmail(),
            
            // Booking details
            booking.getPickupLocation(),
            booking.getDropLocation(),
            booking.getSeatsBooked(),
            booking.getEstimatedFare(),
            
            // Ride summary
            booking.getRide().getTotalSeats(),
            booking.getRide().getAvailableSeats(),
            
            // Action required
            booking.getPassenger().getPhone(),
            
            // Payment
            booking.getEstimatedFare()
        );
    }
}