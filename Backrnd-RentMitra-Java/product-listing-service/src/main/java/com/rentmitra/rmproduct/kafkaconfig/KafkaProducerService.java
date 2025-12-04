package com.rentmitra.rmproduct.kafkaconfig;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    Logger logger = LoggerFactory.getLogger(KafkaProducerService.class);

    @Autowired
    KafkaTemplate<String,String> kafkaTemplate;

    private Boolean validationresult;

    public Boolean sendvalidaterequest(String mobileNumber){
        try{
            logger.info("kafka producer sending validation request:{}",mobileNumber);
            kafkaTemplate.send("validate-user-request",mobileNumber);
            waitforresponse();
            return validationresult;
        } catch (Exception e) {
            logger.info("error in sending the request:{}",e.getMessage());
            return false;
        }
    }

    @KafkaListener(topics = "validate-user-response",groupId = "user-service-group")
    public void listentorespose(Boolean isValid){
        try{
            this.validationresult= isValid;
            logger.info("kafka listener successfully listened to topic:{}",isValid);
        } catch (Exception e) {
            logger.error("error in listening to topic:{}",e.getMessage());
        }
    }

    private void waitforresponse(){
        try{
            Thread.sleep(2000);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }




}
