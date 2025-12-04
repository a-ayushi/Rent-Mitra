package com.rentmitra.rmproduct.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentmitra.rmproduct.exceptions.ResourceNotFoundException;
import com.rentmitra.rmproduct.model.Product;
import com.rentmitra.rmproduct.model.ProductDto;
import com.rentmitra.rmproduct.repository.CategoryRepository;
import com.rentmitra.rmproduct.repository.ProductRepository;
import com.rentmitra.rmproduct.request.ProductRequest;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.rentmitra.rmproduct.model.Subcategory;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.*;
import java.util.stream.Collectors;
import com.rentmitra.rmproduct.model.Category;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductService {

    Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CloudinaryService cloudinaryService;


    @Transactional
    public List<ProductDto> getProductsByCategoryAndSubcategory(Integer categoryId, Integer subcategoryId) {
       List<Product> productList = productRepository.findByCategoryIdAndSubcategoryId(categoryId,subcategoryId);
         if(productList==null||productList.isEmpty()){
             throw new ResourceNotFoundException("! No Product Found");
         }
         return productList.stream().map(this::convertToDto).collect(Collectors.toList());
    }


    @Transactional
    public List<ProductDto> getProductsBySubcategoryName(String subcategoryName) {
        Subcategory subcategory = categoryRepository.findAll()
                .stream()
                .flatMap(category -> category.getSubcategories().stream())
                .filter(sc -> sc.getName().equalsIgnoreCase(subcategoryName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Subcategory not found: " + subcategoryName));
        return productRepository.findBySubcategoryId(subcategory.getSubcategoryId()).stream().map(this::convertToDto).
                collect(Collectors.toList());
    }

    @Transactional
    public void addProduct(ProductRequest productdto, List<MultipartFile> makefiles) {
        logger.info("image file received : {} ",makefiles);
        Category category = categoryRepository.findById(productdto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Subcategory subcategory = category.getSubcategories().stream()
                .filter(sc -> sc.getSubcategoryId().equals(productdto.getSubcategoryId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Subcategory not found under the selected category"));

        String concatenatedUrls = null;
        try {
            List<String> imageurls = cloudinaryService.uploadImage(makefiles);
             concatenatedUrls = String.join(",", imageurls);
        }
        catch (IOException e){
            logger.error("getting an error while adding product :{} ",e.getMessage());
        }
        Product product = new Product();
        product.setName(productdto.getName());
        product.setBrand(productdto.getBrand());
        product.setCategoryId(category.getCategoryId());
        product.setSubcategoryId(subcategory.getSubcategoryId());
        product.setRentType(productdto.getRentType());
        product.setRentBasedOnType(productdto.getRentBasedOnType());
        product.setAddress(productdto.getAddress());
        product.setNavigation(productdto.getNavigation());
        product.setMessage(productdto.getMessage());
        product.setMobileNumber(productdto.getMobileNumber());
        product.setImageUrls(concatenatedUrls);
        product.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        product.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        if (productdto.getDynamicAttributes() != null) {
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                String attributesJson = objectMapper.writeValueAsString(productdto.getDynamicAttributes());
                product.setAttributes(attributesJson);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error converting attributes to JSON", e);
            }
        }
        productRepository.save(product);
    }

    @Transactional
    public List<ProductDto> getProductsByRentType(String rentType) {
      List<Product> productList = productRepository.findByRentType(rentType);
      if(productList==null||productList.isEmpty())
          throw new ResourceNotFoundException("! No items Found ");
      return productList.stream().map(this::convertToDto).collect(Collectors.toList());
    }

@Transactional
    public List<ProductDto> filterProducts(Integer categoryId, Integer subcategoryId, Double minPrice, Double maxPrice) {
        List<Product> products = productRepository.findProductsByCategoryAndSubcategoryAndPriceRange(categoryId, subcategoryId, minPrice, maxPrice);
        return products.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public void deleteProduct(Integer productId, Integer categoryId, Integer subcategoryId) {
        Product product = productRepository.findByProductIdAndCategoryIdAndSubcategoryId(productId, categoryId, subcategoryId)
                .orElseThrow(() -> new RuntimeException(
                        String.format("Product with ID %d not found in Category ID %d and Subcategory ID %d",
                                productId, categoryId, subcategoryId)));

        // Delete the product
        productRepository.delete(product);
    }

    @Transactional
    public List<ProductDto> getProductsByBrand(String brand){
             List<Product> products = productRepository.findByBrand(brand);
             if(products.isEmpty())
                 throw new ResourceNotFoundException("! No products found with brand"+brand);
        return products.stream().map(this::convertToDto)
        .collect(Collectors.toList());
    }

    public ProductDto convertToDto(Product product) {

        ModelMapper modelMapper = new ModelMapper();
        ObjectMapper objectMapper = new ObjectMapper();
        modelMapper.typeMap(Product.class, ProductDto.class).addMappings(mapper -> {
            mapper.using(context -> {
                String source = (String) context.getSource();
                if (source == null || source.isEmpty()) {
                    return Collections.emptyList();
                }
                return Arrays.asList(source.split(","));
            }).map(Product::getImageUrls, ProductDto::setImageUrls);

            mapper.using(context -> {
                String source = (String) context.getSource();
                if (source == null || source.isEmpty()) {
                    return Collections.emptyMap();
                }
                try {
                    return objectMapper.readValue(source, Map.class);
                } catch (Exception e) {
                    throw new RuntimeException("Error mapping JSON to Map", e);
                }
            }).map(Product::getAttributes, ProductDto::setDynamicAttributes);
        });
        return modelMapper.map(product, ProductDto.class);
    }

    public List<ProductDto> getAllProducts() {
      return productRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

}
