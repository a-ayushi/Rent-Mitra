package com.rentmitra.rmproduct.jwt;

import com.rentmitra.rmproduct.kafkaconfig.KafkaProducerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    Logger logger = LoggerFactory.getLogger(TokenService.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    public boolean validateToken(String token){
        String phoneNumber = jwtUtils.extractPhoneNumber(token);
        String extractedNumner = phoneNumber.substring(3);
        logger.info("validateToken extracted phone:{}",extractedNumner);
        return kafkaProducerService.sendvalidaterequest(extractedNumner);
    }
}
