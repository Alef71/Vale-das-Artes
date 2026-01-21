package br.com.valedasartes.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Importante para o requestMatchers
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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter; 

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // 1. Desabilita CSRF
            .csrf(csrf -> csrf.disable())

            // 2. ✅ HABILITA O CORS (Usa sua configuração abaixo)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Define como Stateless
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 4. Autorizações
            .authorizeHttpRequests(auth -> auth
                // Libera OPTIONS (Pre-flight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // --- ADICIONADO: ROTAS DE RECUPERAR SENHA ---
                .requestMatchers(HttpMethod.POST, "/api/auth/esqueci-senha").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/salvar-nova-senha").permitAll()
                
                // Mantendo sua configuração original que libera TUDO (Isso faz os produtos aparecerem)
                .anyRequest().permitAll() 
            )
            
            // Filtro comentado conforme seu pedido
            // .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
            
            .build();
    }

    // ============================================================
    // ✅ CONFIGURAÇÃO DE CORS (A EXATA QUE VOCÊ PEDIU)
    // ============================================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Libera qualquer origem (*)
        configuration.setAllowedOrigins(Arrays.asList("*"));
        
        // Libera todos os métodos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "TRACE", "CONNECT"));
        
        // Libera todos os headers
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