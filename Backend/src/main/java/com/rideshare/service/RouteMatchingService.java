package com.rideshare.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rideshare.model.Ride;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RouteMatchingService {
    
    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    // Maximum detour percentage driver willing to make (20%)
    private static final double MAX_DETOUR_PERCENTAGE = 0.20;
    
    // Maximum distance from main route to consider (in km)
    private static final double MAX_DEVIATION_KM = 15.0;
    
    public RouteMatchingService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Match rides with intelligent route matching
     * Returns rides sorted by match quality (exact matches first, then partial matches)
     */
    public List<RideMatch> matchRides(List<Ride> availableRides, 
                                      String passengerSource, 
                                      String passengerDestination) {
        
        List<RideMatch> matches = new ArrayList<>();
        
        for (Ride ride : availableRides) {
            RideMatch match = analyzeRideMatch(
                ride, 
                passengerSource, 
                passengerDestination
            );
            
            if (match != null) {
                matches.add(match);
            }
        }
        
        // Sort by match quality: EXACT > ALONG_ROUTE > PARTIAL_DETOUR
        matches.sort((a, b) -> {
            int typeCompare = a.getMatchType().ordinal() - b.getMatchType().ordinal();
            if (typeCompare != 0) return typeCompare;
            
            // If same match type, sort by match score (higher is better)
            return Double.compare(b.getMatchScore(), a.getMatchScore());
        });
        
        return matches;
    }
    
    /**
     * Analyze how well a ride matches passenger requirements
     */
    private RideMatch analyzeRideMatch(Ride ride, 
                                       String passengerSource, 
                                       String passengerDestination) {
        try {
            String rideSource = ride.getSource();
            String rideDestination = ride.getDestination();
            
            // Check for exact match
            if (isLocationMatch(rideSource, passengerSource) && 
                isLocationMatch(rideDestination, passengerDestination)) {
                
                return new RideMatch(
                    ride,
                    MatchType.EXACT,
                    100.0,
                    0.0,
                    "Exact route match",
                    null,
                    null
                );
            }
            
            // Get route details for advanced matching
            RouteDetails rideRoute = getRouteDetails(rideSource, rideDestination);
            RouteDetails passengerRoute = getRouteDetails(passengerSource, passengerDestination);
            
            if (rideRoute == null || passengerRoute == null) {
                return null; // Can't analyze routes
            }
            
            // Check if passenger route is along driver's route
            RouteAnalysis analysis = analyzeRouteAlignment(
                rideRoute, 
                passengerRoute,
                passengerSource,
                passengerDestination
            );
            
            if (analysis.isAlongRoute) {
                return new RideMatch(
                    ride,
                    MatchType.ALONG_ROUTE,
                    analysis.matchScore,
                    analysis.extraDistance,
                    analysis.description,
                    analysis.pickupPoint,
                    analysis.dropPoint
                );
            }
            
            // Check if ride can make a reasonable detour
            if (analysis.extraDistance <= rideRoute.distanceKm * MAX_DETOUR_PERCENTAGE &&
                analysis.extraDistance <= MAX_DEVIATION_KM) {
                
                return new RideMatch(
                    ride,
                    MatchType.PARTIAL_DETOUR,
                    analysis.matchScore,
                    analysis.extraDistance,
                    analysis.description,
                    analysis.pickupPoint,
                    analysis.dropPoint
                );
            }
            
            return null; // No viable match
            
        } catch (Exception e) {
            System.err.println("Error analyzing ride match: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Analyze how well passenger route aligns with ride route
     */
    private RouteAnalysis analyzeRouteAlignment(RouteDetails rideRoute,
                                                 RouteDetails passengerRoute,
                                                 String passengerSource,
                                                 String passengerDestination) {
        
        RouteAnalysis analysis = new RouteAnalysis();
        
        try {
            // Get waypoint analysis - check if passenger points are on driver's route
            WaypointAnalysis pickupAnalysis = analyzeWaypoint(
                rideRoute.startLat, rideRoute.startLng,
                rideRoute.endLat, rideRoute.endLng,
                passengerSource
            );
            
            WaypointAnalysis dropAnalysis = analyzeWaypoint(
                rideRoute.startLat, rideRoute.startLng,
                rideRoute.endLat, rideRoute.endLng,
                passengerDestination
            );
            
            // Both pickup and drop are reasonably close to driver's route
            if (pickupAnalysis.distanceFromRoute <= MAX_DEVIATION_KM && 
                dropAnalysis.distanceFromRoute <= MAX_DEVIATION_KM) {
                
                // Calculate extra distance driver needs to travel
                double directDistance = rideRoute.distanceKm;
                double withPassengerDistance = calculateRouteWithWaypoints(
                    rideRoute,
                    passengerSource,
                    passengerDestination
                );
                
                analysis.extraDistance = withPassengerDistance - directDistance;
                analysis.isAlongRoute = true;
                
                // Calculate match score (100 = perfect, lower is worse)
                double detourPercent = analysis.extraDistance / directDistance;
                analysis.matchScore = Math.max(0, 100 - (detourPercent * 100));
                
                analysis.description = String.format(
                    "Route passes near pickup (+%.1f km) and drop (+%.1f km). Extra distance: %.1f km",
                    pickupAnalysis.distanceFromRoute,
                    dropAnalysis.distanceFromRoute,
                    analysis.extraDistance
                );
                
                analysis.pickupPoint = passengerSource;
                analysis.dropPoint = passengerDestination;
            } else {
                analysis.isAlongRoute = false;
                analysis.matchScore = 0;
            }
            
        } catch (Exception e) {
            System.err.println("Error in route alignment analysis: " + e.getMessage());
            analysis.isAlongRoute = false;
            analysis.matchScore = 0;
        }
        
        return analysis;
    }
    
    /**
     * Calculate distance with waypoints
     */
    private double calculateRouteWithWaypoints(RouteDetails originalRoute,
                                                String waypoint1,
                                                String waypoint2) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://maps.googleapis.com/maps/api/directions/json")
                    .queryParam("origin", originalRoute.start)
                    .queryParam("destination", originalRoute.end)
                    .queryParam("waypoints", waypoint1 + "|" + waypoint2)
                    .queryParam("key", googleMapsApiKey)
                    .build()
                    .toUriString();
            
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            if ("OK".equals(root.path("status").asText())) {
                JsonNode routes = root.path("routes");
                if (routes.size() > 0) {
                    JsonNode legs = routes.get(0).path("legs");
                    double totalDistance = 0;
                    
                    for (JsonNode leg : legs) {
                        totalDistance += leg.path("distance").path("value").asInt();
                    }
                    
                    return totalDistance / 1000.0; // Convert to km
                }
            }
            
            return originalRoute.distanceKm; // Fallback
            
        } catch (Exception e) {
            System.err.println("Error calculating route with waypoints: " + e.getMessage());
            return originalRoute.distanceKm;
        }
    }
    
    /**
     * Analyze if a waypoint is close to the route
     */
    private WaypointAnalysis analyzeWaypoint(double startLat, double startLng,
                                              double endLat, double endLng,
                                              String waypointAddress) {
        try {
            // Get coordinates of waypoint
            Coordinates waypointCoords = geocodeAddress(waypointAddress);
            
            if (waypointCoords == null) {
                return new WaypointAnalysis(false, Double.MAX_VALUE);
            }
            
            // Calculate perpendicular distance from waypoint to line segment
            double distance = calculatePerpendicularDistance(
                startLat, startLng,
                endLat, endLng,
                waypointCoords.lat, waypointCoords.lng
            );
            
            return new WaypointAnalysis(distance <= MAX_DEVIATION_KM, distance);
            
        } catch (Exception e) {
            System.err.println("Error analyzing waypoint: " + e.getMessage());
            return new WaypointAnalysis(false, Double.MAX_VALUE);
        }
    }
    
    /**
     * Calculate perpendicular distance from point to line segment
     */
    private double calculatePerpendicularDistance(double x1, double y1,
                                                   double x2, double y2,
                                                   double px, double py) {
        
        double A = px - x1;
        double B = py - y1;
        double C = x2 - x1;
        double D = y2 - y1;
        
        double dot = A * C + B * D;
        double lenSq = C * C + D * D;
        double param = (lenSq != 0) ? dot / lenSq : -1;
        
        double xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        double dx = px - xx;
        double dy = py - yy;
        
        // Convert to kilometers (approximate)
        return Math.sqrt(dx * dx + dy * dy) * 111.0; // 1 degree ≈ 111 km
    }
    
    /**
     * Get route details including coordinates
     */
    private RouteDetails getRouteDetails(String origin, String destination) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://maps.googleapis.com/maps/api/directions/json")
                    .queryParam("origin", origin)
                    .queryParam("destination", destination)
                    .queryParam("key", googleMapsApiKey)
                    .build()
                    .toUriString();
            
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            if ("OK".equals(root.path("status").asText())) {
                JsonNode route = root.path("routes").get(0);
                JsonNode leg = route.path("legs").get(0);
                
                double distanceMeters = leg.path("distance").path("value").asInt();
                
                JsonNode startLocation = leg.path("start_location");
                JsonNode endLocation = leg.path("end_location");
                
                return new RouteDetails(
                    origin,
                    destination,
                    distanceMeters / 1000.0,
                    startLocation.path("lat").asDouble(),
                    startLocation.path("lng").asDouble(),
                    endLocation.path("lat").asDouble(),
                    endLocation.path("lng").asDouble()
                );
            }
            
            return null;
            
        } catch (Exception e) {
            System.err.println("Error getting route details: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Geocode address to coordinates
     */
    private Coordinates geocodeAddress(String address) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://maps.googleapis.com/maps/api/geocode/json")
                    .queryParam("address", address)
                    .queryParam("key", googleMapsApiKey)
                    .build()
                    .toUriString();
            
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            if ("OK".equals(root.path("status").asText())) {
                JsonNode location = root.path("results").get(0)
                        .path("geometry").path("location");
                
                return new Coordinates(
                    location.path("lat").asDouble(),
                    location.path("lng").asDouble()
                );
            }
            
            return null;
            
        } catch (Exception e) {
            System.err.println("Error geocoding address: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Check if two locations are approximately the same
     */
    private boolean isLocationMatch(String loc1, String loc2) {
        return loc1.trim().equalsIgnoreCase(loc2.trim());
    }
    
    // ==================== Data Classes ====================
    
    public static class RideMatch {
        private final Ride ride;
        private final MatchType matchType;
        private final double matchScore;
        private final double extraDistanceKm;
        private final String matchDescription;
        private final String suggestedPickup;
        private final String suggestedDrop;
        
        public RideMatch(Ride ride, MatchType matchType, double matchScore,
                        double extraDistanceKm, String matchDescription,
                        String suggestedPickup, String suggestedDrop) {
            this.ride = ride;
            this.matchType = matchType;
            this.matchScore = matchScore;
            this.extraDistanceKm = extraDistanceKm;
            this.matchDescription = matchDescription;
            this.suggestedPickup = suggestedPickup;
            this.suggestedDrop = suggestedDrop;
        }
        
        public Ride getRide() { return ride; }
        public MatchType getMatchType() { return matchType; }
        public double getMatchScore() { return matchScore; }
        public double getExtraDistanceKm() { return extraDistanceKm; }
        public String getMatchDescription() { return matchDescription; }
        public String getSuggestedPickup() { return suggestedPickup; }
        public String getSuggestedDrop() { return suggestedDrop; }
    }
    
    public enum MatchType {
        EXACT,           // Exact source and destination match
        ALONG_ROUTE,     // Passenger pickup/drop along driver's route
        PARTIAL_DETOUR   // Small detour required
    }
    
    private static class RouteDetails {
        String start;
        String end;
        double distanceKm;
        double startLat;
        double startLng;
        double endLat;
        double endLng;
        
        RouteDetails(String start, String end, double distanceKm,
                    double startLat, double startLng,
                    double endLat, double endLng) {
            this.start = start;
            this.end = end;
            this.distanceKm = distanceKm;
            this.startLat = startLat;
            this.startLng = startLng;
            this.endLat = endLat;
            this.endLng = endLng;
        }
    }
    
    private static class RouteAnalysis {
        boolean isAlongRoute;
        double extraDistance;
        double matchScore;
        String description;
        String pickupPoint;
        String dropPoint;
    }
    
    private static class WaypointAnalysis {
        boolean isOnRoute;
        double distanceFromRoute;
        
        WaypointAnalysis(boolean isOnRoute, double distanceFromRoute) {
            this.isOnRoute = isOnRoute;
            this.distanceFromRoute = distanceFromRoute;
        }
    }
    
    private static class Coordinates {
        double lat;
        double lng;
        
        Coordinates(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }
    }
}