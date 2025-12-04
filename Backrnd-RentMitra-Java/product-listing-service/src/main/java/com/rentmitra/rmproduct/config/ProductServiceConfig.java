package com.rentmitra.rmproduct.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.rentmitra.rmproduct.jwt.JwtFilter;
import com.rentmitra.rmproduct.jwt.JwtUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.security.PublicKey;
import java.security.interfaces.RSAPublicKey;

@Configuration
@EnableWebSecurity
public class ProductServiceConfig {

    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .authorizeHttpRequests((request) -> request
                        .anyRequest().permitAll())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
//                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .csrf(csrf->csrf.disable());
        return httpSecurity.build();
    }

    @Bean
    public JwtDecoder customjwtDecoder()  {
        System.out.println("jwt decoder");
        RSAPublicKey rsaPublicKey = null;
        try{
            PublicKey publicKey = jwtUtils.getPublicKeyFromPem();  // Get public key from your JwtUtil
            rsaPublicKey = (RSAPublicKey) publicKey;
        }catch (Exception esx){
//            logger.error("error in custom decoder:{}",esx.getMessage());
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

    @Bean
    public ModelMapper modelMapper(){
        return new ModelMapper();
    }

}
