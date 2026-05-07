package com.complementasenac.backend.service;

import com.complementasenac.backend.model.CoordenadorAdminModel;
import com.google.cloud.firestore.DocumentSnapshot;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AdminCoordenadorService {
    private final FirestoreService firestoreService;

    public AdminCoordenadorService(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    public List<CoordenadorAdminModel> listar() {
        return firestoreService.listarUsuariosPorRole("COORDENADOR").stream()
                .map(this::paraModel)
                .toList();
    }

    public Optional<CoordenadorAdminModel> buscarPorId(String id) {
        return firestoreService.buscarUsuarioPorId(id)
                .filter(doc -> "COORDENADOR".equals(doc.getString("role")))
                .map(this::paraModel);
    }

    public CoordenadorAdminModel criar(CoordenadorAdminModel coordenador) {
        validar(coordenador);
        String uid = UUID.randomUUID().toString();
        firestoreService.salvarUsuario(uid, payload(coordenador));
        return buscarPorId(uid).orElseThrow();
    }

    public Optional<CoordenadorAdminModel> atualizar(String id, CoordenadorAdminModel coordenador) {
        validar(coordenador);
        if (buscarPorId(id).isEmpty()) {
            return Optional.empty();
        }
        firestoreService.salvarUsuario(id, payload(coordenador));
        return buscarPorId(id);
    }

    public boolean remover(String id) {
        if (buscarPorId(id).isEmpty()) {
            return false;
        }
        firestoreService.removerUsuario(id);
        return true;
    }

    private void validar(CoordenadorAdminModel coordenador) {
        if (coordenador == null || isBlank(coordenador.getNome()) || isBlank(coordenador.getEmail())) {
            throw new IllegalArgumentException("Nome e e-mail do coordenador sao obrigatorios.");
        }
    }

    private Map<String, Object> payload(CoordenadorAdminModel c) {
        Map<String, Object> data = new HashMap<>();
        data.put("nome", c.getNome().trim());
        data.put("email", c.getEmail().trim().toLowerCase());
        data.put("role", "COORDENADOR");
        data.put("departamento", c.getDepartamento() == null ? "" : c.getDepartamento().trim());
        data.put("status", c.getStatus() == null ? "Ativo" : c.getStatus().trim());
        data.put("cursos", c.getCursos() == null ? List.of() : c.getCursos());
        data.put("vinculo", List.of());
        return data;
    }

    private CoordenadorAdminModel paraModel(DocumentSnapshot doc) {
        CoordenadorAdminModel model = new CoordenadorAdminModel();
        model.setId(doc.getId());
        model.setNome(doc.getString("nome"));
        model.setEmail(doc.getString("email"));
        model.setDepartamento(doc.getString("departamento"));
        model.setStatus(doc.getString("status"));
        @SuppressWarnings("unchecked")
        List<String> cursos = (List<String>) doc.get("cursos");
        model.setCursos(cursos == null ? List.of() : cursos);
        return model;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
