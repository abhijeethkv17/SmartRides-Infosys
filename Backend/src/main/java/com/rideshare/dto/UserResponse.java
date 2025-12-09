package com.rideshare.dto;

import com.rideshare.model.Role;
import com.rideshare.model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String carModel;
    private String licensePlate;
    private Integer vehicleCapacity;
    private Double averageRating; // Added field
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static UserResponse fromUser(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setCarModel(user.getCarModel());
        response.setLicensePlate(user.getLicensePlate());
        response.setVehicleCapacity(user.getVehicleCapacity());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        // Note: averageRating is not set here as it requires a repository call.
        // It must be set by the Service layer.
        return response;
    }
}