package br.com.valedasartes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Lista de caminhos que o Swagger utiliza e que devem ser públicos
    private static final String[] SWAGGER_WHITELIST = {
        "/v3/api-docs/**",
        "/swagger-ui.html",
        "/swagger-ui/**",
        "/swagger-resources/**",
        "/webjars/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desabilita proteção CSRF, comum em APIs REST
            .authorizeHttpRequests(auth -> auth
                // 1. Libera explicitamente os caminhos do Swagger
                .requestMatchers(SWAGGER_WHITELIST).permitAll()
                
                // 2. Mantém a regra de permitir todos os outros endpoints por agora
                .requestMatchers("/**").permitAll() 
                
                // No futuro, quando formos implementar o login, trocaremos a linha acima por:
                // .anyRequest().authenticated()
            );
        return http.build();
    }
}