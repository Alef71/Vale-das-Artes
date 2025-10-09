package br.com.valedasartes.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Captura erros de validação (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpStatus.BAD_REQUEST.value());
        
        // Pega a primeira mensagem de erro de validação para ser mais direto
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .findFirst()
            .orElse("Erro de validação");
            
        body.put("mensagem", errorMessage);
        
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Captura exceções genéricas que lançamos nos nossos serviços (ex: "Artista não encontrado!")
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleGenericRuntimeException(RuntimeException ex) {
        Map<String, Object> body = new HashMap<>();
        
        // Por padrão, retorna um erro 404 para entidades não encontradas.
        // Isso pode ser melhorado com exceções customizadas no futuro.
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("mensagem", ex.getMessage());

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }
}