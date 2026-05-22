package com.complementasenac.backend.service;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
public class FirestoreService {
    private static final String COLLECTION_USUARIOS_PADRAO = "usuarios";
    private static final String COLLECTION_SOLICITACOES_PADRAO = "solicitacoes";
    private static final String COLLECTION_CURSOS_PADRAO = "cursos";
    private static final List<String> COLLECTIONS_USUARIOS = List.of("usuarios", "Usuarios", "users", "Users");
    private static final List<String> COLLECTIONS_SOLICITACOES = List.of("solicitacoes", "Solicitacoes", "atividades", "Atividades");
    private static final List<String> COLLECTIONS_CURSOS = List.of("cursos", "Cursos");

    public Firestore db() {
        return FirestoreClient.getFirestore();
    }

    public Optional<DocumentSnapshot> buscarUsuarioPorUid(String uid) {
        if (uid == null || uid.isBlank()) {
            return Optional.empty();
        }
        for (String collection : COLLECTIONS_USUARIOS) {
            Optional<DocumentSnapshot> doc = buscarDocumentoPorId(collection, uid, "Falha ao buscar usuario por UID.");
            if (doc.isPresent()) {
                return doc;
            }
        }
        for (String collection : COLLECTIONS_USUARIOS) {
            Optional<DocumentSnapshot> doc = buscarUsuarioPorCampoUid(collection, uid);
            if (doc.isPresent()) {
                return doc;
            }
        }
        return Optional.empty();
    }

    private Optional<DocumentSnapshot> buscarUsuarioPorCampoUid(String collection, String uid) {
        try {
            var query = db().collection(collection)
                    .whereEqualTo("uid", uid)
                    .limit(1)
                    .get()
                    .get();
            if (!query.isEmpty()) {
                return Optional.of(query.getDocuments().get(0));
            }
            return Optional.empty();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao buscar usuario por UID.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao buscar usuario por UID.", e);
        }
    }

    public Optional<DocumentSnapshot> buscarUsuarioPorEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        try {
            String alvo = email.trim().toLowerCase();
            for (String colecao : COLLECTIONS_USUARIOS) {
                var query = db().collection(colecao)
                        .whereEqualTo("email", alvo)
                        .limit(1)
                        .get()
                        .get();
                for (DocumentSnapshot doc : query.getDocuments()) {
                    return Optional.of(doc);
                }
            }
            for (String colecao : COLLECTIONS_USUARIOS) {
                var query = db().collection(colecao).limit(500).get().get();
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
            DocumentReference ref = db().collection(COLLECTION_SOLICITACOES_PADRAO).document();
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
            List<QueryDocumentSnapshot> docs = new ArrayList<>();
            for (String collection : COLLECTIONS_SOLICITACOES) {
                docs.addAll(db().collection(collection)
                        .whereEqualTo("uid_aluno", uidAluno)
                        .get()
                        .get()
                        .getDocuments());
            }
            return docs;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao listar solicitacoes do aluno.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao listar solicitacoes do aluno.", e);
        }
    }

    public List<QueryDocumentSnapshot> listarSolicitacoes(String status) {
        try {
            List<QueryDocumentSnapshot> docs = new ArrayList<>();
            if (status == null || status.isBlank()) {
                for (String collection : COLLECTIONS_SOLICITACOES) {
                    docs.addAll(db().collection(collection).get().get().getDocuments());
                }
                return docs;
            }
            for (String collection : COLLECTIONS_SOLICITACOES) {
                docs.addAll(db().collection(collection)
                        .whereEqualTo("status", status)
                        .get()
                        .get()
                        .getDocuments());
            }
            return docs;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao listar solicitacoes.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao listar solicitacoes.", e);
        }
    }

    public Optional<DocumentSnapshot> buscarSolicitacaoPorId(String idSolicitacao) {
        for (String collection : COLLECTIONS_SOLICITACOES) {
            Optional<DocumentSnapshot> doc = buscarDocumentoPorId(collection, idSolicitacao, "Falha ao buscar solicitacao.");
            if (doc.isPresent()) {
                return doc;
            }
        }
        return Optional.empty();
    }

    public void atualizarSolicitacao(String idSolicitacao, Map<String, Object> updates) {
        try {
            DocumentSnapshot doc = buscarSolicitacaoPorId(idSolicitacao)
                    .orElseThrow(() -> new IllegalArgumentException("Solicitacao nao encontrada."));
            doc.getReference().update(updates).get();
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
            List<QueryDocumentSnapshot> usuarios = new ArrayList<>();
            for (String collection : COLLECTIONS_USUARIOS) {
                usuarios.addAll(db().collection(collection).get().get().getDocuments());
            }
            return usuarios.stream()
                    .filter(doc -> {
                        String roleDoc = roleDoUsuario(doc);
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
            DocumentReference ref = buscarUsuarioPorUid(uid)
                    .map(DocumentSnapshot::getReference)
                    .orElse(db().collection(COLLECTION_USUARIOS_PADRAO).document(uid));
            ref.set(payload).get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao salvar usuario.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao salvar usuario.", e);
        }
    }

    public void removerUsuario(String uid) {
        try {
            Optional<DocumentSnapshot> usuario = buscarUsuarioPorUid(uid);
            if (usuario.isPresent()) {
                usuario.get().getReference().delete().get();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao remover usuario.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao remover usuario.", e);
        }
    }

    public List<QueryDocumentSnapshot> listarCursos() {
        try {
            List<QueryDocumentSnapshot> docs = new ArrayList<>();
            for (String collection : COLLECTIONS_CURSOS) {
                docs.addAll(db().collection(collection).get().get().getDocuments());
            }
            return docs;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao listar cursos.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao listar cursos.", e);
        }
    }

    public void salvarCurso(String idCurso, Map<String, Object> payload) {
        try {
            DocumentReference ref = buscarCurso(idCurso)
                    .map(DocumentSnapshot::getReference)
                    .orElse(db().collection(COLLECTION_CURSOS_PADRAO).document(idCurso));
            ref.set(payload).get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao salvar curso.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Falha ao salvar curso.", e);
        }
    }

    public Optional<DocumentSnapshot> buscarCurso(String idCurso) {
        for (String collection : COLLECTIONS_CURSOS) {
            Optional<DocumentSnapshot> doc = buscarDocumentoPorId(collection, idCurso, "Falha ao buscar curso.");
            if (doc.isPresent()) {
                return doc;
            }
        }
        return Optional.empty();
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
            usuario.getReference().update("vinculo", vinculo).get();
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

    private Optional<DocumentSnapshot> buscarDocumentoPorId(String collection, String id, String mensagemErro) {
        try {
            DocumentSnapshot doc = db().collection(collection).document(id).get().get();
            return doc.exists() ? Optional.of(doc) : Optional.empty();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(mensagemErro, e);
        } catch (ExecutionException e) {
            throw new RuntimeException(mensagemErro, e);
        }
    }

    private String roleDoUsuario(DocumentSnapshot doc) {
        String role = doc.getString("role");
        if (role != null) {
            return role;
        }
        role = doc.getString("perfil");
        if (role != null) {
            return role;
        }
        return doc.getString("tipo");
    }
}
