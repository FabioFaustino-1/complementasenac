package com.complementasenac.backend.service;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
public class FirestoreService {
    private static final String COLLECTION_USUARIOS = "Usuarios";
    private static final String COLLECTION_USUARIOS_LEGACY = "usuarios";
    private static final String COLLECTION_SOLICITACOES = "Solicitacoes";
    private static final String COLLECTION_CURSOS = "Cursos";

    public Firestore db() {
        return FirestoreClient.getFirestore();
    }

    public Optional<DocumentSnapshot> buscarUsuarioPorUid(String uid) {
        if (uid == null || uid.isBlank()) {
            return Optional.empty();
        }
        try {
            DocumentSnapshot docPrincipal = db().collection(COLLECTION_USUARIOS).document(uid).get().get();
            if (docPrincipal.exists()) {
                return Optional.of(docPrincipal);
            }
            DocumentSnapshot docLegacy = db().collection(COLLECTION_USUARIOS_LEGACY).document(uid).get().get();
            if (docLegacy.exists()) {
                return Optional.of(docLegacy);
            }

            // Fallback para bases antigas: uid armazenado como campo do documento.
            Optional<DocumentSnapshot> porCampoPrincipal = buscarUsuarioPorCampoUid(COLLECTION_USUARIOS, uid);
            if (porCampoPrincipal.isPresent()) {
                return porCampoPrincipal;
            }
            return buscarUsuarioPorCampoUid(COLLECTION_USUARIOS_LEGACY, uid);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao buscar usuario por UID.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao buscar usuario por UID.", e);
        }
    }

    private Optional<DocumentSnapshot> buscarUsuarioPorCampoUid(String collection, String uid) throws ExecutionException, InterruptedException {
        var query = db().collection(collection)
                .whereEqualTo("uid", uid)
                .limit(1)
                .get()
                .get();
        if (!query.isEmpty()) {
            return Optional.of(query.getDocuments().get(0));
        }
        return Optional.empty();
    }

    public Optional<DocumentSnapshot> buscarUsuarioPorEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        try {
            String alvo = email.trim().toLowerCase();
            List<String> colecoes = List.of(COLLECTION_USUARIOS, COLLECTION_USUARIOS_LEGACY);
            for (String colecao : colecoes) {
                var query = db().collection(colecao).limit(200).get().get();
                for (DocumentSnapshot doc : query.getDocuments()) {
                    String emailDoc = doc.getString("email");
                    if (emailDoc != null && alvo.equals(emailDoc.trim().toLowerCase())) {
                        return Optional.of(doc);
                    }
                }
            }
            return Optional.empty();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao buscar usuario por e-mail.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao buscar usuario por e-mail.", e);
        }
    }

    public DocumentSnapshot salvarSolicitacao(Map<String, Object> payload) {
        try {
            DocumentReference ref = db().collection(COLLECTION_SOLICITACOES).document();
            payload.put("id_solicitacao", ref.getId());
            ref.set(payload).get();
            return ref.get().get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao salvar solicitacao.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao salvar solicitacao.", e);
        }
    }

    public List<QueryDocumentSnapshot> listarSolicitacoesPorAluno(String uidAluno) {
        try {
            return db().collection(COLLECTION_SOLICITACOES)
                    .whereEqualTo("uid_aluno", uidAluno)
                    .get()
                    .get()
                    .getDocuments();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao listar solicitacoes do aluno.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao listar solicitacoes do aluno.", e);
        }
    }

    public List<QueryDocumentSnapshot> listarSolicitacoes(String status) {
        try {
            if (status == null || status.isBlank()) {
                return db().collection(COLLECTION_SOLICITACOES).get().get().getDocuments();
            }
            return db().collection(COLLECTION_SOLICITACOES)
                    .whereEqualTo("status", status)
                    .get()
                    .get()
                    .getDocuments();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao listar solicitacoes.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao listar solicitacoes.", e);
        }
    }

    public Optional<DocumentSnapshot> buscarSolicitacaoPorId(String idSolicitacao) {
        try {
            DocumentSnapshot doc = db().collection(COLLECTION_SOLICITACOES).document(idSolicitacao).get().get();
            return doc.exists() ? Optional.of(doc) : Optional.empty();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao buscar solicitacao.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao buscar solicitacao.", e);
        }
    }

    public void atualizarSolicitacao(String idSolicitacao, Map<String, Object> updates) {
        try {
            db().collection(COLLECTION_SOLICITACOES).document(idSolicitacao).update(updates).get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao atualizar solicitacao.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao atualizar solicitacao.", e);
        }
    }

    public List<QueryDocumentSnapshot> listarUsuariosPorRole(String role) {
        try {
            String roleAlvo = role == null ? "" : role.trim().toLowerCase();
            List<QueryDocumentSnapshot> usuarios = db().collection(COLLECTION_USUARIOS).get().get().getDocuments();
            List<QueryDocumentSnapshot> legacy = db().collection(COLLECTION_USUARIOS_LEGACY).get().get().getDocuments();
            return java.util.stream.Stream.concat(usuarios.stream(), legacy.stream())
                    .filter(doc -> {
                        String roleDoc = doc.getString("role");
                        return roleDoc != null && roleDoc.trim().toLowerCase().equals(roleAlvo);
                    })
                    .toList();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao listar usuarios por role.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao listar usuarios por role.", e);
        }
    }

    public Optional<DocumentSnapshot> buscarUsuarioPorId(String uid) {
        return buscarUsuarioPorUid(uid);
    }

    public void salvarUsuario(String uid, Map<String, Object> payload) {
        try {
            db().collection(COLLECTION_USUARIOS).document(uid).set(payload).get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao salvar usuario.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao salvar usuario.", e);
        }
    }

    public void removerUsuario(String uid) {
        try {
            db().collection(COLLECTION_USUARIOS).document(uid).delete().get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao remover usuario.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao remover usuario.", e);
        }
    }

    public List<QueryDocumentSnapshot> listarCursos() {
        try {
            return db().collection(COLLECTION_CURSOS).get().get().getDocuments();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao listar cursos.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao listar cursos.", e);
        }
    }

    public void salvarCurso(String idCurso, Map<String, Object> payload) {
        try {
            db().collection(COLLECTION_CURSOS).document(idCurso).set(payload).get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao salvar curso.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao salvar curso.", e);
        }
    }

    public Optional<DocumentSnapshot> buscarCurso(String idCurso) {
        try {
            DocumentSnapshot doc = db().collection(COLLECTION_CURSOS).document(idCurso).get().get();
            return doc.exists() ? Optional.of(doc) : Optional.empty();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao buscar curso.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao buscar curso.", e);
        }
    }

    @SuppressWarnings("unchecked")
    public void creditarHorasAprovadas(String uidAluno, String idCurso, String categoria, int horasAprovadas) {
        Optional<DocumentSnapshot> usuarioOpt = buscarUsuarioPorUid(uidAluno);
        if (usuarioOpt.isEmpty()) {
            return;
        }
        DocumentSnapshot usuario = usuarioOpt.get();
        Map<String, Object> vinculo = primeiroVinculo(usuario.get("vinculo"));
        if (vinculo == null) {
            return;
        }

        String chaveSaldo = categoria.toLowerCase()
                .replace("ã", "a")
                .replace("ç", "c")
                .replace("á", "a")
                .replace("é", "e");

        Object cursoVinculo = vinculo.get("id_curso");
        if (cursoVinculo == null || !cursoVinculo.toString().equals(idCurso)) {
            return;
        }
        Map<String, Object> saldos = (Map<String, Object>) vinculo.getOrDefault("saldos", new HashMap<>());
        Number atual = (Number) saldos.getOrDefault(chaveSaldo, 0);
        saldos.put(chaveSaldo, atual.intValue() + horasAprovadas);
        vinculo.put("saldos", saldos);

        try {
            db().collection(COLLECTION_USUARIOS).document(uidAluno).update("vinculo", vinculo).get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao atualizar saldos do aluno.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao atualizar saldos do aluno.", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> primeiroVinculo(Object vinculoRaw) {
        if (vinculoRaw instanceof Map<?, ?> map) {
            Map<String, Object> vinculo = new HashMap<>();
            map.forEach((k, v) -> vinculo.put(String.valueOf(k), v));
            return vinculo;
        }
        if (vinculoRaw instanceof List<?> lista && !lista.isEmpty() && lista.get(0) instanceof Map<?, ?> map) {
            Map<String, Object> vinculo = new HashMap<>();
            map.forEach((k, v) -> vinculo.put(String.valueOf(k), v));
            return vinculo;
        }
        return null;
    }
}
