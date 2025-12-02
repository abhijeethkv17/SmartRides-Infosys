package com.rideshare.controller;

import com.rideshare.dto.ApiResponse;
import com.rideshare.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping
    public ResponseEntity<?> getUnreadNotifications() {
        return ResponseEntity.ok(new ApiResponse(true, "Notifications fetched", 
                notificationService.getUserUnreadNotifications()));
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok(new ApiResponse(true, "Marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(new ApiResponse(true, "All marked as read"));
    }
}