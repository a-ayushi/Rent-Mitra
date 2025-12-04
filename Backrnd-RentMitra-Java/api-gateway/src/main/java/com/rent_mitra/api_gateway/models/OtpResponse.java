package com.rent_mitra.api_gateway.models;

import org.springframework.stereotype.Component;


public class OtpResponse {

     String message;
    String accessToken;

    public OtpResponse(){}

    public OtpResponse(String message,String accessToken){
        this.message=message;
        this.accessToken = accessToken;
    }
    // Getters and setters




    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }
}
