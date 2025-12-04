package com.rent_mitra.rental_service.entity;

import com.rent_mitra.rental_service.dto.RentalStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="rental_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer rentalId;
    private Integer userId;
    private Integer productId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double totalAmount;
    @Enumerated(EnumType.STRING)
    private RentalStatus status;
}
