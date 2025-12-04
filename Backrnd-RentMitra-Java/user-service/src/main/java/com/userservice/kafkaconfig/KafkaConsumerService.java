package com.userservice.kafkaconfig;

import com.userservice.repository.IUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);

    @Autowired
    private KafkaTemplate<String,Boolean> kafkaTemplate;

    @Autowired
    private IUserRepository userRepository;

    @KafkaListener(topics = "validate-user-request",groupId = "user-service-group",containerFactory = "stringKafkaListenerFactory")
    public void processvalidaterequest(String mobileNumber){
        logger.info("Received validation request for mobile number:{}",mobileNumber);
        try {
            boolean isValid = userRepository.existsByMobilenumber(mobileNumber);
            logger.info("sending response to kafka topic:{}",isValid);
            kafkaTemplate.send("validate-user-response", isValid);
        } catch (Exception e) {
            logger.error("Error processing validation request for mobile number {}: {}", mobileNumber, e.getMessage());
        }
    }
}
