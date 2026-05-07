package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AlunoAtividadeModel;
import com.complementasenac.backend.model.AlunoPerfilModel;
import com.complementasenac.backend.model.AlunoResumoModel;
import com.complementasenac.backend.model.AlunoSubmissaoRequestModel;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AlunoService {
    private final FirestoreService firestoreService;
    private final FileUploadService fileUploadService;

    public AlunoService(FirestoreService firestoreService, FileUploadService fileUploadService) {
        this.firestoreService = firestoreService;
        this.fileUploadService = fileUploadService;
    }

    public AlunoPerfilModel buscarPerfil(String uid, String email) {
        DocumentSnapshot usuario = buscarUsuario(uid, email);
        Map<String, Object> primeiroVinculo = primeiroVinculo(usuario);

        AlunoPerfilModel perfil = new AlunoPerfilModel();
        perfil.setUid(usuario.getId());
        perfil.setNome(usuario.getString("nome"));
        perfil.setEmail(usuario.getString("email"));
        perfil.setTelefone("");
        perfil.setIngresso("");
        perfil.setCurso(cursoDoVinculo(primeiroVinculo));
        perfil.setDepartamento("");
        perfil.setMatricula(texto(primeiroVinculo.get("matricula")));
        return perfil;
    }

    public AlunoResumoModel buscarResumo(String uid, String email) {
        DocumentSnapshot usuario = buscarUsuario(uid, email);
        Map<String, Object> vinculo = primeiroVinculo(usuario);
        List<AlunoAtividadeModel> atividades = listarHistorico(uid, email);

        int aprovadas = (int) atividades.stream().filter(a -> "APROVADO".equals(a.getStatus())).count();
        int pendentes = (int) atividades.stream().filter(a -> "PENDENTE".equals(a.getStatus())).count();
        int indeferidas = (int) atividades.stream().filter(a -> "REPROVADO".equals(a.getStatus())).count();

        Map<String, Object> saldos = castMap(vinculo.get("saldos"));
        int horasConcluidas = asInt(saldos.get("ensino")) + asInt(saldos.get("pesquisa")) + asInt(saldoExtensao(saldos));
        int horasNecessarias = asInt(vinculo.get("ch_total_exigida"));
        if (horasNecessarias <= 0) {
            horasNecessarias = 200;
        }

        AlunoResumoModel resumo = new AlunoResumoModel();
        resumo.setCurso(cursoDoVinculo(vinculo));
        resumo.setHorasConcluidas(horasConcluidas);
        resumo.setHorasNecessarias(horasNecessarias);
        resumo.setPercentualConcluido(Math.min(100, (horasConcluidas * 100) / horasNecessarias));
        resumo.setAprovadas(aprovadas);
        resumo.setPendentes(pendentes);
        resumo.setIndeferidas(indeferidas);
        resumo.setTotalAtividades(atividades.size());
        return resumo;
    }

    public List<AlunoAtividadeModel> listarHistorico(String uid, String email) {
        DocumentSnapshot usuario = buscarUsuario(uid, email);
        String uidAluno = usuario.getId();
        List<QueryDocumentSnapshot> docs = firestoreService.listarSolicitacoesPorAluno(uidAluno);
        List<AlunoAtividadeModel> atividades = new ArrayList<>();
        for (QueryDocumentSnapshot doc : docs) {
            atividades.add(paraAtividade(doc));
        }
        atividades.sort((a, b) -> b.getData().compareTo(a.getData()));
        return atividades;
    }

    public List<AlunoAtividadeModel> listarRecentes(int limite, String uid, String email) {
        return listarHistorico(uid, email).stream().limit(limite).toList();
    }

    public AlunoAtividadeModel submeterAtividade(AlunoSubmissaoRequestModel payload, String uid, String email) {
        validarSubmissao(payload);
        DocumentSnapshot usuario = buscarUsuario(uid, email);
        String idCurso = resolverCursoParaSubmissao(usuario, payload.getIdCurso());
        String categoria = resolverCategoria(payload.getCategoria(), payload.getTipo());
        String comprovanteUrl = fileUploadService.uploadDataUrl(payload.getComprovanteUrl(), usuario.getId());

        Map<String, Object> doc = new HashMap<>();
        doc.put("uid_aluno", usuario.getId());
        doc.put("id_curso", idCurso);
        doc.put("titulo_atividade", payload.getTitulo().trim());
        doc.put("categoria", categoria);
        doc.put("horas_informadas", payload.getHoras());
        doc.put("horas_aprovadas", 0);
        doc.put("status", "PENDENTE");
        doc.put("url_certificado", comprovanteUrl);
        doc.put("data_envio", Timestamp.now());
        doc.put("justificativa_coordenador", "");

        DocumentSnapshot salvo = firestoreService.salvarSolicitacao(doc);
        return paraAtividade(salvo);
    }

    private void validarSubmissao(AlunoSubmissaoRequestModel payload) {
        if (payload == null) {
            throw new IllegalArgumentException("Payload de submissao nao enviado.");
        }
        if (isBlank(payload.getTitulo()) || isBlank(payload.getTipo())) {
            throw new IllegalArgumentException("Titulo e tipo sao obrigatorios.");
        }
        if (payload.getHoras() <= 0) {
            throw new IllegalArgumentException("Horas deve ser maior que zero.");
        }
    }

    private DocumentSnapshot buscarUsuario(String uid, String email) {
        Optional<DocumentSnapshot> porUid = firestoreService.buscarUsuarioPorUid(uid);
        if (porUid.isPresent()) {
            return porUid.get();
        }
        return firestoreService.buscarUsuarioPorEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado no banco."));
    }

    private AlunoAtividadeModel paraAtividade(DocumentSnapshot doc) {
        AlunoAtividadeModel atividade = new AlunoAtividadeModel();
        atividade.setId(doc.getString("id_solicitacao") != null ? doc.getString("id_solicitacao") : doc.getId());
        atividade.setTitulo(texto(doc.get("titulo_atividade")));
        atividade.setTipo(texto(doc.get("categoria")));
        atividade.setCategoria(texto(doc.get("categoria")));
        atividade.setHoras(asInt(doc.get("horas_informadas")));
        atividade.setHorasAprovadas(asInt(doc.get("horas_aprovadas")));
        atividade.setStatus(normalizarStatus(texto(doc.get("status"))));
        atividade.setComprovanteUrl(fileUploadService.gerarUrlVisualizacao(texto(doc.get("url_certificado"))));
        atividade.setData(formatarData(doc.get("data_envio")));
        atividade.setJustificativaCoordenador(texto(doc.get("justificativa_coordenador")));
        return atividade;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> primeiroVinculo(DocumentSnapshot usuario) {
        return vinculosDoUsuario(usuario).get(0);
    }

    private Map<String, Object> castMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            Map<String, Object> resultado = new HashMap<>();
            map.forEach((k, v) -> resultado.put(String.valueOf(k), v));
            return resultado;
        }
        return new HashMap<>();
    }

    private int asInt(Object value) {
        if (value instanceof Number n) {
            return n.intValue();
        }
        return 0;
    }

    private String texto(Object value) {
        return value == null ? "" : value.toString();
    }

    private String resolverCategoria(String categoria, String tipo) {
        if (!isBlank(categoria)) {
            return capitalizarCategoria(categoria);
        }
        String t = tipo == null ? "" : tipo.toLowerCase();
        if (t.contains("pesquisa")) {
            return "Pesquisa";
        }
        if (t.contains("monitoria") || t.contains("curso")) {
            return "Ensino";
        }
        return "Extensao";
    }

    private String capitalizarCategoria(String categoria) {
        String c = categoria.trim().toLowerCase();
        if (c.startsWith("ens")) return "Ensino";
        if (c.startsWith("pes")) return "Pesquisa";
        return "Extensao";
    }

    private String normalizarStatus(String status) {
        if ("REPROVADO".equalsIgnoreCase(status)) {
            return "INDEFERIDO";
        }
        return status == null ? "PENDENTE" : status.toUpperCase();
    }

    private String formatarData(Object dataEnvio) {
        if (dataEnvio instanceof Timestamp ts) {
            return ts.toDate().toString();
        }
        return "";
    }

    private String resolverCursoParaSubmissao(DocumentSnapshot usuario, String idCursoPayload) {
        List<Map<String, Object>> vinculos = vinculosDoUsuario(usuario);
        String idCursoSolicitado = idCursoPayload == null ? "" : idCursoPayload.trim();
        if (!idCursoSolicitado.isBlank()) {
            boolean alunoPossuiCurso = vinculos.stream()
                    .anyMatch(vinculo -> idsCursoDoVinculo(vinculo).contains(idCursoSolicitado));
            if (!alunoPossuiCurso) {
                throw new IllegalArgumentException("Aluno nao possui vinculo com o curso informado.");
            }
            return idCursoSolicitado;
        }

        return vinculos.stream()
                .flatMap(vinculo -> idsCursoDoVinculo(vinculo).stream())
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Usuario sem curso vinculado."));
    }

    private String cursoDoVinculo(Map<String, Object> vinculo) {
        List<String> idsCurso = idsCursoDoVinculo(vinculo);
        if (idsCurso.isEmpty()) {
            return "";
        }
        return idsCurso.stream()
                .map(idCurso -> firestoreService.buscarCurso(idCurso)
                        .map(c -> texto(c.get("nome_curso")))
                        .filter(v -> !v.isBlank())
                        .orElse(idCurso))
                .toList()
                .stream()
                .reduce((a, b) -> a + ", " + b)
                .orElse("");
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> vinculosDoUsuario(DocumentSnapshot usuario) {
        List<Map<String, Object>> vinculos = listaDeMapas(usuario.get("vinculo"));
        if (vinculos == null || vinculos.isEmpty()) {
            vinculos = listaDeMapas(usuario.get("vinculos"));
        }
        if (vinculos == null || vinculos.isEmpty()) {
            throw new IllegalArgumentException("Usuario sem vinculo no curso. Verifique o campo vinculo no documento " + usuario.getId() + ".");
        }
        return vinculos;
    }

    private List<String> idsCursoDoVinculo(Map<String, Object> vinculo) {
        Object idCurso = vinculo.get("id_curso");
        if (idCurso instanceof List<?> cursos) {
            return cursos.stream()
                    .map(this::idReferenciaOuTexto)
                    .map(String::trim)
                    .filter(curso -> !curso.isBlank())
                    .toList();
        }
        String curso = idReferenciaOuTexto(idCurso).trim();
        return curso.isBlank() ? List.of() : List.of(curso);
    }

    private Object saldoExtensao(Map<String, Object> saldos) {
        return saldos.get("extensao");
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> listaDeMapas(Object value) {
        if (value instanceof List<?> lista) {
            return lista.stream()
                    .filter(Map.class::isInstance)
                    .map(item -> (Map<String, Object>) item)
                    .toList();
        }
        if (value instanceof Map<?, ?> map) {
            Map<String, Object> resultado = new HashMap<>();
            map.forEach((k, v) -> resultado.put(String.valueOf(k), v));
            return List.of(resultado);
        }
        return List.of();
    }

    private String idReferenciaOuTexto(Object value) {
        if (value instanceof DocumentReference ref) {
            return ref.getId();
        }
        String texto = texto(value).trim();
        if (texto.contains("/")) {
            return texto.substring(texto.lastIndexOf("/") + 1);
        }
        return texto;
    }

    private boolean isBlank(String valor) {
        return valor == null || valor.isBlank();
    }
}
