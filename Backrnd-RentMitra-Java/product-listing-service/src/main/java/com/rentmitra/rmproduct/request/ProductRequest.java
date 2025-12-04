package com.rentmitra.rmproduct.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductRequest {
    private String name;
    private String brand;
    private Integer categoryId;
    private Integer subcategoryId;
    private String rentType;
    private BigDecimal rentBasedOnType;
    private String address;
    private String navigation;
    private String message;
    private String mobileNumber;
    private Map<String, String> dynamicAttributes;
}
