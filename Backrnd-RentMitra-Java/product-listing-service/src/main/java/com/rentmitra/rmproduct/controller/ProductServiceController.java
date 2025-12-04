package com.rentmitra.rmproduct.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/prod")
public class ProductServiceController {

    @GetMapping("/test")
    public String testController(){
        return "This is Product Service Test controller";
    }
}
