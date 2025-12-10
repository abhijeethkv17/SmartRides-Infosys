// UserManagementDTO.java
package com.rideshare.dto;

import com.rideshare.model.Role;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserManagementDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private boolean blocked;
    private boolean verified;
    private LocalDateTime createdAt;
    
    // Driver-specific fields
    private String carModel;
    private String licensePlate;
    private Integer vehicleCapacity;
    
    // Statistics
    private Double averageRating;
    private Integer totalRides;
    private Integer totalBookings;
}