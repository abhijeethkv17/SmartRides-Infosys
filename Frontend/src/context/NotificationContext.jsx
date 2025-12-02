import React, { createContext, useContext, useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "../utils/constants";
import { notificationService } from "../services/notificationService";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stompClient, setStompClient] = useState(null);

  // 1. Fetch existing unread notifications from DB on login
  useEffect(() => {
    if (user) {
      loadNotifications();
      connectToSocket();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
    // eslint-disable-next-line
  }, [user]);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getUnread();
      if (response.success) {
        const loadedNotifs = response.data;
        setNotifications(loadedNotifs);
        setUnreadCount(loadedNotifs.filter((n) => !n.read).length);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  const connectToSocket = () => {
    const baseUrl = API_BASE_URL.replace("/api", "");
    const socketUrl = `${baseUrl}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      onConnect: (frame) => {
        console.log("WebSocket Connected");
        client.subscribe(`/topic/user/${user.id}`, (message) => {
          if (message.body) {
            const newNotif = JSON.parse(message.body);
            // Add to list immediately
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        });
      },
    });

    client.activate();
    setStompClient(client);
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      // API call
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllAsRead, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
