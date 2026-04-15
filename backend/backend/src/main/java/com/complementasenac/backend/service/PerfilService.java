package com.complementasenac.backend.service;

import org.springframework.stereotype.Service;

@Service
public class PerfilService {

    public String resolverPerfil(String email) {
        if (email == null || email.isBlank()) {
            return "aluno";
        }

        String normalized = email.toLowerCase();
        if (normalized.contains("admin")) {
            return "admin";
        }
        if (normalized.contains("coord") || normalized.contains("coordenador")) {
            return "coordenador";
        }
        return "aluno";
    }
}
