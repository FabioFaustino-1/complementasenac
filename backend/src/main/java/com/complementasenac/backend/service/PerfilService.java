package com.complementasenac.backend.service;

import org.springframework.stereotype.Service;

@Service
public class PerfilService {
    private final FirestoreService firestoreService;

    public PerfilService(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    public String resolverPerfil(String uid, String email) {
        return firestoreService.buscarUsuarioPorUid(uid)
                .or(() -> firestoreService.buscarUsuarioPorEmail(email))
                .map(doc -> normalizarRole(doc.getString("role")))
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado no banco de dados."));
    }

    private String normalizarRole(String role) {
        if (role == null || role.isBlank()) {
            throw new IllegalArgumentException("Usuario sem role configurada no banco.");
        }
        String normalizado = role.trim().toLowerCase();
        if ("superadmin".equals(normalizado)) {
            return "admin";
        }
        if ("coordenador".equals(normalizado) || "aluno".equals(normalizado) || "admin".equals(normalizado)) {
            return normalizado;
        }
        throw new IllegalArgumentException("Role invalida no banco: " + role);
    }
}
