package com.userservice.jwt;

import com.userservice.repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public boolean validateToken(String token) {
        String phoneNumber = jwtUtil.extractPhoneNumber(token);
        String newphone = phoneNumber.substring(3);
        System.out.println(newphone+" "+userRepository.existsByMobilenumber(phoneNumber)+" "+userRepository.existsByMobilenumber(newphone));
        return userRepository.existsByMobilenumber(newphone);
    }
}
