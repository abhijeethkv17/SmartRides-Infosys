package com.rideshare.dto;

import com.rideshare.model.Notification;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String type;
    private String message;
    private Long relatedId;
    private boolean isRead;
    private LocalDateTime createdAt;
    
    public static NotificationResponse fromEntity(Notification n) {
        NotificationResponse response = new NotificationResponse();
        response.setId(n.getId());
        response.setType(n.getType());
        response.setMessage(n.getMessage());
        response.setRelatedId(n.getRelatedId());
        response.setRead(n.isRead());
        response.setCreatedAt(n.getCreatedAt());
        return response;
    }
}