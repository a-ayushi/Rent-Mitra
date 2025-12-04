package com.rentmitra.rmproduct.service;

import com.rentmitra.rmproduct.exceptions.CategoryNotFoundException;
import com.rentmitra.rmproduct.exceptions.ResourceNotFoundException;
import com.rentmitra.rmproduct.model.Category;
import com.rentmitra.rmproduct.model.CategoryDTO;
import com.rentmitra.rmproduct.model.Subcategory;
import com.rentmitra.rmproduct.model.SubcategoryDTO;
import com.rentmitra.rmproduct.repository.CategoryRepository;
import com.rentmitra.rmproduct.repository.SubcategoryRepository;
import com.rentmitra.rmproduct.request.CategoryRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubcategoryRepository subcategoryRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Transactional
    public List<CategoryDTO> getAllCategoriesWithSubcategories() {
        List<Category> categories = categoryRepository.findAll();
        if (categories.isEmpty()) {
            throw new CategoryNotFoundException("No categories found");
        }
        return categories.stream().map(category -> {
            CategoryDTO categoryDTO = new CategoryDTO();
            categoryDTO.setCategoryId(category.getCategoryId());
            categoryDTO.setName(category.getName());

            List<Subcategory> subcategories = category.getSubcategories();
            List<SubcategoryDTO> subcategoryDTOs = subcategories.stream().map(subcategory -> {
                SubcategoryDTO subcategoryDTO = new SubcategoryDTO();
                subcategoryDTO.setSubcategoryId(subcategory.getSubcategoryId());
                subcategoryDTO.setName(subcategory.getName());
                return subcategoryDTO;
            }).collect(Collectors.toList());

            categoryDTO.setSubcategories(subcategoryDTOs);
            return categoryDTO;
        }).collect(Collectors.toList());
    }

    public List<String> getAllCategoryNames() {
        Optional.of(categoryRepository.findAll()).stream().flatMap(List::stream).map(Category::getName)
               .collect(Collectors.toList());
        List<Category> categories = categoryRepository.findAll();
        if (categories.isEmpty()) {
            throw new CategoryNotFoundException("No categories found");
        }
        return categories.stream()
                .map(Category::getName)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<SubcategoryDto> getSubcategoriesByCategoryName(String categoryName) {
        Category category = categoryRepository.findByNameIgnoreCase(categoryName)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found with name: " + categoryName));
           return category.getSubcategories().stream().map(
                   subcategory -> {
                       return new SubcategoryDto(subcategory.getName(),subcategory.getImageUrl());
                   }
           ).collect(Collectors.toList());
    }

    public String addCategory(CategoryRequest categoryRequest) {
        Category category = new Category();
        category.setName(categoryRequest.getName());
        categoryRepository.save(category);
        List<Subcategory> subcategories = categoryRequest.getSubcategories().stream()
                .map(subcategoryDTO -> {
                    Subcategory subcategory = new Subcategory();
                    subcategory.setName(subcategoryDTO.getName());
                    subcategory.setCategory(category);
                    return subcategory;
                })
                .collect(Collectors.toList());
        subcategoryRepository.saveAll(subcategories);
        category.setSubcategories(subcategories);
        categoryRepository.save(category);
        return "!Success category added";
    }

    public void addSubcategoryImage(String subcategoryName, MultipartFile file) {
        Subcategory subcategory = subcategoryRepository.findByNameIgnoreCase(subcategoryName);
        if(subcategory==null)
            throw new ResourceNotFoundException("Subcategory Not Found: " + subcategoryName);

        try {
            String imageUrl = cloudinaryService.uploadImage(file);
            subcategory.setImageUrl(imageUrl);

            subcategoryRepository.save(subcategory);
        } catch (Exception e) {
            throw new RuntimeException("Image upload failed. Please try again later.", e);
        }
    }

    public static class SubcategoryDto {
        private String name;
        private String imageUrl;

        public SubcategoryDto(){}
        public SubcategoryDto(String name, String imageUrl) {
            this.name = name;
            this.imageUrl = imageUrl;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }

}