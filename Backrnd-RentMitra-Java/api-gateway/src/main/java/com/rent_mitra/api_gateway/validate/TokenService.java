package com.rent_mitra.api_gateway.validate;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TokenService {


    @Autowired
    private JwtUtils jwtUtil;

    public boolean validateToken(String token) {
        String phoneNumber = jwtUtil.extractPhoneNumber(token);
        String newphone = phoneNumber.substring(3);
        return true;
    }
}

