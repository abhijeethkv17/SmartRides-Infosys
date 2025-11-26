package com.rideshare.service;

import com.rideshare.model.Ride;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class FareCalculationService {
    
    @Value("${fare.base.amount:50}")
    private Double baseFare;
    
    @Value("${fare.minimum.amount:30}")
    private Double minimumFare;
    
    @Value("${fare.booking.fee:10}")
    private Double bookingFee;
    
    /**
     * Calculate total fare for a booking
     * @param distanceKm Distance in kilometers
     * @param pricePerKm Rate per kilometer set by driver
     * @param seatsBooked Number of seats booked
     * @return Total fare amount
     */
    public Double calculateFare(Double distanceKm, Double pricePerKm, Integer seatsBooked) {
        // Calculate distance-based fare
        Double distanceFare = distanceKm * pricePerKm;
        
        // Add base fare
        Double totalFare = baseFare + distanceFare;
        
        // Multiply by number of seats
        totalFare = totalFare * seatsBooked;
        
        // Add booking fee
        totalFare = totalFare + bookingFee;
        
        // Ensure minimum fare
        if (totalFare < minimumFare) {
            totalFare = minimumFare;
        }
        
        // Round to 2 decimal places
        return Math.round(totalFare * 100.0) / 100.0;
    }
    
    /**
     * Calculate fare breakdown with detailed information
     * @param distanceKm Distance in kilometers
     * @param pricePerKm Rate per kilometer
     * @param seatsBooked Number of seats
     * @return FareBreakdown object
     */
    public FareBreakdown calculateFareBreakdown(Double distanceKm, Double pricePerKm, Integer seatsBooked) {
        Double distanceFare = distanceKm * pricePerKm;
        Double subtotal = baseFare + distanceFare;
        Double seatMultiplier = subtotal * seatsBooked;
        Double total = seatMultiplier + bookingFee;
        
        // Apply minimum fare if necessary
        boolean minimumFareApplied = false;
        if (total < minimumFare) {
            total = minimumFare;
            minimumFareApplied = true;
        }
        
        return new FareBreakdown(
            baseFare,
            distanceFare,
            bookingFee,
            seatsBooked,
            Math.round(total * 100.0) / 100.0,
            minimumFareApplied
        );
    }
    
    /**
     * Calculate fare per person when splitting among multiple passengers
     * @param totalFare Total fare amount
     * @param numberOfPassengers Number of passengers sharing the ride
     * @return Fare per person
     */
    public Double calculateSplitFare(Double totalFare, Integer numberOfPassengers) {
        if (numberOfPassengers <= 0) {
            throw new IllegalArgumentException("Number of passengers must be greater than 0");
        }
        
        Double farePerPerson = totalFare / numberOfPassengers;
        return Math.round(farePerPerson * 100.0) / 100.0;
    }
    
    /**
     * Estimate driver earnings after platform commission
     * @param totalFare Total fare collected
     * @return Driver earnings
     */
    public Double calculateDriverEarnings(Double totalFare) {
        // Platform takes 10% commission
        double platformCommission = 0.10;
        Double driverEarnings = totalFare * (1 - platformCommission);
        return Math.round(driverEarnings * 100.0) / 100.0;
    }
    
    /**
     * Data class to hold fare breakdown information
     */
    public static class FareBreakdown {
        private final Double baseFare;
        private final Double distanceFare;
        private final Double bookingFee;
        private final Integer seatsBooked;
        private final Double totalFare;
        private final boolean minimumFareApplied;
        
        public FareBreakdown(Double baseFare, Double distanceFare, Double bookingFee, 
                           Integer seatsBooked, Double totalFare, boolean minimumFareApplied) {
            this.baseFare = baseFare;
            this.distanceFare = distanceFare;
            this.bookingFee = bookingFee;
            this.seatsBooked = seatsBooked;
            this.totalFare = totalFare;
            this.minimumFareApplied = minimumFareApplied;
        }
        
        // Getters
        public Double getBaseFare() { return baseFare; }
        public Double getDistanceFare() { return distanceFare; }
        public Double getBookingFee() { return bookingFee; }
        public Integer getSeatsBooked() { return seatsBooked; }
        public Double getTotalFare() { return totalFare; }
        public boolean isMinimumFareApplied() { return minimumFareApplied; }
    }
}