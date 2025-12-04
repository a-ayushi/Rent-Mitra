package com.rent_mitra.notification_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/notify")
public class NotificationTestController {

    @GetMapping("/test")
    public String testPaymentService() {
        return "This is notification service test controller";
    }
}