package com.rentmitra.rmproduct.repository;

import com.rentmitra.rmproduct.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByCategoryIdAndSubcategoryId(Integer categoryId, Integer subcategoryId);

    List<Product> findBySubcategoryId(Integer subcategoryId);

    List<Product> findByRentType(String rentType);

    List<Product> findByBrand(String brand);

    @Query("SELECT p FROM Product p WHERE p.categoryId = :categoryId AND p.subcategoryId = :subcategoryId AND p.rentBasedOnType BETWEEN :minPrice AND :maxPrice")
    List<Product> findProductsByCategoryAndSubcategoryAndPriceRange(
            @Param("categoryId") Integer categoryId,
            @Param("subcategoryId") Integer subcategoryId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice);

    Optional<Product> findByProductIdAndCategoryIdAndSubcategoryId(Integer productId, Integer categoryId, Integer subcategoryId);
}