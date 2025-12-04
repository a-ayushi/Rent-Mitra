package com.userservice.kafka.consumer;

import com.userservice.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import com.userservice.request.UserRequest;

@Component
public class UserServiceKafkaConsumer {
    @Autowired
    private IUserService userService;

    @KafkaListener(topics = "user-topic", groupId = "user-group", containerFactory = "kafkaListenerContainerFactory")
    public void consume(UserRequest userRequest) {
        try {
            // Create or update the user
            userService.createOrUpdateUser(userRequest, null); // No image in Kafka message
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error while consuming Kafka message", e);
        }
    }
}
