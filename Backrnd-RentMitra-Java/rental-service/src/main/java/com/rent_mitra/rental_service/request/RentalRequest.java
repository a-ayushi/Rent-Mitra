package com.rent_mitra.rental_service.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalRequest {
    private Integer userId;
    private Integer productId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
