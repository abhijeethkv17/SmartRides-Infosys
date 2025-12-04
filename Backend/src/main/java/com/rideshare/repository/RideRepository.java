package com.rideshare.repository;

import com.rideshare.model.Ride;
import com.rideshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    
    List<Ride> findByDriverOrderByDepartureDateTimeDesc(User driver);
    
    List<Ride> findByStatusOrderByDepartureDateTimeAsc(String status);
    
    // Find rides by status where departure time is before a certain time
    List<Ride> findByStatusAndDepartureDateTimeBefore(String status, LocalDateTime dateTime);
    
    // Find rides between two dates
    List<Ride> findByStatusAndDepartureDateTimeBetween(String status, LocalDateTime start, LocalDateTime end);
    
    // Updated query to search within a time range (Start Date -> End Date)
    @Query("SELECT r FROM Ride r WHERE " +
           "LOWER(r.source) LIKE LOWER(CONCAT('%', :source, '%')) AND " +
           "LOWER(r.destination) LIKE LOWER(CONCAT('%', :destination, '%')) AND " +
           "r.departureDateTime >= :startDate AND " +
           "r.departureDateTime < :endDate AND " +
           "r.availableSeats > 0 AND " +
           "r.status = 'ACTIVE' " +
           "ORDER BY r.departureDateTime ASC")
    List<Ride> searchRides(@Param("source") String source, 
                          @Param("destination") String destination, 
                          @Param("startDate") LocalDateTime startDate,
                          @Param("endDate") LocalDateTime endDate);
}