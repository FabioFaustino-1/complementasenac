package com.complementasenac.backend.service;

import com.complementasenac.backend.model.CoordenadorAdminModel;
import com.google.cloud.firestore.DocumentSnapshot;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminCoordenadorService {
    private final FirestoreService firestoreService;
    private final FirebaseUserProvisioningService firebaseUserProvisioningService;

    public AdminCoordenadorService(
            FirestoreService firestoreService,
            FirebaseUserProvisioningService firebaseUserProvisioningService
    ) {
        this.firestoreService = firestoreService;
        this.firebaseUserProvisioningService = firebaseUserProvisioningService;
    }

    public List<CoordenadorAdminModel> listar() {
        return firestoreService.listarUsuariosPorRole("COORDENADOR").stream()
                .map(this::paraModel)
                .toList();
    }

    public Optional<CoordenadorAdminModel> buscarPorId(String id) {
        return firestoreService.buscarUsuarioPorId(id)
                .filter(doc -> "COORDENADOR".equalsIgnoreCase(roleDoUsuario(doc)))
                .map(this::paraModel);
    }

    public CoordenadorAdminModel criar(CoordenadorAdminModel coordenador) {
        validar(coordenador);
        String uid = firebaseUserProvisioningService.upsertUser(
                null,
                coordenador.getEmail(),
                coordenador.getNome(),
                senhaPadraoCoordenador(coordenador.getEmail())
        );
        firestoreService.salvarUsuario(uid, payload(uid, coordenador));
        return buscarPorId(uid).orElseThrow();
    }

    public Optional<CoordenadorAdminModel> atualizar(String id, CoordenadorAdminModel coordenador) {
        validar(coordenador);
        if (buscarPorId(id).isEmpty()) {
            return Optional.empty();
        }
        firebaseUserProvisioningService.upsertUser(
                id,
                coordenador.getEmail(),
                coordenador.getNome(),
                senhaPadraoCoordenador(coordenador.getEmail())
        );
        firestoreService.salvarUsuario(id, payload(id, coordenador));
        return buscarPorId(id);
    }

    public boolean remover(String id) {
        if (buscarPorId(id).isEmpty()) {
            return false;
        }
        firebaseUserProvisioningService.deleteByUid(id);
        firestoreService.removerUsuario(id);
        return true;
    }

    private void validar(CoordenadorAdminModel coordenador) {
        if (coordenador == null || isBlank(coordenador.getNome()) || isBlank(coordenador.getEmail())) {
            throw new IllegalArgumentException("Nome e e-mail do coordenador sao obrigatorios.");
        }
    }

    private Map<String, Object> payload(String uid, CoordenadorAdminModel c) {
        Map<String, Object> data = new HashMap<>();
        data.put("uid", uid);
        data.put("nome", c.getNome().trim());
        data.put("email", c.getEmail().trim().toLowerCase());
        data.put("role", "COORDENADOR");
        data.put("departamento", c.getDepartamento() == null ? "" : c.getDepartamento().trim());
        data.put("status", c.getStatus() == null ? "Ativo" : c.getStatus().trim());
        data.put("cursos", c.getCursos() == null ? List.of() : c.getCursos());
        data.put("vinculo", new HashMap<>());
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

    private String senhaPadraoCoordenador(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase();
        int atIndex = normalized.indexOf('@');
        String base = atIndex > 0 ? normalized.substring(0, atIndex) : normalized;
        if (base.isBlank()) {
            throw new IllegalArgumentException("E-mail invalido para gerar senha padrao do coordenador.");
        }
        return base + "2026";
    }

    private String roleDoUsuario(DocumentSnapshot doc) {
        String role = doc.getString("role");
        if (role != null && !role.isBlank()) return role;
        role = doc.getString("perfil");
        if (role != null && !role.isBlank()) return role;
        return doc.getString("tipo");
    }
}
