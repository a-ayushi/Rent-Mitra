package com.rent_mitra.rental_service.service;

import com.rent_mitra.rental_service.dto.RentalRecordDto;
import com.rent_mitra.rental_service.request.RentalRequest;
import java.util.List;

public interface IRentalService {

     public String createRental(RentalRequest rentalRequest);
     public List<RentalRecordDto> getAllByUserId(Integer userId);
     public String extendRentApi(Integer rentId,Integer days);
     public String cancelRentApi(Integer rentId);
}
