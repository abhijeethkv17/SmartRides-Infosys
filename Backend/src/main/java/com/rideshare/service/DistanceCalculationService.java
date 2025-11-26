package com.rideshare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class DistanceCalculationService {
    
    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public DistanceCalculationService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Calculate distance between two locations using Google Maps Distance Matrix API
     * @param origin Starting location (e.g., "Bangalore, Karnataka")
     * @param destination Ending location (e.g., "Mysore, Karnataka")
     * @return Distance in kilometers
     */
    public Double calculateDistance(String origin, String destination) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://maps.googleapis.com/maps/api/distancematrix/json")
                    .queryParam("origins", origin)
                    .queryParam("destinations", destination)
                    .queryParam("key", googleMapsApiKey)
                    .queryParam("units", "metric")
                    .build()
                    .toUriString();
            
            String response = restTemplate.getForObject(url, String.class);
            
            if (response == null) {
                throw new RuntimeException("Failed to get response from Google Maps API");
            }
            
            JsonNode root = objectMapper.readTree(response);
            
            // Check if API call was successful
            String status = root.path("status").asText();
            if (!"OK".equals(status)) {
                throw new RuntimeException("Google Maps API returned status: " + status);
            }
            
            // Extract distance from response
            JsonNode rows = root.path("rows");
            if (rows.isEmpty()) {
                throw new RuntimeException("No route found between locations");
            }
            
            JsonNode elements = rows.get(0).path("elements");
            if (elements.isEmpty()) {
                throw new RuntimeException("No distance data available");
            }
            
            JsonNode element = elements.get(0);
            String elementStatus = element.path("status").asText();
            
            if (!"OK".equals(elementStatus)) {
                throw new RuntimeException("Unable to calculate distance: " + elementStatus);
            }
            
            // Distance is returned in meters, convert to kilometers
            int distanceInMeters = element.path("distance").path("value").asInt();
            double distanceInKm = distanceInMeters / 1000.0;
            
            // Round to 2 decimal places
            return Math.round(distanceInKm * 100.0) / 100.0;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate distance: " + e.getMessage(), e);
        }
    }
    
    /**
     * Calculate estimated travel time in minutes
     * @param origin Starting location
     * @param destination Ending location
     * @return Travel time in minutes
     */
    public Integer calculateTravelTime(String origin, String destination) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://maps.googleapis.com/maps/api/distancematrix/json")
                    .queryParam("origins", origin)
                    .queryParam("destinations", destination)
                    .queryParam("key", googleMapsApiKey)
                    .queryParam("units", "metric")
                    .build()
                    .toUriString();
            
            String response = restTemplate.getForObject(url, String.class);
            
            if (response == null) {
                throw new RuntimeException("Failed to get response from Google Maps API");
            }
            
            JsonNode root = objectMapper.readTree(response);
            JsonNode element = root.path("rows").get(0).path("elements").get(0);
            
            // Duration is returned in seconds, convert to minutes
            int durationInSeconds = element.path("duration").path("value").asInt();
            return durationInSeconds / 60;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate travel time: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get distance and duration data
     * @param origin Starting location
     * @param destination Ending location
     * @return DistanceData object containing distance in km and duration in minutes
     */
    public DistanceData getDistanceAndDuration(String origin, String destination) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://maps.googleapis.com/maps/api/distancematrix/json")
                    .queryParam("origins", origin)
                    .queryParam("destinations", destination)
                    .queryParam("key", googleMapsApiKey)
                    .queryParam("units", "metric")
                    .build()
                    .toUriString();
            
            String response = restTemplate.getForObject(url, String.class);
            
            if (response == null) {
                throw new RuntimeException("Failed to get response from Google Maps API");
            }
            
            JsonNode root = objectMapper.readTree(response);
            
            String status = root.path("status").asText();
            if (!"OK".equals(status)) {
                throw new RuntimeException("Google Maps API returned status: " + status);
            }
            
            JsonNode element = root.path("rows").get(0).path("elements").get(0);
            String elementStatus = element.path("status").asText();
            
            if (!"OK".equals(elementStatus)) {
                throw new RuntimeException("Unable to calculate distance: " + elementStatus);
            }
            
            int distanceInMeters = element.path("distance").path("value").asInt();
            int durationInSeconds = element.path("duration").path("value").asInt();
            
            double distanceInKm = Math.round((distanceInMeters / 1000.0) * 100.0) / 100.0;
            int durationInMinutes = durationInSeconds / 60;
            
            return new DistanceData(distanceInKm, durationInMinutes);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to get distance data: " + e.getMessage(), e);
        }
    }
    
    /**
     * Data class to hold distance and duration information
     */
    public static class DistanceData {
        private final Double distanceKm;
        private final Integer durationMinutes;
        
        public DistanceData(Double distanceKm, Integer durationMinutes) {
            this.distanceKm = distanceKm;
            this.durationMinutes = durationMinutes;
        }
        
        public Double getDistanceKm() {
            return distanceKm;
        }
        
        public Integer getDurationMinutes() {
            return durationMinutes;
        }
    }
}