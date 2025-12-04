package com.rent_mitra.api_gateway.config;

import com.rent_mitra.api_gateway.validate.JwtFilter;
import com.rent_mitra.api_gateway.validate.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Autowired
    private JwtUtils jwtUtils;

//    @Autowired
//    private JwtFilter jwtFilter;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
                .authorizeExchange(exchanges -> exchanges.anyExchange()
                        .permitAll()
                )
//            .addFilterBefore(jwtFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .csrf(csrf -> csrf.disable());

        return http.build();
    }
}