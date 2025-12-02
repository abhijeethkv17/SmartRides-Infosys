package com.rideshare.service;

import com.rideshare.dto.NotificationResponse;
import com.rideshare.model.Notification;
import com.rideshare.model.User;
import com.rideshare.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private UserService userService;
    
    @Transactional
    public void sendNotification(User recipient, String type, String message, Long relatedId) {
        // 1. Save to Database
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setMessage(message);
        notification.setRelatedId(relatedId);
        notification.setRead(false);
        
        Notification savedNotification = notificationRepository.save(notification);
        
        // 2. Push to WebSocket
        // Convert to DTO to avoid infinite recursion issues with User entity
        NotificationResponse response = NotificationResponse.fromEntity(savedNotification);
        
        String destination = "/topic/user/" + recipient.getId();
        messagingTemplate.convertAndSend(destination, response);
    }
    
    public List<NotificationResponse> getUserUnreadNotifications() {
        User user = userService.getCurrentUser();
        List<Notification> notifications = notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user);
        
        return notifications.stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Security check
        User currentUser = userService.getCurrentUser();
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllAsRead() {
        User user = userService.getCurrentUser();
        List<Notification> unread = notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user);
        
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}