package com.rentmitra.rmproduct.controller;

import com.rentmitra.rmproduct.model.CategoryDTO;
import com.rentmitra.rmproduct.request.CategoryRequest;
import com.rentmitra.rmproduct.request.ProductRequest;
import com.rentmitra.rmproduct.response.ApiResponse;
import com.rentmitra.rmproduct.service.CategoryService;
import com.rentmitra.rmproduct.service.CloudinaryService;
import com.rentmitra.rmproduct.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.rentmitra.rmproduct.model.ProductDto;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    Logger logger = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse> filterProducts(
            @RequestParam Integer categoryId,
            @RequestParam Integer subcategoryId) {
       try{
         List<ProductDto> productDtoList =  productService.getProductsByCategoryAndSubcategory(categoryId,subcategoryId);
         return new ResponseEntity<>(new ApiResponse("Success",productDtoList),HttpStatus.OK);
       }
       catch (Exception e){
           logger.error("failed to filter products:{}",e.getMessage());
           return new ResponseEntity<>(new ApiResponse("! failed",e.getMessage()),HttpStatus.NOT_FOUND);
       }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategoriesWithSubcategories();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @GetMapping("/category-names")
    public ResponseEntity<List<String>> getAllCategoryNames() {
        List<String> categoryNames = categoryService.getAllCategoryNames();
        return new ResponseEntity<>(categoryNames, HttpStatus.OK);
    }

    @GetMapping("/subcategories")
    public ResponseEntity<ApiResponse> getSubcategoriesByCategoryName(@RequestParam String categoryName) {
       try{
          List<CategoryService.SubcategoryDto> subcategoryDTOList =  categoryService.getSubcategoriesByCategoryName(categoryName);
          return new ResponseEntity<>(new ApiResponse("! Success",subcategoryDTOList),HttpStatus.OK);
       } catch (Exception e) {
           return new ResponseEntity<>(new ApiResponse("! failed",e.getMessage()),HttpStatus.OK);

       }
    }

    @GetMapping("/productsbysubcategory/{subcategoryName}")
    public ResponseEntity<ApiResponse> getProductsBySubcategoryName(@PathVariable String subcategoryName) {
        try{
          List<ProductDto> productDtoList =   productService.getProductsBySubcategoryName(subcategoryName);
          return new ResponseEntity<ApiResponse>(new ApiResponse("Success",productDtoList),HttpStatus.OK);
        } catch (Exception e) {
            logger.error("failed to fetch product for subcategory'{}':{}",subcategoryName,e.getMessage());
            return new ResponseEntity<ApiResponse>(new ApiResponse("!failed",e.getMessage()),HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(value = "/addproduct")
    public ResponseEntity<String> addProduct(@RequestParam("files") List<MultipartFile> files
                                                ,@RequestPart("data") ProductRequest data) {
        try{
            productService.addProduct(data,files);
            return new ResponseEntity<>("Product added successfully", HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("error while adding product:{}",e.getMessage());
            return new ResponseEntity<>("! failed ",HttpStatus.CONFLICT);
        }
    }

    @GetMapping("/filterProductByRentType")
    public ResponseEntity<ApiResponse> filterProductsByRentType(@RequestParam String rentType) {
        try{
            List<ProductDto> productDtoList =  productService.getProductsByRentType(rentType);
            return new ResponseEntity<>(new ApiResponse("Success",productDtoList),HttpStatus.OK);
        }
        catch (Exception e){
            logger.error("failed to fetch products for renttype'{}':{}",rentType,e.getMessage());
            return new ResponseEntity<>(new ApiResponse("! failed",e.getMessage()),HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/filter-products-by-price")
    public ResponseEntity<ApiResponse> filterProductsByCategorySubcategoryAndPrice(
            @RequestParam Integer categoryId,
            @RequestParam Integer subcategoryId,
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
              try{
                 List<ProductDto> productDtoList = productService.filterProducts(categoryId,subcategoryId,minPrice,maxPrice);
                  return new ResponseEntity<>(new ApiResponse("Success",productDtoList),HttpStatus.OK);
              } catch (Exception e) {
                  logger.error("failed to fetch products :{}",e.getMessage());
                  return new ResponseEntity<>(new ApiResponse("! failed",e.getMessage()),HttpStatus.NOT_FOUND);
              }
    }

    @DeleteMapping("deleteproduct/{productId}/category/{categoryId}/subcategory/{subcategoryId}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Integer productId,
            @PathVariable Integer categoryId,
            @PathVariable Integer subcategoryId) {

        productService.deleteProduct(productId, categoryId, subcategoryId);
        return ResponseEntity.ok("Product deleted successfully.");
    }

    @PostMapping("/addcategory")
    public ResponseEntity<String> addcategoryApi(@RequestBody CategoryRequest categoryRequest){
        return new ResponseEntity<>( categoryService.addCategory(categoryRequest),HttpStatus.CREATED);
    }

    @PostMapping("/addSubCategoryImage")
        public ResponseEntity<String> addSubCategoryImageApi(@RequestParam String subCategoryName,@RequestParam MultipartFile imagefile){
       try{
           categoryService.addSubcategoryImage(subCategoryName,imagefile);
           return new ResponseEntity<String>("!Success",HttpStatus.OK);
       } catch (Exception e) {
           return new ResponseEntity<String>("!failed",HttpStatus.CONFLICT);
       }
    }

    @GetMapping("/getByBrand")
    public ResponseEntity<ApiResponse> getProductsByBrand(@RequestParam String brand){
        try{
          List<ProductDto> productDtoList =  productService.getProductsByBrand(brand);
          return new ResponseEntity<ApiResponse>(new ApiResponse("! Success :",productDtoList),HttpStatus.OK);
        } catch (Exception e) {
            logger.error("failed to fetch products for brand '{}':{}",brand,e.getMessage());
            return new ResponseEntity<ApiResponse>(
                    new ApiResponse("! failed:",e.getMessage()),HttpStatus.NOT_FOUND
            );
        }
    }

    @GetMapping("/getAllProducts")
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        List<ProductDto> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }
}
