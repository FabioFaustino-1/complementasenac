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

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<StandardError> handleIllegalArgumentException(IllegalArgumentException e, HttpServletRequest request) {
        StandardError err = new StandardError(
                System.currentTimeMillis(),
                HttpStatus.BAD_REQUEST.value(),
                "Dados invalidos",
                e.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    // 2. Captura erros de lógica de negócio (Erro 404)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<StandardError> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        StandardError err = new StandardError(
                System.currentTimeMillis(),
                HttpStatus.NOT_FOUND.value(),
                "Recurso nao encontrado",
                e.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }
}