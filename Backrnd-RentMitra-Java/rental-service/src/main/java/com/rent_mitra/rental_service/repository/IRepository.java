package com.rent_mitra.rental_service.repository;

import com.rent_mitra.rental_service.entity.RentalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IRepository extends JpaRepository<RentalRecord,Integer> {

    public List<RentalRecord> findByUserId(Integer userId);
    public List<RentalRecord> findByProductId(Integer productId);
}
