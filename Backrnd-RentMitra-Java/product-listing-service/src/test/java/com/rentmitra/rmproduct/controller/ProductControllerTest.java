package com.rentmitra.rmproduct.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentmitra.rmproduct.model.CategoryDTO;
import com.rentmitra.rmproduct.model.ProductDto;
import com.rentmitra.rmproduct.service.CategoryService;
import com.rentmitra.rmproduct.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.math.BigDecimal;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class ProductControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProductService productService;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private ProductController productController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(productController).build();
    }

    @Test
    public void testFilterProducts() throws Exception {
        ProductDto product = new ProductDto();
        product.setName("Test Product");
        product.setCategoryId(1);
        product.setSubcategoryId(1);

        when(productService.getProductsByCategoryAndSubcategory(1, 1))
                .thenReturn(List.of(product));

        mockMvc.perform(get("/api/products/filter")
                        .param("categoryId", "1")
                        .param("subcategoryId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Product"));

        verify(productService, times(1)).getProductsByCategoryAndSubcategory(1, 1);
    }

    @Test
    public void testGetAllCategories() throws Exception {
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setCategoryId(1);
        categoryDTO.setName("Category1");

        when(categoryService.getAllCategoriesWithSubcategories())
                .thenReturn(List.of(categoryDTO));

        mockMvc.perform(get("/api/products/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Category1"));

        verify(categoryService, times(1)).getAllCategoriesWithSubcategories();
    }

    @Test
    public void testGetAllCategoryNames() throws Exception {
        when(categoryService.getAllCategoryNames())
                .thenReturn(List.of("Category1", "Category2"));

        mockMvc.perform(get("/api/products/category-names"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Category1"))
                .andExpect(jsonPath("$[1]").value("Category2"));

        verify(categoryService, times(1)).getAllCategoryNames();
    }

    @Test
    public void testGetSubcategoriesByCategoryName() throws Exception {
        CategoryService.SubcategoryDto subcategoryDTO1 = new CategoryService.SubcategoryDto();
        subcategoryDTO1.setName("subcategorydto1");
        subcategoryDTO1.setImageUrl("imageurl");
        CategoryService.SubcategoryDto subcategoryDTO2 = new CategoryService.SubcategoryDto();
        subcategoryDTO2.setName("subcategorydto1");
        subcategoryDTO2.setImageUrl("imageurl");

        when(categoryService.getSubcategoriesByCategoryName("Category1"))
                .thenReturn(List.of(subcategoryDTO1,subcategoryDTO2));

        mockMvc.perform(get("/api/products/subcategories")
                        .param("categoryName", "Category1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Subcategory1"))
                .andExpect(jsonPath("$[1]").value("Subcategory2"));

        verify(categoryService, times(1)).getSubcategoriesByCategoryName("Category1");
    }

    @Test
    public void testGetProductsBySubcategoryName() throws Exception {
        ProductDto product = new ProductDto();
        product.setName("Product1");

        when(productService.getProductsBySubcategoryName("Subcategory1"))
                .thenReturn(List.of(product));

        mockMvc.perform(get("/api/products/productsbysubcategory/Subcategory1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Product1"));

        verify(productService, times(1)).getProductsBySubcategoryName("Subcategory1");
    }

    @Test
    public void testAddProduct() throws Exception {
        ProductDto productDto = new ProductDto();
        productDto.setName("Product1");
        productDto.setCategoryId(1);
        productDto.setSubcategoryId(1);
        productDto.setRentType("Daily");
        productDto.setRentBasedOnType(BigDecimal.valueOf(500));

        ObjectMapper objectMapper = new ObjectMapper();

        mockMvc.perform(post("/api/products/addproduct")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productDto)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Product added successfully"));

    }

    @Test
    public void testFilterProductsByRentType() throws Exception {
        ProductDto product = new ProductDto();
        product.setName("Product1");

        when(productService.getProductsByRentType("Daily"))
                .thenReturn(List.of(product));

        mockMvc.perform(get("/api/products/filterProductByRentType")
                        .param("rentType", "Daily"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Product1"));

        verify(productService, times(1)).getProductsByRentType("Daily");
    }

    @Test
    public void testFilterProductsByCategorySubcategoryAndPrice() throws Exception {

        ProductDto product1 = new ProductDto();
        product1.setName("Product1");
        product1.setCategoryId(1);
        product1.setSubcategoryId(1);
        product1.setRentType("Daily");
        product1.setRentBasedOnType(new BigDecimal("100.0"));
        product1.setAddress("Address1");
        product1.setNavigation("Navigation1");
        product1.setMessage("Available");
        product1.setMobileNumber("1234567890");

        ProductDto product2 = new ProductDto();
        product2.setName("Product2");
        product2.setCategoryId(1);
        product2.setSubcategoryId(1);
        product2.setRentType("Weekly");
        product2.setRentBasedOnType(new BigDecimal("200.0"));
        product2.setAddress("Address2");
        product2.setNavigation("Navigation2");
        product2.setMessage("Available");
        product2.setMobileNumber("0987654321");

        List<ProductDto> filteredProducts = List.of(product1, product2);

        when(productService.filterProducts(1, 1, 50.0, 250.0)).thenReturn(filteredProducts);

        mockMvc.perform(get("/api/products/filter-products-by-price")
                        .param("categoryId", "1")
                        .param("subcategoryId", "1")
                        .param("minPrice", "50.0")
                        .param("maxPrice", "250.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2)) // Validate the response size
                .andExpect(jsonPath("$[0].name").value("Product1")) // Validate product1 details
                .andExpect(jsonPath("$[0].address").value("Address1"))
                .andExpect(jsonPath("$[1].name").value("Product2")) // Validate product2 details
                .andExpect(jsonPath("$[1].rentType").value("Weekly"));

        verify(productService, times(1)).filterProducts(1, 1, 50.0, 250.0);
    }



}
