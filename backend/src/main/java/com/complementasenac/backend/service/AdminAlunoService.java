package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AlunoAdminModel;
import com.google.cloud.firestore.DocumentSnapshot;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminAlunoService {
    private final FirestoreService firestoreService;
    private final FirebaseUserProvisioningService firebaseUserProvisioningService;

    public AdminAlunoService(
            FirestoreService firestoreService,
            FirebaseUserProvisioningService firebaseUserProvisioningService
    ) {
        this.firestoreService = firestoreService;
        this.firebaseUserProvisioningService = firebaseUserProvisioningService;
    }

    public List<AlunoAdminModel> listar() {
        return firestoreService.listarUsuariosPorRole("ALUNO").stream()
                .map(this::paraAlunoAdmin)
                .toList();
    }

    public Optional<AlunoAdminModel> buscarPorId(String id) {
        return firestoreService.buscarUsuarioPorId(id).map(this::paraAlunoAdmin);
    }

    public AlunoAdminModel criar(String nome, String email, String matricula, String curso) {
        validarDados(nome, email, matricula, curso);
        String uid = firebaseUserProvisioningService.upsertUser(
                null,
                email,
                nome,
                matricula
        );
        firestoreService.salvarUsuario(uid, payloadAluno(uid, nome, email, matricula, curso, null));
        return buscarPorId(uid).orElseThrow();
    }

    public Optional<AlunoAdminModel> atualizar(String id, String nome, String email, String matricula, String curso) {
        validarDados(nome, email, matricula, curso);
        Optional<DocumentSnapshot> alunoExistente = firestoreService.buscarUsuarioPorId(id);
        if (alunoExistente.isEmpty() || !"ALUNO".equalsIgnoreCase(roleDoUsuario(alunoExistente.get()))) {
            return Optional.empty();
        }
        firebaseUserProvisioningService.upsertUser(
                id,
                email,
                nome,
                matricula
        );
        firestoreService.salvarUsuario(id, payloadAluno(id, nome, email, matricula, curso, alunoExistente.get()));
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

    private void validarDados(String nome, String email, String matricula, String curso) {
        if (isBlank(nome) || isBlank(email) || isBlank(matricula) || isBlank(curso)) {
            throw new IllegalArgumentException("Todos os campos sao obrigatorios.");
        }
        if (matricula.trim().length() < 6) {
            throw new IllegalArgumentException("A matricula precisa ter ao menos 6 caracteres.");
        }
    }

    private boolean isBlank(String valor) {
        return valor == null || valor.isBlank();
    }

    @SuppressWarnings("unchecked")
    private AlunoAdminModel paraAlunoAdmin(DocumentSnapshot doc) {
        AlunoAdminModel aluno = new AlunoAdminModel();
        aluno.setId(doc.getId());
        aluno.setNome(doc.getString("nome"));
        aluno.setEmail(doc.getString("email"));

        Map<String, Object> vinculo = mapVinculo(doc.get("vinculo"));
        if (vinculo != null) {
            aluno.setMatricula(texto(vinculo.get("matricula")));
            aluno.setCurso(texto(vinculo.get("id_curso")));
            aluno.setTurma(texto(vinculo.get("id_turma")));
        } else {
            aluno.setMatricula(doc.getString("matricula"));
            aluno.setCurso(textoOuPadrao(doc.getString("id_curso"), doc.getString("curso")));
            aluno.setTurma(textoOuPadrao(doc.getString("id_turma"), doc.getString("turma")));
        }
        return aluno;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> payloadAluno(String uid, String nome, String email, String matricula, String curso, DocumentSnapshot atual) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("uid", uid);
        payload.put("nome", nome.trim());
        payload.put("email", email.trim().toLowerCase());
        payload.put("role", "ALUNO");

        Map<String, Object> vinculoAtual = atual == null ? null : mapVinculo(atual.get("vinculo"));
        Map<String, Object> vinculo = new HashMap<>();
        vinculo.put("id_curso", curso.trim());
        vinculo.put("id_turma", vinculoAtual != null ? texto(vinculoAtual.get("id_turma")) : "");
        vinculo.put("matricula", matricula.trim());
        vinculo.put("ch_total_exigida", 200);
        vinculo.put("status_no_curso", "Ativo");

        Map<String, Object> saldos = new HashMap<>();
        saldos.put("ensino", 0);
        saldos.put("pesquisa", 0);
        saldos.put("extensao", 0);
        vinculo.put("saldos", saldos);

        payload.put("vinculo", vinculo);
        return payload;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapVinculo(Object rawVinculo) {
        if (rawVinculo instanceof Map<?, ?> rawMap) {
            Map<String, Object> vinculo = new HashMap<>();
            rawMap.forEach((k, value) -> vinculo.put(String.valueOf(k), value));
            return vinculo;
        }
        if (rawVinculo instanceof List<?> lista
                && !lista.isEmpty()
                && lista.get(0) instanceof Map<?, ?> rawMap) {
            Map<String, Object> vinculo = new HashMap<>();
            rawMap.forEach((k, value) -> vinculo.put(String.valueOf(k), value));
            return vinculo;
        }
        return null;
    }

    private String texto(Object value) {
        return value == null ? "" : value.toString();
    }

    private String textoOuPadrao(String value, String fallback) {
        return value == null || value.isBlank() ? texto(fallback) : value;
    }

    private String roleDoUsuario(DocumentSnapshot doc) {
        String role = doc.getString("role");
        if (role != null && !role.isBlank()) return role;
        role = doc.getString("perfil");
        if (role != null && !role.isBlank()) return role;
        return doc.getString("tipo");
    }
}
