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
        return response;
    }
}