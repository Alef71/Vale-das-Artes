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
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // Não precisamos mais

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Mantemos o filtro aqui para quando formos reativar
    @Autowired
    private SecurityFilter securityFilter; 

    // Não precisamos mais do SWAGGER_WHITELIST para esta versão
    // private static final String[] SWAGGER_WHITELIST = {
    //     "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**"
    // };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) 
            
            // ================== MUDANÇA PRINCIPAL AQUI ==================
            .authorizeHttpRequests(auth -> auth
                // Permite TODAS as requisições (GET, POST, PUT, etc.)
                // em QUALQUER URL.
                .anyRequest().permitAll() 
            )
            // ============================================================
            
            // Filtro JWT desativado por enquanto (comentado)
            // .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
            
            .build();
    }
    
    // Mantemos estes Beans intactos, pois eles são parte da 
    // configuração geral do Spring e serão necessários depois.
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}