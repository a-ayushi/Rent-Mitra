package com.rentmitra.rmproduct.request;

import com.rentmitra.rmproduct.model.SubcategoryDTO;
import lombok.Data;
import java.util.List;

@Data
public class CategoryRequest {
    private String name;
    private List<SubcategoryDTO> subcategories;

}
