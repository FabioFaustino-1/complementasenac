package com.complementasenac.backend.service;

import com.google.cloud.firestore.DocumentSnapshot;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PerfilService {
    private final FirestoreService firestoreService;

    public PerfilService(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    public String resolverPerfil(String uid, String email) {
        return buscarUsuario(uid, email)
                .map(doc -> normalizarRole(valorPerfil(doc.getString("role"), doc.getString("perfil"), doc.getString("tipo"))))
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado no banco de dados."));
    }

    private Optional<DocumentSnapshot> buscarUsuario(String uid, String email) {
        try {
            Optional<DocumentSnapshot> porUid = firestoreService.buscarUsuarioPorUid(uid);
            if (porUid.isPresent()) {
                return porUid;
            }
        } catch (RuntimeException ignored) {
            // Mantem o login resiliente quando o banco antigo nao permite lookup por UID.
        }
        return firestoreService.buscarUsuarioPorEmail(email);
    }

    private String valorPerfil(String role, String perfil, String tipo) {
        if (role != null && !role.isBlank()) {
            return role;
        }
        if (perfil != null && !perfil.isBlank()) {
            return perfil;
        }
        return tipo;
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
