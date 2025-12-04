package com.userservice.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.userservice.jwt.JwtFilter;
import com.userservice.jwt.JwtUtil;
import jakarta.annotation.PostConstruct;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.security.PublicKey;
import java.security.interfaces.RSAPublicKey;

@Configuration
@EnableWebSecurity
public class UserConfig {

    Logger logger = LoggerFactory.getLogger(UserConfig.class);

    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private JwtUtil jwtUtil;

    @PostConstruct
    void check(){logger.info("loaded");}

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .authorizeHttpRequests(request -> request.anyRequest().permitAll())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(customjwtDecoder())))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .csrf(csrf -> csrf.disable());
        return httpSecurity.build();
    }
@Bean
    public ModelMapper modelMapper() {
    return new ModelMapper();
}

    @Bean
    public JwtDecoder customjwtDecoder()  {
        System.out.println("jwt decoder");
        RSAPublicKey rsaPublicKey = null;
        try{
            PublicKey publicKey = jwtUtil.getPublicKeyFromPem();  // Get public key from your JwtUtil
         rsaPublicKey = (RSAPublicKey) publicKey;
        }catch (Exception esx){
            logger.error("error in custom decoder:{}",esx.getMessage());
        }
            return NimbusJwtDecoder.withPublicKey(rsaPublicKey).build();
    }

    @Bean
    public Cloudinary cloudinary(){
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "digbfdpcw",
                "api_key", "736763259889571",
                "api_secret", "arUTflmLZT67Z8ihrBeshGihhaU"
        ));
    }

}





