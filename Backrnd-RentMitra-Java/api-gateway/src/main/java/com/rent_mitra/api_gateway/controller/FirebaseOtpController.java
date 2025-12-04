package com.rent_mitra.api_gateway.controller;

import com.rent_mitra.api_gateway.service.FirebaseOtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/firebase/otp")
public class FirebaseOtpController {

    @Autowired
    private FirebaseOtpService firebaseOtpService;

    @Value("${firebase.api.key}")
    private String firebaseApiKey;

    @PostMapping("/send")
        public ResponseEntity<String> sendOtp(@RequestParam String phoneNumber) {
//        String newphonenumber = phoneNumber.concat("+");
          phoneNumber = formatPhoneNumber(phoneNumber);
        System.out.println(phoneNumber);
            try {
                firebaseOtpService.sendOtp(phoneNumber);
                return ResponseEntity.ok("OTP sent successfully");
            } catch (Exception e) {
                System.out.println(e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error sending OTP: " + e.getMessage());
            }
        }


    @PostMapping("/verify")
    public String verifyOTP(@RequestParam String sessionInfo, @RequestParam String code) {
        String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=" + firebaseApiKey;

        // Request payload
        Map<String, String> payload = new HashMap<>();
        payload.put("sessionInfo", sessionInfo);
        payload.put("code", code);
        System.out.println(code);

        // Verify OTP using RestTemplate
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.postForEntity(url, payload, Map.class);

        return response.getStatusCode().is2xxSuccessful() ? "OTP verified successfully" : "Failed to verify OTP";
    }

    public String formatPhoneNumber(String phoneNumber) {
        if (!phoneNumber.startsWith("+")) {
            // Assuming default country code for India (+91)
            return "+91" + phoneNumber;
        }
        return phoneNumber;
    }
}
