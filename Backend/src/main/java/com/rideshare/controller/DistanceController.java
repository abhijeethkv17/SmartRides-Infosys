package com.rideshare.controller;

import com.rideshare.dto.ApiResponse;
import com.rideshare.service.DistanceCalculationService;
import com.rideshare.service.FareCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/distance")
@CrossOrigin(origins = "*")
public class DistanceController {
    
    @Autowired
    private DistanceCalculationService distanceCalculationService;
    
    @Autowired
    private FareCalculationService fareCalculationService;
    
    /**
     * Calculate distance between two locations
     */
    @GetMapping("/calculate")
    public ResponseEntity<?> calculateDistance(
            @RequestParam String origin,
            @RequestParam String destination) {
        try {
            Double distance = distanceCalculationService.calculateDistance(origin, destination);
            
            Map<String, Object> response = new HashMap<>();
            response.put("origin", origin);
            response.put("destination", destination);
            response.put("distanceKm", distance);
            
            return ResponseEntity.ok(new ApiResponse(true, "Distance calculated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Get distance and estimated travel time
     */
    @GetMapping("/details")
    public ResponseEntity<?> getDistanceDetails(
            @RequestParam String origin,
            @RequestParam String destination) {
        try {
            DistanceCalculationService.DistanceData data = 
                    distanceCalculationService.getDistanceAndDuration(origin, destination);
            
            Map<String, Object> response = new HashMap<>();
            response.put("origin", origin);
            response.put("destination", destination);
            response.put("distanceKm", data.getDistanceKm());
            response.put("durationMinutes", data.getDurationMinutes());
            
            return ResponseEntity.ok(new ApiResponse(true, "Distance details retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    /**
     * Calculate fare estimate
     */
    @GetMapping("/fare-estimate")
    public ResponseEntity<?> getFareEstimate(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam Double pricePerKm,
            @RequestParam(defaultValue = "1") Integer seatsBooked) {
        try {
            // Get distance
            DistanceCalculationService.DistanceData data = 
                    distanceCalculationService.getDistanceAndDuration(origin, destination);
            
            // Calculate fare breakdown
            FareCalculationService.FareBreakdown breakdown = 
                    fareCalculationService.calculateFareBreakdown(
                            data.getDistanceKm(), pricePerKm, seatsBooked);
            
            // Calculate driver earnings
            Double driverEarnings = fareCalculationService.calculateDriverEarnings(breakdown.getTotalFare());
            
            Map<String, Object> response = new HashMap<>();
            response.put("origin", origin);
            response.put("destination", destination);
            response.put("distanceKm", data.getDistanceKm());
            response.put("durationMinutes", data.getDurationMinutes());
            response.put("pricePerKm", pricePerKm);
            response.put("seatsBooked", seatsBooked);
            response.put("baseFare", breakdown.getBaseFare());
            response.put("distanceFare", breakdown.getDistanceFare());
            response.put("bookingFee", breakdown.getBookingFee());
            response.put("totalFare", breakdown.getTotalFare());
            response.put("minimumFareApplied", breakdown.isMinimumFareApplied());
            response.put("driverEarnings", driverEarnings);
            response.put("platformCommission", breakdown.getTotalFare() - driverEarnings);
            
            return ResponseEntity.ok(new ApiResponse(true, "Fare estimated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}