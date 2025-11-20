package com.rideshare.dto;

import com.rideshare.model.Booking;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingResponse {
    private Long id;
    private Integer seatsBooked;
    private String pickupLocation;
    private String dropLocation;
    private Double estimatedFare;
    private String status;
    private LocalDateTime bookingTime;
    private RideInfo ride;
    private PassengerInfo passenger;
    
    @Data
    public static class RideInfo {
        private Long id;
        private String source;
        private String destination;
        private LocalDateTime departureDateTime;
        private Double pricePerKm;
        private DriverInfo driver;
    }
    
    @Data
    public static class DriverInfo {
        private Long id;
        private String name;
        private String phone;
        private String carModel;
        private String licensePlate;
    }
    
    @Data
    public static class PassengerInfo {
        private Long id;
        private String name;
        private String email;
        private String phone;
    }
    
    public static BookingResponse fromBooking(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setSeatsBooked(booking.getSeatsBooked());
        response.setPickupLocation(booking.getPickupLocation());
        response.setDropLocation(booking.getDropLocation());
        response.setEstimatedFare(booking.getEstimatedFare());
        response.setStatus(booking.getStatus());
        response.setBookingTime(booking.getBookingTime());
        
        RideInfo rideInfo = new RideInfo();
        rideInfo.setId(booking.getRide().getId());
        rideInfo.setSource(booking.getRide().getSource());
        rideInfo.setDestination(booking.getRide().getDestination());
        rideInfo.setDepartureDateTime(booking.getRide().getDepartureDateTime());
        rideInfo.setPricePerKm(booking.getRide().getPricePerKm());
        
        DriverInfo driverInfo = new DriverInfo();
        driverInfo.setId(booking.getRide().getDriver().getId());
        driverInfo.setName(booking.getRide().getDriver().getName());
        driverInfo.setPhone(booking.getRide().getDriver().getPhone());
        driverInfo.setCarModel(booking.getRide().getDriver().getCarModel());
        driverInfo.setLicensePlate(booking.getRide().getDriver().getLicensePlate());
        rideInfo.setDriver(driverInfo);
        
        response.setRide(rideInfo);
        
        PassengerInfo passengerInfo = new PassengerInfo();
        passengerInfo.setId(booking.getPassenger().getId());
        passengerInfo.setName(booking.getPassenger().getName());
        passengerInfo.setEmail(booking.getPassenger().getEmail());
        passengerInfo.setPhone(booking.getPassenger().getPhone());
        response.setPassenger(passengerInfo);
        
        return response;
    }
}