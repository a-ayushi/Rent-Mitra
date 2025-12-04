package com.rentmitra.rmproduct.model;

import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@AllArgsConstructor
public class ProductDto {

    private Integer productId;
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
    private List<String> imageUrls;

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public ProductDto() {
    }

    public ProductDto(Integer id,String name, Integer categoryId, Integer subcategoryId, String rentType,
                      BigDecimal rentBasedOnType, String address, String navigation,
                      String message, String mobileNumber, Map<String, String> dynamicAttributes) {
        this.productId = id;
        this.name = name;
        this.categoryId = categoryId;
        this.subcategoryId = subcategoryId;
        this.rentType = rentType;
        this.rentBasedOnType = rentBasedOnType;
        this.address = address;
        this.navigation = navigation;
        this.message = message;
        this.mobileNumber = mobileNumber;
        this.dynamicAttributes = dynamicAttributes;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public Integer getSubcategoryId() {
        return subcategoryId;
    }

    public void setSubcategoryId(Integer subcategoryId) {
        this.subcategoryId = subcategoryId;
    }

    public String getRentType() {
        return rentType;
    }

    public void setRentType(String rentType) {
        this.rentType = rentType;
    }

    public BigDecimal getRentBasedOnType() {
        return rentBasedOnType;
    }

    public void setRentBasedOnType(BigDecimal rentBasedOnType) {
        this.rentBasedOnType = rentBasedOnType;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getNavigation() {
        return navigation;
    }

    public void setNavigation(String navigation) {
        this.navigation = navigation;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public Map<String, String> getDynamicAttributes() {
        return dynamicAttributes;
    }

    public void setDynamicAttributes(Map<String, String> dynamicAttributes) {
        this.dynamicAttributes = dynamicAttributes;
    }
    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public void setBrand(String brand){this.brand=brand;}
    public String getBrand(){return this.brand;}

    // Override toString() method for better logging
    @Override
    public String toString() {
        return "ProductDto{" +
                "name='" + name + '\'' +
                ", categoryId=" + categoryId +
                ", subcategoryId=" + subcategoryId +
                ", rentType='" + rentType + '\'' +
                ", rentBasedOnType=" + rentBasedOnType +
                ", address='" + address + '\'' +
                ", navigation='" + navigation + '\'' +
                ", message='" + message + '\'' +
                ", mobileNumber='" + mobileNumber + '\'' +
                ", dynamicAttributes=" + dynamicAttributes +
                '}';
    }
}
