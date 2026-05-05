package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AlunoAdminModel;
import com.google.cloud.firestore.DocumentSnapshot;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AdminAlunoService {
    private final FirestoreService firestoreService;

    public AdminAlunoService(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
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
        String uid = UUID.randomUUID().toString();
        firestoreService.salvarUsuario(uid, payloadAluno(uid, nome, email, matricula, curso, null));
        return buscarPorId(uid).orElseThrow();
    }

    public Optional<AlunoAdminModel> atualizar(String id, String nome, String email, String matricula, String curso) {
        validarDados(nome, email, matricula, curso);
        Optional<DocumentSnapshot> alunoExistente = firestoreService.buscarUsuarioPorId(id);
        if (alunoExistente.isEmpty() || !"ALUNO".equals(alunoExistente.get().getString("role"))) {
            return Optional.empty();
        }
        firestoreService.salvarUsuario(id, payloadAluno(id, nome, email, matricula, curso, alunoExistente.get()));
        return buscarPorId(id);
    }

    public boolean remover(String id) {
        if (buscarPorId(id).isEmpty()) {
            return false;
        }
        firestoreService.removerUsuario(id);
        return true;
    }

    private void validarDados(String nome, String email, String matricula, String curso) {
        if (isBlank(nome) || isBlank(email) || isBlank(matricula) || isBlank(curso)) {
            throw new IllegalArgumentException("Todos os campos sao obrigatorios.");
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

        List<Map<String, Object>> vinculos = (List<Map<String, Object>>) doc.get("vinculos");
        if (vinculos != null && !vinculos.isEmpty()) {
            Map<String, Object> v = vinculos.get(0);
            aluno.setMatricula(texto(v.get("matricula")));
            aluno.setCurso(texto(v.get("id_curso")));
            aluno.setTurma(texto(v.get("id_turma")));
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

        List<Map<String, Object>> vinculosAtuais = atual == null ? null : (List<Map<String, Object>>) atual.get("vinculos");
        Map<String, Object> vinculo = new HashMap<>();
        vinculo.put("id_curso", curso.trim());
        vinculo.put("id_turma", vinculosAtuais != null && !vinculosAtuais.isEmpty() ? vinculosAtuais.get(0).get("id_turma") : "");
        vinculo.put("matricula", matricula.trim());
        vinculo.put("ch_total_exigida", 200);
        vinculo.put("status_no_curso", "Ativo");

        Map<String, Object> saldos = new HashMap<>();
        saldos.put("ensino", 0);
        saldos.put("pesquisa", 0);
        saldos.put("extensao", 0);
        vinculo.put("saldos", saldos);

        payload.put("vinculos", List.of(vinculo));
        return payload;
    }

    private String texto(Object value) {
        return value == null ? "" : value.toString();
    }
}
