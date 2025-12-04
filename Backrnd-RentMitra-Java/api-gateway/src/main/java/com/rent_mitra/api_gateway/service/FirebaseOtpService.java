package com.rent_mitra.api_gateway.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class FirebaseOtpService {

    @Value("${firebase.api.key}")
    private String firebaseApiKey;


    public void sendOtp(String phoneNumber) {

        RestTemplate restTemplate = new RestTemplate();

        String FIREBASE_AUTH_URL =
                "https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=" + firebaseApiKey;

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("phoneNumber", phoneNumber);
        requestBody.put("recaptchaToken", "YOUR_RECAPTCHA_TOKEN"); // In production, you'll need a reCAPTCHA token

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(FIREBASE_AUTH_URL,
                HttpMethod.POST, entity, String.class);
        System.out.println("Response: " + response.getBody());
    }
}
