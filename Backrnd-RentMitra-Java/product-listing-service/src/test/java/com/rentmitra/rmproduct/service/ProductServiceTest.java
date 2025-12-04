package com.rentmitra.rmproduct.service;

import com.rentmitra.rmproduct.model.*;
import com.rentmitra.rmproduct.repository.CategoryRepository;
import com.rentmitra.rmproduct.repository.ProductRepository;
import com.rentmitra.rmproduct.request.ProductRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    @Mock
    private MultipartFile multipartFile;

    private Category mockCategory;

    private Product mockProduct;

    private ProductService spyProductService;

    @BeforeEach
    public void setUp() {

        Subcategory mockSubcategory = new Subcategory();
        mockSubcategory.setSubcategoryId(1);
        mockSubcategory.setName("MockSubcategory");
        mockCategory = new Category();
        mockCategory.setCategoryId(1);
        mockCategory.setName("MockCategory");
        mockCategory.setSubcategories(List.of(mockSubcategory));

        mockProduct = new Product();
        mockProduct.setProductId(1);
        mockProduct.setName("MockProduct");
        mockProduct.setCategoryId(1);
        mockProduct.setSubcategoryId(1);
        mockProduct.setRentType("daily");
        mockProduct.setRentBasedOnType(BigDecimal.valueOf(500));
        mockProduct.setAddress("Mock Address");
        mockProduct.setNavigation("Mock Navigation");
        mockProduct.setMessage("Mock Message");
        mockProduct.setMobileNumber("1234567890");
        mockProduct.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        spyProductService = Mockito.spy(productService);
    }

    @Test
    public void testGetProductsByCategoryAndSubcategory() {

        when(productRepository.findByCategoryIdAndSubcategoryId(1, 1)).thenReturn(List.of(mockProduct));

        List<ProductDto> products = productService.getProductsByCategoryAndSubcategory(1, 1);

        assertEquals(1, products.size());
        assertEquals("MockProduct", products.get(0).getName());
        verify(productRepository, times(1)).findByCategoryIdAndSubcategoryId(1, 1);
    }

    @Test
    public void testGetProductsBySubcategoryName_Success() {

        when(categoryRepository.findAll()).thenReturn(List.of(mockCategory));
        when(productRepository.findBySubcategoryId(1)).thenReturn(List.of(mockProduct));

        List<ProductDto> products = productService.getProductsBySubcategoryName("MockSubcategory");

        assertEquals(1, products.size());
        assertEquals("MockProduct", products.get(0).getName());
        verify(productRepository, times(1)).findBySubcategoryId(1);
    }

    @Test
    public void testGetProductsBySubcategoryName_SubcategoryNotFound() {

        when(categoryRepository.findAll()).thenReturn(List.of(mockCategory));
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                productService.getProductsBySubcategoryName("InvalidSubcategory")
        );
        assertEquals("Subcategory not found: InvalidSubcategory", exception.getMessage());
        verify(productRepository, never()).findBySubcategoryId(anyInt());
    }

    @Test
    public void testAddProduct_SaveImagesThrowsIOException(){

        ProductRequest productDto = getProductRequest();

        Category mockCategory = new Category();
        mockCategory.setCategoryId(1);
        Subcategory mockSubcategory = new Subcategory();
        mockSubcategory.setSubcategoryId(1);
        mockCategory.setSubcategories(List.of(mockSubcategory));

        when(categoryRepository.findById(1)).thenReturn(Optional.of(mockCategory));
        List<MultipartFile> imageFiles = List.of(multipartFile);
//        spyProductService.addProduct(productDto, imageFiles);
    }

    private static ProductRequest getProductRequest() {

        ProductRequest productDto = new ProductRequest();
        productDto.setName("NewProduct");
        productDto.setBrand("Brand");
        productDto.setCategoryId(1);
        productDto.setSubcategoryId(1);
        productDto.setRentType("weekly");
        productDto.setRentBasedOnType(BigDecimal.valueOf(500));
        productDto.setAddress("Sample Address");
        productDto.setNavigation("Sample Navigation");
        productDto.setMessage("Sample Message");
        productDto.setMobileNumber("1234567890");
        return productDto;
    }

    @Test
    public void testAddProduct_CategoryNotFound() {

        ProductRequest productDto = new ProductRequest();
        productDto.setCategoryId(99);

        when(categoryRepository.findById(99)).thenReturn(Optional.empty());

        MultipartFile mockMultipartFile = Mockito.mock(MultipartFile.class);
        List<MultipartFile> imageFiles = List.of(mockMultipartFile);

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                productService.addProduct(productDto,imageFiles)
        );

        assertEquals("Category not found", exception.getMessage());
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    public void testAddProduct_SubcategoryNotFound() {

        ProductRequest productDto = new ProductRequest();
        productDto.setCategoryId(1);
        productDto.setSubcategoryId(99);

        when(categoryRepository.findById(1)).thenReturn(Optional.of(mockCategory));
        MultipartFile mockMultipartFile = Mockito.mock(MultipartFile.class);
        List<MultipartFile> imageFiles = List.of(mockMultipartFile);


        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                productService.addProduct(productDto,imageFiles)
        );

        assertEquals("Subcategory not found under the selected category", exception.getMessage());
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    public void testGetProductsByRentType() {

        when(productRepository.findByRentType("daily")).thenReturn(List.of(mockProduct));

        List<ProductDto> products = productService.getProductsByRentType("daily");

        assertEquals(1, products.size());
        assertEquals("MockProduct", products.get(0).getName());
        verify(productRepository, times(1)).findByRentType("daily");
    }

    @Test
    public void testFilterProducts_Success() {

        when(productRepository.findProductsByCategoryAndSubcategoryAndPriceRange(
                1, 1, 100.0, 500.0))
                .thenReturn(List.of(mockProduct));

        List<ProductDto> productDtos = productService.filterProducts(1, 1, 100.0, 500.0);

        assertEquals(1, productDtos.size());
        ProductDto productDto = productDtos.get(0);
        assertEquals("MockProduct", productDto.getName());
        assertEquals(1, productDto.getCategoryId());
        assertEquals(1, productDto.getSubcategoryId());
        assertEquals("daily", productDto.getRentType());
        assertEquals(BigDecimal.valueOf(500), productDto.getRentBasedOnType());
        assertEquals("Mock Address", productDto.getAddress());
        assertEquals("Mock Navigation", productDto.getNavigation());
        assertEquals("Mock Message", productDto.getMessage());
        assertEquals("1234567890", productDto.getMobileNumber());

        verify(productRepository, times(1))
                .findProductsByCategoryAndSubcategoryAndPriceRange(1, 1, 100.0, 500.0);
    }

    @Test
    public void testFilterProducts_NoResults() {

        when(productRepository.findProductsByCategoryAndSubcategoryAndPriceRange(
                1, 1, 100.0, 500.0))
                .thenReturn(List.of());

        List<ProductDto> productDos = productService.filterProducts(1, 1, 100.0, 500.0);

        assertEquals(0, productDos.size());

        verify(productRepository, times(1))
                .findProductsByCategoryAndSubcategoryAndPriceRange(1, 1, 100.0, 500.0);
    }

    @Test
    public void testFilterProducts_InvalidParameters() {

        when(productRepository.findProductsByCategoryAndSubcategoryAndPriceRange(
                null, null, null, null))
                .thenReturn(List.of());

        List<ProductDto> productDos = productService.filterProducts(null, null, null, null);
        assertEquals(0, productDos.size());
        verify(productRepository, times(1))
                .findProductsByCategoryAndSubcategoryAndPriceRange(null, null, null, null);
    }

    @Test
    public void testDeleteProduct_Success() {

        when(productRepository.findByProductIdAndCategoryIdAndSubcategoryId(1, 1, 1))
                .thenReturn(Optional.of(mockProduct));

        productService.deleteProduct(1, 1, 1);
        verify(productRepository, times(1)).findByProductIdAndCategoryIdAndSubcategoryId(1, 1, 1);
        verify(productRepository, times(1)).delete(mockProduct);
    }

    @Test
    public void testDeleteProduct_ProductNotFound() {

        when(productRepository.findByProductIdAndCategoryIdAndSubcategoryId(99, 1, 1))
                .thenReturn(Optional.empty());
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                productService.deleteProduct(99, 1, 1)
        );
        assertEquals("Product with ID 99 not found in Category ID 1 and Subcategory ID 1", exception.getMessage());
        verify(productRepository, times(1)).findByProductIdAndCategoryIdAndSubcategoryId(99, 1, 1);
        verify(productRepository, never()).delete(any(Product.class));
    }

}