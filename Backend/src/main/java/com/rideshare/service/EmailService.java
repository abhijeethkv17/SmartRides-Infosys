package com.rideshare.service;

import com.rideshare.model.Booking;
import com.rideshare.model.Ride;
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
        }
    }
    
    /**
     * NEW: Send ride reminder to driver
     */
    public void sendRideReminderToDriver(Ride ride) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(ride.getDriver().getEmail());
            message.setSubject("⏰ Ride Reminder - Your Journey Starts Soon!");
            message.setText(buildDriverReminderEmailBody(ride));
            
            mailSender.send(message);
            System.out.println("Ride reminder email sent to driver: " + ride.getDriver().getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send ride reminder to driver: " + e.getMessage());
        }
    }
    
    /**
     * NEW: Send ride reminder to passenger
     */
    public void sendRideReminderToPassenger(Booking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(booking.getPassenger().getEmail());
            message.setSubject("⏰ Ride Reminder - Get Ready for Your Journey!");
            message.setText(buildPassengerReminderEmailBody(booking));
            
            mailSender.send(message);
            System.out.println("Ride reminder email sent to passenger: " + booking.getPassenger().getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send ride reminder to passenger: " + e.getMessage());
        }
    }
    
    /**
     * NEW: Send ride cancellation email to passenger
     */
    public void sendRideCancellationToPassenger(Booking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(booking.getPassenger().getEmail());
            message.setSubject("Ride Cancelled - Smart Ride Sharing");
            message.setText(buildCancellationEmailBody(booking));
            
            mailSender.send(message);
            System.out.println("Cancellation email sent to passenger: " + booking.getPassenger().getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send cancellation email: " + e.getMessage());
        }
    }
    
    // Email body builders
    
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
            "From: %s\n" +
            "To: %s\n" +
            "Departure: %s\n\n" +
            "YOUR PICKUP & DROP:\n" +
            "Pickup Point: %s\n" +
            "Drop Point: %s\n\n" +
            "BOOKING DETAILS:\n" +
            "Seats Booked: %d\n" +
            "Total Fare: ₹%.2f\n\n" +
            "DRIVER INFORMATION:\n" +
            "Driver Name: %s\n" +
            "Contact: %s\n" +
            "Vehicle: %s (%s)\n\n" +
            "IMPORTANT NOTES:\n" +
            "• Please arrive at the pickup point 10 minutes before departure time\n" +
            "• Driver's contact number: %s\n" +
            "• Keep your booking ID handy for reference\n\n" +
            "Have a safe and pleasant journey!\n\n" +
            "Best regards,\n" +
            "Smart Ride Sharing Team",
            booking.getPassenger().getName(),
            booking.getId(),
            booking.getStatus(),
            booking.getRide().getSource(),
            booking.getRide().getDestination(),
            departureTime,
            booking.getPickupLocation(),
            booking.getDropLocation(),
            booking.getSeatsBooked(),
            booking.getEstimatedFare(),
            booking.getRide().getDriver().getName(),
            booking.getRide().getDriver().getPhone(),
            booking.getRide().getDriver().getCarModel(),
            booking.getRide().getDriver().getLicensePlate(),
            booking.getRide().getDriver().getPhone()
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
            "Booking ID: #%d\n\n" +
            "YOUR RIDE DETAILS:\n" +
            "Route: %s → %s\n" +
            "Departure: %s\n" +
            "Available Seats: %d / %d\n\n" +
            "PASSENGER INFORMATION:\n" +
            "Name: %s\n" +
            "Contact: %s\n" +
            "Email: %s\n\n" +
            "BOOKING DETAILS:\n" +
            "Pickup Point: %s\n" +
            "Drop Point: %s\n" +
            "Seats Booked: %d\n" +
            "Fare Amount: ₹%.2f\n\n" +
            "ACTION REQUIRED:\n" +
            "• Contact the passenger before departure: %s\n" +
            "• Confirm pickup location and time\n" +
            "• Ensure vehicle is clean and ready\n\n" +
            "Thank you for being a valued driver!\n\n" +
            "Best regards,\n" +
            "Smart Ride Sharing Team",
            booking.getRide().getDriver().getName(),
            booking.getId(),
            booking.getRide().getSource(),
            booking.getRide().getDestination(),
            departureTime,
            booking.getRide().getAvailableSeats(),
            booking.getRide().getTotalSeats(),
            booking.getPassenger().getName(),
            booking.getPassenger().getPhone(),
            booking.getPassenger().getEmail(),
            booking.getPickupLocation(),
            booking.getDropLocation(),
            booking.getSeatsBooked(),
            booking.getEstimatedFare(),
            booking.getPassenger().getPhone()
        );
    }
    
    private String buildDriverReminderEmailBody(Ride ride) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String departureTime = ride.getDepartureDateTime().format(formatter);
        
        return String.format(
            "Dear %s,\n\n" +
            "⏰ RIDE REMINDER\n\n" +
            "Your ride starts in 2 hours!\n\n" +
            "RIDE DETAILS:\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
            "Route: %s → %s\n" +
            "Departure: %s\n" +
            "Passengers Booked: %d / %d seats\n\n" +
            "PRE-RIDE CHECKLIST:\n" +
            "✓ Vehicle is clean and fueled\n" +
            "✓ All passengers have been contacted\n" +
            "✓ Route is planned\n" +
            "✓ You have everyone's contact details\n\n" +
            "Drive safely and have a great journey!\n\n" +
            "Best regards,\n" +
            "Smart Ride Sharing Team",
            ride.getDriver().getName(),
            ride.getSource(),
            ride.getDestination(),
            departureTime,
            ride.getTotalSeats() - ride.getAvailableSeats(),
            ride.getTotalSeats()
        );
    }
    
    private String buildPassengerReminderEmailBody(Booking booking) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String departureTime = booking.getRide().getDepartureDateTime().format(formatter);
        
        return String.format(
            "Dear %s,\n\n" +
            "⏰ RIDE REMINDER\n\n" +
            "Your ride starts in 2 hours! Please be ready.\n\n" +
            "RIDE DETAILS:\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
            "Route: %s → %s\n" +
            "Departure: %s\n" +
            "Pickup Location: %s\n" +
            "Drop Location: %s\n\n" +
            "DRIVER INFORMATION:\n" +
            "Name: %s\n" +
            "Contact: %s\n" +
            "Vehicle: %s (%s)\n\n" +
            "IMPORTANT:\n" +
            "• Arrive at pickup point 10 minutes early\n" +
            "• Keep your phone accessible\n" +
            "• Have your booking ID ready: #%d\n\n" +
            "Have a safe journey!\n\n" +
            "Best regards,\n" +
            "Smart Ride Sharing Team",
            booking.getPassenger().getName(),
            booking.getRide().getSource(),
            booking.getRide().getDestination(),
            departureTime,
            booking.getPickupLocation(),
            booking.getDropLocation(),
            booking.getRide().getDriver().getName(),
            booking.getRide().getDriver().getPhone(),
            booking.getRide().getDriver().getCarModel(),
            booking.getRide().getDriver().getLicensePlate(),
            booking.getId()
        );
    }
    
    private String buildCancellationEmailBody(Booking booking) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String departureTime = booking.getRide().getDepartureDateTime().format(formatter);
        
        return String.format(
            "Dear %s,\n\n" +
            "We regret to inform you that your booked ride has been cancelled by the driver.\n\n" +
            "CANCELLED RIDE DETAILS:\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
            "Booking ID: #%d\n" +
            "Route: %s → %s\n" +
            "Scheduled Departure: %s\n" +
            "Seats Booked: %d\n" +
            "Amount Paid: ₹%.2f\n\n" +
            "REFUND INFORMATION:\n" +
            "Your payment will be refunded to your original payment method within 5-7 business days.\n\n" +
            "NEXT STEPS:\n" +
            "• Search for alternative rides on our platform\n" +
            "• Contact support if you need assistance: support@smartrides.com\n\n" +
            "We apologize for the inconvenience.\n\n" +
            "Best regards,\n" +
            "Smart Ride Sharing Team",
            booking.getPassenger().getName(),
            booking.getId(),
            booking.getRide().getSource(),
            booking.getRide().getDestination(),
            departureTime,
            booking.getSeatsBooked(),
            booking.getEstimatedFare()
        );
    }
}