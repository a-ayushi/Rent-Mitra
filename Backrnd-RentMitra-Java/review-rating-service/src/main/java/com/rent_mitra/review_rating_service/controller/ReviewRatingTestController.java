package com.rent_mitra.review_rating_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/review-rating")
public class ReviewRatingTestController {

    @GetMapping("/test")
    public String testReviewRatingController(){
        return "This is Review Rating Test Controller";
    }
}
