package com.complementasenac.backend.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<FirebaseAuthFilter> firebaseFilter() {
        FilterRegistrationBean<FirebaseAuthFilter> registration = new FilterRegistrationBean<>();

        registration.setFilter(new FirebaseAuthFilter());
        registration.addUrlPatterns("/api/*"); // 🔥 protege todas rotas da API
        
        return registration;
    }
}