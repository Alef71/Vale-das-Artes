package br.com.valedasartes.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter; 

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // 1. Desabilita CSRF (Padrão para APIs)
            .csrf(csrf -> csrf.disable())

            // 2. ✅ HABILITA O CORS (ISSO RESOLVE O ERRO NO NAVEGADOR)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Define como Stateless
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 4. Autorizações
            .authorizeHttpRequests(auth -> auth
                // Dica: É bom liberar o OPTIONS explicitamente para evitar 403 no preflight
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                
                // Mantendo sua configuração de liberar tudo para teste
                .anyRequest().permitAll() 
            )
            
            // Filtro JWT comentado como você pediu
            // .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
            
            .build();
    }

    // ============================================================
    // ✅ CONFIGURAÇÃO DE CORS (ESSENCIAL PARA O FRONTEND)
    // ============================================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Libera qualquer origem (seu front em 127.0.0.1 ou localhost)
        configuration.setAllowedOrigins(Arrays.asList("*"));
        
        // Libera todos os métodos (GET, POST, PUT, DELETE, OPTIONS)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "TRACE", "CONNECT"));
        
        // Libera todos os headers (Authorization, Content-Type, etc)
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}