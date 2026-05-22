package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AlunoAtividadeModel;
import com.complementasenac.backend.model.AlunoPerfilModel;
import com.complementasenac.backend.model.AlunoResumoModel;
import com.complementasenac.backend.model.AlunoSubmissaoRequestModel;
import com.google.cloud.Timestamp;
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
        perfil.setUid(textoOuPadrao(usuario.getString("uid"), usuario.getId()));
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
        int horasConcluidas = asInt(saldos.get("ensino")) + asInt(saldos.get("pesquisa")) + asInt(saldos.get("extensao"));
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
        Map<String, Object> vinculo = primeiroVinculo(usuario);
        String idCurso = isBlank(payload.getIdCurso()) ? texto(vinculo.get("id_curso")) : payload.getIdCurso().trim();
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
        try {
            Optional<DocumentSnapshot> porUid = firestoreService.buscarUsuarioPorUid(uid);
            if (porUid.isPresent()) {
                return porUid.get();
            }
        } catch (RuntimeException ignored) {
            // Bases antigas podem nao aceitar consulta por UID; o e-mail do token ainda identifica o usuario.
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
        atividade.setComprovanteUrl(texto(doc.get("url_certificado")));
        atividade.setData(formatarData(doc.get("data_envio")));
        atividade.setJustificativaCoordenador(texto(doc.get("justificativa_coordenador")));
        return atividade;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> primeiroVinculo(DocumentSnapshot usuario) {
        Object vinculoRaw = usuario.get("vinculo");
        if (vinculoRaw instanceof Map<?, ?> mapVinculo) {
            Map<String, Object> vinculo = new HashMap<>();
            mapVinculo.forEach((k, v) -> vinculo.put(String.valueOf(k), v));
            return vinculo;
        }
        if (vinculoRaw instanceof List<?> listaVinculo
                && !listaVinculo.isEmpty()
                && listaVinculo.get(0) instanceof Map<?, ?> mapVinculo) {
            Map<String, Object> vinculo = new HashMap<>();
            mapVinculo.forEach((k, v) -> vinculo.put(String.valueOf(k), v));
                return vinculo;
        }

        Map<String, Object> vinculo = new HashMap<>();
        vinculo.put("id_curso", textoOuPadrao(usuario.getString("id_curso"), usuario.getString("curso")));
        vinculo.put("matricula", usuario.getString("matricula"));
        vinculo.put("ch_total_exigida", usuario.get("ch_total_exigida"));
        if (!texto(vinculo.get("id_curso")).isBlank() || !texto(vinculo.get("matricula")).isBlank()) {
            return vinculo;
        }

        throw new IllegalArgumentException("Usuario sem vinculo no curso.");
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

    private String textoOuPadrao(String value, String fallback) {
        return value == null || value.isBlank() ? texto(fallback) : value;
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

    private String cursoDoVinculo(Map<String, Object> vinculo) {
        String idCurso = texto(vinculo.get("id_curso"));
        if (idCurso.isBlank()) {
            idCurso = texto(vinculo.get("curso"));
        }
        return firestoreService.buscarCurso(idCurso)
                .map(c -> texto(c.get("nome_curso")))
                .filter(v -> !v.isBlank())
                .orElse(idCurso);
    }

    private boolean isBlank(String valor) {
        return valor == null || valor.isBlank();
    }
}
