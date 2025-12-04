package com.rentmitra.rmproduct.service;
import com.rentmitra.rmproduct.model.Category;
import com.rentmitra.rmproduct.model.CategoryDTO;
import com.rentmitra.rmproduct.model.Subcategory;
import com.rentmitra.rmproduct.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @BeforeEach
    public  void setUp(){

    }

    @Test
    public void testallcategorywithsubcategories() {

        Subcategory subcategory1 = new Subcategory();
        subcategory1.setSubcategoryId(1);
        subcategory1.setName("Subcategory1");

        Subcategory subcategory2 = new Subcategory();
        subcategory2.setSubcategoryId(2);
        subcategory2.setName("Subcategory2");

        // Mock categories
        Category category1 = new Category();
        category1.setCategoryId(1);
        category1.setName("Category1");
        category1.setSubcategories(List.of(subcategory1, subcategory2));

        Category category2 = new Category();
        category2.setCategoryId(2);
        category2.setName("Category2");
        category2.setSubcategories(List.of(subcategory1, subcategory2));

        when(categoryRepository.findAll()).thenReturn(List.of(category1, category2));

        List<CategoryDTO> categoryDTOS = categoryService.getAllCategoriesWithSubcategories();

        assertEquals(2, categoryDTOS.size());
        assertEquals("Category1", categoryDTOS.get(0).getName());
        assertEquals("Category2", categoryDTOS.get(1).getName());
    }


    @Test
    public void testGetAllCategoryNames() {

        Subcategory subcategory1 = new Subcategory();
        subcategory1.setSubcategoryId(1);
        subcategory1.setName("Subcategory1");

        Subcategory subcategory2 = new Subcategory();
        subcategory2.setSubcategoryId(2);
        subcategory2.setName("Subcategory2");

        Category category1 = new Category();
        category1.setCategoryId(1);
        category1.setName("Category1");
        category1.setSubcategories(List.of(subcategory1, subcategory2));

        Category category2 = new Category();
        category2.setCategoryId(2);
        category2.setName("Category2");
        category2.setSubcategories(List.of(subcategory1, subcategory2));

        when(categoryRepository.findAll()).thenReturn(List.of(category1, category2));

        List<String> categoryNames = categoryService.getAllCategoryNames();

        assertEquals(2, categoryNames.size());
        assertEquals("Category1", categoryNames.get(0));
        assertEquals("Category2", categoryNames.get(1));
    }

    @Test
    public void testGetSubcategoriesByCategoryName() {

        Subcategory subcategory1 = new Subcategory();
        subcategory1.setSubcategoryId(1);
        subcategory1.setName("Subcategory1");

        Subcategory subcategory2 = new Subcategory();
        subcategory2.setSubcategoryId(2);
        subcategory2.setName("Subcategory2");

        Category category = new Category();
        category.setCategoryId(1);
        category.setName("Category1");
        category.setSubcategories(List.of(subcategory1, subcategory2));

        when(categoryRepository.findByNameIgnoreCase("Category1")).thenReturn(java.util.Optional.of(category));

        List<CategoryService.SubcategoryDto> subcategoryDTOList = categoryService.getSubcategoriesByCategoryName("Category1");

        assertEquals(2, subcategoryDTOList.size(), "There should be 2 subcategories");
        assertEquals(subcategory1, subcategoryDTOList.get(0));
        assertEquals(subcategory2, subcategoryDTOList.get(1));
    }

}
