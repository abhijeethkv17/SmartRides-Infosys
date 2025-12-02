package com.rideshare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationMessage {
    private String type; // e.g., "BOOKING_NEW", "RIDE_CANCELLED"
    private String message;
    private Long relatedId; // BookingID or RideID
}