package com.rideshare.service;

import com.rideshare.model.Booking;
import com.rideshare.model.Ride;
import com.rideshare.repository.BookingRepository;
import com.rideshare.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RideReminderScheduler {
    
    @Autowired
    private RideRepository rideRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Send ride reminders 2 hours before departure
     * Runs every 15 minutes
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void sendRideReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twoHoursLater = now.plusHours(2);
        LocalDateTime twoHours15MinLater = now.plusHours(2).plusMinutes(15);
        
        // Find rides departing in the next 2 hours (within 15-minute window)
        List<Ride> upcomingRides = rideRepository.findByStatusAndDepartureDateTimeBetween(
                "ACTIVE", twoHoursLater, twoHours15MinLater);
        
        for (Ride ride : upcomingRides) {
            try {
                // Send reminder to driver
                sendDriverReminder(ride);
                
                // Send reminders to all passengers
                List<Booking> bookings = bookingRepository.findByRide(ride);
                for (Booking booking : bookings) {
                    if ("CONFIRMED".equals(booking.getStatus())) {
                        sendPassengerReminder(booking);
                    }
                }
                
                System.out.println("Sent reminders for ride #" + ride.getId() + 
                                 " from " + ride.getSource() + " to " + ride.getDestination());
            } catch (Exception e) {
                System.err.println("Failed to send reminders for ride #" + ride.getId() + 
                                 ": " + e.getMessage());
            }
        }
    }
    
    private void sendDriverReminder(Ride ride) {
        try {
            // In-app notification
            String message = String.format(
                "⏰ Reminder: Your ride from %s to %s starts in 2 hours! " +
                "Make sure your vehicle is ready and arrive on time.",
                ride.getSource(),
                ride.getDestination()
            );
            
            notificationService.sendNotification(
                ride.getDriver(),
                "RIDE_REMINDER",
                message,
                ride.getId()
            );
            
            // Email notification
            emailService.sendRideReminderToDriver(ride);
            
        } catch (Exception e) {
            System.err.println("Failed to send driver reminder: " + e.getMessage());
        }
    }
    
    private void sendPassengerReminder(Booking booking) {
        try {
            // In-app notification
            String message = String.format(
                "⏰ Your ride from %s to %s starts in 2 hours! " +
                "Be ready at your pickup location: %s",
                booking.getRide().getSource(),
                booking.getRide().getDestination(),
                booking.getPickupLocation()
            );
            
            notificationService.sendNotification(
                booking.getPassenger(),
                "RIDE_REMINDER",
                message,
                booking.getId()
            );
            
            // Email notification
            emailService.sendRideReminderToPassenger(booking);
            
        } catch (Exception e) {
            System.err.println("Failed to send passenger reminder: " + e.getMessage());
        }
    }
    
    /**
     * Send review reminders for completed rides
     * Runs daily at 9 AM
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void sendReviewReminders() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        LocalDateTime twoDaysAgo = LocalDateTime.now().minusDays(2);
        
        // Find rides completed in the last 24 hours
        List<Ride> completedRides = rideRepository.findByStatusAndDepartureDateTimeBetween(
                "COMPLETED", twoDaysAgo, yesterday);
        
        for (Ride ride : completedRides) {
            try {
                List<Booking> bookings = bookingRepository.findByRide(ride);
                
                for (Booking booking : bookings) {
                    if ("COMPLETED".equals(booking.getStatus())) {
                        // Send review reminder to passenger
                        sendReviewReminderToPassenger(booking);
                        
                        // Send review reminder to driver
                        sendReviewReminderToDriver(booking);
                    }
                }
                
            } catch (Exception e) {
                System.err.println("Failed to send review reminders for ride #" + 
                                 ride.getId() + ": " + e.getMessage());
            }
        }
    }
    
    private void sendReviewReminderToPassenger(Booking booking) {
        try {
            String message = String.format(
                "How was your ride with %s? Share your experience and help other passengers!",
                booking.getRide().getDriver().getName()
            );
            
            notificationService.sendNotification(
                booking.getPassenger(),
                "REVIEW_REMINDER",
                message,
                booking.getId()
            );
        } catch (Exception e) {
            System.err.println("Failed to send passenger review reminder: " + e.getMessage());
        }
    }
    
    private void sendReviewReminderToDriver(Booking booking) {
        try {
            String message = String.format(
                "Please rate your passenger %s for the completed ride.",
                booking.getPassenger().getName()
            );
            
            notificationService.sendNotification(
                booking.getRide().getDriver(),
                "REVIEW_REMINDER",
                message,
                booking.getId()
            );
        } catch (Exception e) {
            System.err.println("Failed to send driver review reminder: " + e.getMessage());
        }
    }
}