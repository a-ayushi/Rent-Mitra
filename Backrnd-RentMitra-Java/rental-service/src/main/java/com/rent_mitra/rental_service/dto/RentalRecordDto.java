package com.rent_mitra.rental_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RentalRecordDto {
    private Integer userId;
    private Integer productId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double totalAmount;
}
