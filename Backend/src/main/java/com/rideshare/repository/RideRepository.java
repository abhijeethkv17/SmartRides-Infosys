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
    
    @Query("SELECT r FROM Ride r WHERE " +
           "LOWER(r.source) LIKE LOWER(CONCAT('%', :source, '%')) AND " +
           "LOWER(r.destination) LIKE LOWER(CONCAT('%', :destination, '%')) AND " +
           "r.departureDateTime >= :date AND " +
           "r.availableSeats > 0 AND " +
           "r.status = 'ACTIVE' " +
           "ORDER BY r.departureDateTime ASC")
    List<Ride> searchRides(@Param("source") String source, 
                          @Param("destination") String destination, 
                          @Param("date") LocalDateTime date);
}