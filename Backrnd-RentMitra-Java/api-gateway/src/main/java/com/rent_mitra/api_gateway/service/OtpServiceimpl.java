package com.rent_mitra.api_gateway.service;

import com.rent_mitra.api_gateway.config.OtpConfig;
import com.rent_mitra.api_gateway.models.OtpResponse;
import com.rent_mitra.api_gateway.reuest.UserRequest;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@Service
public class OtpServiceimpl implements IOtpService {

    Logger logger = LoggerFactory.getLogger(OtpServiceimpl.class);

    @Autowired
    private  JwtService jwtService;

    @Autowired
    private     KafkaTemplate<String, UserRequest> kafkaTemplate;

    private final OtpConfig otpConfig;

    private List<String> otplist;


    private  String phonenumber;

    public OtpServiceimpl(OtpConfig otpConfig) {
        this.otpConfig = otpConfig;
        Twilio.init(otpConfig.getAccountSid(), otpConfig.getAuthToken());
    }


    @Override
    public String sendOtp(String phoneNumber) {
          logger.info("send otp to mobile :{}",phoneNumber);
        PhoneNumber to = new PhoneNumber(phoneNumber);//to
        PhoneNumber from = new PhoneNumber(otpConfig.getPhoneNumber()); // from
        String otp = generateOtp();
        otplist = new ArrayList<>();
        otplist.add(otp);
        setPhonenumber(phoneNumber);
        String otpMessage = "Dear Customer , Your OTP is  " + otp + " one time password for Rent-Mitra. Thank You.";
//        Message message = Message.creator(to,from,otpMessage).create();
        System.out.println(otp);
        return "Otp sent successfully"+otp;
    }

    @Override
    public OtpResponse validateOtp(String otp) {

        if ( otplist.get(0).equals(otp)) {
            String token = null;
            try {
                token = jwtService.generateToken(getPhonenumber());
                UserRequest userRequest = new UserRequest();
                userRequest.setMobile_number(getPhonenumber());
                kafkaTemplate.send("user-topic", userRequest);
            } catch (NoSuchAlgorithmException e) {
                logger.info("error while token generation :{}",e.getMessage());
                throw new RuntimeException(e);
            } catch (Exception e) {
                logger.info("error :{}",e.getMessage());
                throw new RuntimeException(e);
            }
            return new OtpResponse("Otp varified !", token);
        }
        else {
            logger.info("invalid otp :{}",otp);
            return new OtpResponse("Enter a valid otp", "null");
        }
    }

    public  String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // Generate a number between 100000 and 999999
        return String.valueOf(otp);
    }

    public String getPhonenumber() {
        return phonenumber;
    }

    public void setPhonenumber(String phonenumber) {
        this.phonenumber = phonenumber;
    }
}
