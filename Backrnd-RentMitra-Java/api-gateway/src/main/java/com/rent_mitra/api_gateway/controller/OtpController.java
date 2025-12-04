package com.rent_mitra.api_gateway.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.rent_mitra.api_gateway.models.OtpResponse;
import com.rent_mitra.api_gateway.service.IOtpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/otp")
public class OtpController {

    Logger logger = LoggerFactory.getLogger(OtpController.class);

    @Autowired
    private IOtpService iOtpService;


    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/send")
    public ResponseEntity<String> sendOtoApi(@RequestParam String phonenumber){
        logger.info("post send opt to phone:{}",phonenumber);
      String msg =   iOtpService.sendOtp(
                phonenumber
        );

        return  new ResponseEntity<String>(msg, HttpStatus.OK);
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/verifyotp")
    public ResponseEntity<OtpResponse> verifyotpApi(
                                                    @RequestParam String otp){
        logger.info("verify the otp :{}",otp);
        OtpResponse otpResponse =  iOtpService.validateOtp(otp);
        return  new ResponseEntity<OtpResponse>(otpResponse,HttpStatus.OK);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestBody TokenRequest tokenRequest) {
        try {
            // Verify the token
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(tokenRequest.getToken());
            String uid = decodedToken.getUid();
            return ResponseEntity.ok("User authenticated with UID: " + uid);
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    // DTO class for the request
    public static class TokenRequest {
        private String token;

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }
    }
}
