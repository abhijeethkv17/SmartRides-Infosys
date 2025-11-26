package com.rideshare.service;

import com.rideshare.model.Ride;
import com.rideshare.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RideStatusScheduler {
    
    @Autowired
    private RideRepository rideRepository;
    
    /**
     * Automatically mark rides as COMPLETED if departure time has passed
     * Runs every hour at the 5-minute mark (e.g., 1:05, 2:05, 3:05...)
     */
    @Scheduled(cron = "0 5 * * * *")  // Every hour at 5 minutes past
    @Transactional
    public void autoCompleteExpiredRides() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find all ACTIVE rides where departure time + 12 hours has passed
        // This gives drivers 12 hours after scheduled departure to manually complete
        LocalDateTime cutoffTime = now.minusHours(12);
        
        List<Ride> expiredRides = rideRepository.findByStatusAndDepartureDateTimeBefore("ACTIVE", cutoffTime);
        
        for (Ride ride : expiredRides) {
            ride.setStatus("COMPLETED");
            rideRepository.save(ride);
            System.out.println("Auto-completed ride #" + ride.getId() + 
                             " from " + ride.getSource() + " to " + ride.getDestination());
        }
        
        if (!expiredRides.isEmpty()) {
            System.out.println("Auto-completed " + expiredRides.size() + " expired rides at " + now);
        }
    }
    
    /**
     * Send reminder to drivers about rides happening soon
     * Runs every 30 minutes
     */
    @Scheduled(cron = "0 */30 * * * *")  // Every 30 minutes
    public void sendUpcomingRideReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourLater = now.plusHours(1);
        
        // Find rides departing in the next hour that are still ACTIVE
        List<Ride> upcomingRides = rideRepository.findByStatusAndDepartureDateTimeBetween(
                "ACTIVE", now, oneHourLater);
        
        for (Ride ride : upcomingRides) {
            System.out.println("Reminder: Ride #" + ride.getId() + 
                             " departing soon at " + ride.getDepartureDateTime());
            // TODO: Send email/SMS notification to driver
        }
    }
}