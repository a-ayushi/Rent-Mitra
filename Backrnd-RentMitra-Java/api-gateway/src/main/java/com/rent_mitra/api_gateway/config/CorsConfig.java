package com.rent_mitra.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class CorsConfig {
//    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173")  // The frontend origin
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // Allow OPTIONS in addition to others
                        .allowedHeaders("*")  // Allow any headers, or specify if necessary
                        .allowCredentials(true)  // If cookies are involved, enable credentials
                        .maxAge(3600);  // Cache preflight response for 1 hour
            }
        };
    }
}
