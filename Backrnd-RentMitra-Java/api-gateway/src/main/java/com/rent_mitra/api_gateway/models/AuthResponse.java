package com.rent_mitra.api_gateway.models;

import java.util.Collection;

public class AuthResponse {
    private String userEmail;
    private String accessToken;
    private String refreshToken;

    private long expireAt;

    private Collection<String> authorities;

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public long getExpireAt() {
        return expireAt;
    }

    public void setExpireAt(long expireAt) {
        this.expireAt = expireAt;
    }

    public Collection<String> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(Collection<String> authorities) {
        this.authorities = authorities;
    }

    public AuthResponse(Collection<String> authorities, long expireAt, String refreshToken, String accessToken, String userEmail) {
        this.authorities = authorities;
        this.expireAt = expireAt;
        this.refreshToken = refreshToken;
        this.accessToken = accessToken;
        this.userEmail = userEmail;
    }

    @Override
    public String toString() {
        return "AuthResponse{" +
                "userEmail='" + userEmail + '\'' +
                ", accessToken='" + accessToken + '\'' +
                ", refreshToken='" + refreshToken + '\'' +
                ", expireAt=" + expireAt +
                ", authorities=" + authorities +
                '}';
    }

    public AuthResponse() {
    }
}
