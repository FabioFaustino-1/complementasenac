package com.complementasenac.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())

            // 🔥 libera tudo
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )

            // 🔥 desativa login padrão
            .formLogin(form -> form.disable())

            // 🔥 desativa login via popup (BÁSICO)
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}