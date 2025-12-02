package br.com.valedasartes.domain.security.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import br.com.valedasartes.domain.security.Credencial;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    @Value("${api.security.token.issuer}")
    private String issuer;

    public String gerarToken(Credencial credencial) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
            Date dataExpiracao = Date.from(gerarDataDeExpiracao());

            return Jwts.builder()
                .setIssuer(issuer)
                .setSubject(credencial.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(dataExpiracao)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
        } catch (JwtException | IllegalArgumentException ex) { 
            throw new RuntimeException("Erro ao gerar token JWT", ex);
        }
    }

    public String validarToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());

            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

            if (!issuer.equals(claims.getIssuer())) {
                return "";
            }

            return claims.getSubject();
        } catch (JwtException ex) {
            return ""; 
        }
    }

    private Instant gerarDataDeExpiracao() {
        // Token expira em 2 horas
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}