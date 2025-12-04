package com.rentmitra.rmproduct.repository;

import com.rentmitra.rmproduct.model.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubcategoryRepository extends JpaRepository<Subcategory, Integer> {

    Subcategory findByNameIgnoreCase(String subCategoryName);
}