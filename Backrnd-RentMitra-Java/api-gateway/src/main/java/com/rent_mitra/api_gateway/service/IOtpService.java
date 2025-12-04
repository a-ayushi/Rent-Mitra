package com.rent_mitra.api_gateway.service;

import com.rent_mitra.api_gateway.models.OtpResponse;

public interface IOtpService {
    public String sendOtp(String phoneNumber);
    public OtpResponse validateOtp(String phonenumber
    );

}
