package com.complementasenac.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice // Indica que esta classe trata erros globalmente
public class GlobalExceptionHandler {

    // 1. Captura erros genéricos (Erro 500)
    // Se o Java der um erro inesperado, ele cai aqui.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<StandardError> handleAnyException(Exception e, HttpServletRequest request) {
        StandardError err = new StandardError(
                System.currentTimeMillis(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Erro Interno no Servidor",
                e.getMessage(), // Pega a mensagem real do erro
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
    }

    // 2. Captura erros de lógica ou dados não encontrados (Erro 404/400)
    // Se você buscar um aluno no Firebase e ele não existir, você lança uma RuntimeException.
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<StandardError> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        StandardError err = new StandardError(
                System.currentTimeMillis(),
                HttpStatus.NOT_FOUND.value(),
                "Recurso não encontrado",
                e.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }
}