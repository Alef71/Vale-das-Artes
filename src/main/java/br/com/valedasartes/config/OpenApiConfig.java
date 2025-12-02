package br.com.valedasartes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Vale das Artes")
                        .version("v1")
                        .description("API para o e-commerce social Vale das Artes, focado na valorização e comercialização do artesanato do Vale do Jequitinhonha.")
                        .contact(new Contact()
                                .name("Alef")
                                .email("afra@aluno.ifnmg.edu.br")) 
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://springdoc.org")));
    }
}