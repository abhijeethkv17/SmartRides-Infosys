package com.rideshare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // Enable scheduled tasks for auto-completing rides
public class SmartRideApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartRideApplication.class, args);
    }
}