package com.rentmitra.rmproduct.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class SubcategoryDTO {

    private Integer subcategoryId;
    private String name;
    @JsonIgnore
    private String imageUrl;

    public SubcategoryDTO(){}
    public SubcategoryDTO(String name,String imageUrl){
        this.name = name;
        this.imageUrl =imageUrl;
    }
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getSubcategoryId() {
        return subcategoryId;
    }

    public void setSubcategoryId(Integer subcategoryId) {
        this.subcategoryId = subcategoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
