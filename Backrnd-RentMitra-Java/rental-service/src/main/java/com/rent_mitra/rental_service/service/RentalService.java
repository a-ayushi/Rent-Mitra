package com.rent_mitra.rental_service.service;

import com.rent_mitra.rental_service.dto.RentalRecordDto;
import com.rent_mitra.rental_service.dto.RentalStatus;
import com.rent_mitra.rental_service.entity.RentalRecord;
import com.rent_mitra.rental_service.repository.IRepository;
import com.rent_mitra.rental_service.request.RentalRequest;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RentalService implements IRentalService{

    Logger logger = LoggerFactory.getLogger(RentalService.class);

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private IRepository iRepository;

    @Override
    public String createRental(RentalRequest rentalRequest) {
        logger.info("Creating rental for userId: {} and productId: {}", rentalRequest.getUserId(), rentalRequest.getProductId());
        RentalRecord rentalRecord = RentalRecord.builder()
                .userId(rentalRequest.getUserId())
                .productId(rentalRequest.getProductId())
                .startDate(rentalRequest.getStartDate())
                .endDate(rentalRequest.getEndDate())
                .totalAmount(100.0)
                .status(RentalStatus.ACTIVE)
                .build();
        iRepository.save(rentalRecord);
        logger.info("Rental created successfully with ID: {}", rentalRecord.getRentalId());
        return "Rental created successfully with ID: " + rentalRecord.getRentalId();
    }

    @Override
    public String extendRentApi(Integer rentalId, Integer days) {
        logger.info("extend rent request rent id:{} days:{}",rentalId,days);
        return iRepository.findById(rentalId)
                .map(rentalRecord -> {
                    if (days <= 0) {
                        logger.info("not valid rent days:{}",days);
                        throw new IllegalArgumentException("Days should be greater than zero.");
                    }
                    rentalRecord.setEndDate(rentalRecord.getEndDate().plusDays(days)); // Correct update
                    iRepository.save(rentalRecord);
                    logger.debug("Extending rental with ID {} by {} days", rentalId, days);
                    return "Rental extended successfully. New end date: " + rentalRecord.getEndDate();
                })
                .orElseThrow(() -> new RuntimeException("No Rental Record Found with ID: " + rentalId));
    }

    @Override
    public String cancelRentApi(Integer rentId) {
      logger.info("cancel rent request with rentId:{}",rentId);
       return iRepository.findById(rentId).map(rentalRecord -> {
            rentalRecord.setStatus(RentalStatus.CANCELLED);
            iRepository.save(rentalRecord);
            logger.debug("Rental status updated to CANCEL for rentalId: {}", rentId);
            return "! success rental canceled";
        }).orElseThrow(()->new RuntimeException("No rent record found with id :"+rentId));
    }

    @Override
    public List<RentalRecordDto> getAllByUserId(Integer userId) {
        logger.info("Fetching all rentals for userId: {}", userId);
        return   Optional.ofNullable(iRepository.findByUserId(userId))
                .filter(rentalRecords -> !rentalRecords.isEmpty())
                .map(this::convertToDto)
                .orElseThrow(()->new RuntimeException("NO rental available with userId : "+userId));
    }

    private List<RentalRecordDto> convertToDto(List<RentalRecord> rentalRecords){
        logger.info("convert to dto");
      return  rentalRecords.stream().map(rentalRecord ->
                      modelMapper.map(rentalRecord,RentalRecordDto.class))
                .collect(Collectors.toList());
    }
}
