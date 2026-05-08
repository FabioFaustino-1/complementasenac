package com.complementasenac.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI complementaApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Complementa+ API")
                        .description("API para gerenciamento de usuarios, cursos e solicitacoes de horas complementares.")
                        .version("v1")
                        .contact(new Contact().name("Equipe Complementa+"))
                        .license(new License().name("Academic Use")));
    }
}
