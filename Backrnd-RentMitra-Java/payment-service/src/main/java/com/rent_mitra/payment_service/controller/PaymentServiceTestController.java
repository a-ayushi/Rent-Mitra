package com.rent_mitra.payment_service.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/pay")
public class PaymentServiceTestController {

    @GetMapping("/get")
    public String testPaymentService(){
        return "This is payment service test controller and your name is harsh ";
    }

    @GetMapping("/got")
    public String testPaymentService2(){
        return "This is payment service test controller and your name is rahul ";
    }

    @GetMapping("/hello")
    public Map<String, String> sayHello(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        return Map.of(
                "message", "Hello from the downstream service!",
                "username", jwt.getClaim("email"),  // Example of accessing claims
                "token", jwt.getTokenValue()
        );
    }
}
