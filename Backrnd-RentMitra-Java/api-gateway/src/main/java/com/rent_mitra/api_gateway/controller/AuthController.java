package com.rent_mitra.api_gateway.controller;

import com.rent_mitra.api_gateway.models.AuthResponse;
import com.rent_mitra.api_gateway.models.OtpResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/auth")
public class AuthController {

    private Logger logger = LoggerFactory.getLogger(AuthController.class);

    @GetMapping("/login")
    public ResponseEntity<AuthResponse> login(

            @RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient client,
            @AuthenticationPrincipal OidcUser  user,
            Model model
    ) {

        AuthResponse authResponse = new AuthResponse();
           logger.info("loaded authcontroller : {}",AuthController.class);
        authResponse.setUserEmail(user.getEmail());
        authResponse.setAccessToken(user.getIdToken().getTokenValue());
        authResponse.setExpireAt(user.getIdToken().getExpiresAt().getEpochSecond());
        List<String> authorities = user.getAuthorities().stream().map(grantedAuthority -> {
            return grantedAuthority.getAuthority();
        }).collect(Collectors.toList());
        authResponse.setAuthorities(authorities);
        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    @GetMapping("/test")
    public String authtest(){
        return "Test-Success";
    }


}

