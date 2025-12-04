package com.rent_mitra.rental_service.controller;

import com.rent_mitra.rental_service.dto.ApiResponse;
import com.rent_mitra.rental_service.dto.RentalRecordDto;
import com.rent_mitra.rental_service.request.RentalRequest;
import com.rent_mitra.rental_service.service.IRentalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api-rental-service")
public class RentalServiceController {

    Logger logger = LoggerFactory.getLogger(RentalServiceController.class);

    @Autowired
    private IRentalService rentalService;

    @GetMapping
    public String testRentalService(){
        return "This is Rental service test controller";
    }

    @PostMapping("/rent")
    public ResponseEntity<ApiResponse> takeOnRent(@RequestBody RentalRequest rentalRequest){
        try{
            logger.info("request for rent:{}",rentalRequest.getUserId());
            return new ResponseEntity<>(new ApiResponse("!Created", rentalService.createRental(rentalRequest)),
                    HttpStatus.OK);
        } catch (Exception e) {
            logger.error("error in rent api:{}",e.getMessage());
            return new ResponseEntity<>(new ApiResponse("!failed", e.getMessage()),
                    HttpStatus.CONFLICT);
        }
    }

    @PatchMapping("/extend")
    public ResponseEntity<ApiResponse> extendRental(@RequestParam("rentalId")Integer id,
                                                    @RequestParam("days")
                                                    Integer days){
        try{
            logger.info("extend the rent period:{}",days);
          String msg = rentalService.extendRentApi(id, days);
          return new ResponseEntity<>(new ApiResponse("!Success",msg),HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("error in extending duration:{}",e.getMessage());
            return new ResponseEntity<>(new ApiResponse("!failed",e.getMessage()),
                    HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/getAllRentalRecords")
    public ResponseEntity<ApiResponse> getRentalRecordsApi(@RequestParam("userId")Integer id){
        try {
            List<RentalRecordDto> rentalRecordDtoList = rentalService.getAllByUserId(id);
            logger.info("rent history of user :{}",id);
            return new ResponseEntity<>(new ApiResponse("! Success", rentalRecordDtoList),
                    HttpStatus.OK);
        } catch (Exception e) {
            logger.warn("No rentals available for userId: {}",id);
            return new ResponseEntity<>(new ApiResponse("! failed",e.getMessage()),
                    HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/cancel")
    public ResponseEntity<ApiResponse> cancelRent(@RequestParam("rentId")Integer id){
        try{
            logger.info("! cancel rent with rentId :{}",id);
            return new ResponseEntity<>(new ApiResponse("!Success ", rentalService.cancelRentApi(id)),HttpStatus.OK);
        } catch (Exception e) {
            logger.error("error request processing:{}",e.getMessage());
            return new ResponseEntity<>(new ApiResponse("!failed ", e.getMessage()),HttpStatus.NOT_FOUND);
        }
    }
}
