package com.rideshare.controller;

import com.rideshare.dto.ApiResponse;
import com.rideshare.dto.BookingRequest;
import com.rideshare.dto.BookingResponse;
import com.rideshare.dto.RideRequest;
import com.rideshare.dto.RideResponse;
import com.rideshare.service.BookingService;
import com.rideshare.service.RideService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = "*")
public class RideController {
    
    @Autowired
    private RideService rideService;
    
    @Autowired
    private BookingService bookingService;
    
    @PostMapping
    public ResponseEntity<?> postRide(@Valid @RequestBody RideRequest request) {
        try {
            RideResponse ride = rideService.postRide(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Ride posted successfully", ride));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRide(@PathVariable Long id, @Valid @RequestBody RideRequest request) {
        try {
            RideResponse ride = rideService.updateRide(id, request);
            return ResponseEntity.ok(new ApiResponse(true, "Ride updated successfully", ride));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRide(@PathVariable Long id) {
        try {
            rideService.deleteRide(id);
            return ResponseEntity.ok(new ApiResponse(true, "Ride deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Mark ride as COMPLETED
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeRide(@PathVariable Long id) {
        try {
            RideResponse ride = rideService.completeRide(id);
            return ResponseEntity.ok(new ApiResponse(true, "Ride marked as completed", ride));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Cancel ride
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRide(@PathVariable Long id) {
        try {
            RideResponse ride = rideService.cancelRide(id);
            return ResponseEntity.ok(new ApiResponse(true, "Ride cancelled successfully", ride));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchRides(
            @RequestParam String source,
            @RequestParam String destination,
            // Changed from ISO.DATE_TIME to ISO.DATE to accept YYYY-MM-DD
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<RideResponse> rides = rideService.searchRides(source, destination, date);
            return ResponseEntity.ok(new ApiResponse(true, "Rides fetched successfully", rides));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    @GetMapping("/my-rides")
    public ResponseEntity<?> getDriverRides() {
        try {
            List<RideResponse> rides = rideService.getDriverRides();
            return ResponseEntity.ok(new ApiResponse(true, "Rides fetched successfully", rides));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllActiveRides() {
        try {
            List<RideResponse> rides = rideService.getAllActiveRides();
            return ResponseEntity.ok(new ApiResponse(true, "Rides fetched successfully", rides));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getRideById(@PathVariable Long id) {
        try {
            RideResponse ride = rideService.getRideById(id);
            return ResponseEntity.ok(new ApiResponse(true, "Ride fetched successfully", ride));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    @PostMapping("/book")
    public ResponseEntity<?> bookRide(@Valid @RequestBody BookingRequest request) {
        try {
            BookingResponse booking = bookingService.createBooking(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Ride booked successfully", booking));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    @GetMapping("/bookings/passenger")
    public ResponseEntity<?> getPassengerBookings() {
        try {
            List<BookingResponse> bookings = bookingService.getPassengerBookings();
            return ResponseEntity.ok(new ApiResponse(true, "Bookings fetched successfully", bookings));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    @GetMapping("/bookings/driver")
    public ResponseEntity<?> getDriverBookings() {
        try {
            List<BookingResponse> bookings = bookingService.getDriverBookings();
            return ResponseEntity.ok(new ApiResponse(true, "Bookings fetched successfully", bookings));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}