package com.rideshare.controller;

import com.rideshare.dto.ApiResponse;
import com.rideshare.dto.AuthResponse;
import com.rideshare.dto.LoginRequest;
import com.rideshare.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = "*")
public class AdminAuthController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = adminService.authenticateAdmin(loginRequest);
            return ResponseEntity.ok(new ApiResponse(true, "Admin login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}