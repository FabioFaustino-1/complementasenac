package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AlunoAtividadeModel;
import com.complementasenac.backend.model.AtividadeCoordenadorModel;
import com.complementasenac.backend.model.CoordenadorPerfilModel;
import com.complementasenac.backend.model.CoordenadorResumoModel;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CoordenadorService {
    private final FirestoreService firestoreService;

    public CoordenadorService(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    public List<AtividadeCoordenadorModel> listarPendentes() {
        return firestoreService.listarSolicitacoes("PENDENTE").stream()
                .map(this::paraCoordenador)
                .toList();
    }

    public List<AtividadeCoordenadorModel> listarTodas() {
        return firestoreService.listarSolicitacoes(null).stream()
                .map(this::paraCoordenador)
                .toList();
    }

    public Optional<AtividadeCoordenadorModel> decidir(String id, String status, Integer horasAprovadas, String justificativa) {
        if ("INDEFERIDO".equals(status)) {
            status = "REPROVADO";
        }
        validarStatus(status);
        Optional<DocumentSnapshot> docOpt = firestoreService.buscarSolicitacaoPorId(id);
        if (docOpt.isEmpty()) {
            return Optional.empty();
        }
        DocumentSnapshot doc = docOpt.get();

        int horasFinal = horasAprovadas != null ? horasAprovadas : asInt(doc.get("horas_informadas"));
        Map<String, Object> updates = new HashMap<>();
        updates.put("status", status);
        updates.put("horas_aprovadas", "APROVADO".equals(status) ? horasFinal : 0);
        updates.put("justificativa_coordenador", justificativa == null ? "" : justificativa.trim());
        firestoreService.atualizarSolicitacao(id, updates);

        if ("APROVADO".equals(status)) {
            firestoreService.creditarHorasAprovadas(
                    texto(doc.get("uid_aluno")),
                    texto(doc.get("id_curso")),
                    texto(doc.get("categoria")),
                    horasFinal
            );
        }

        return firestoreService.buscarSolicitacaoPorId(id).map(this::paraCoordenador);
    }

    public CoordenadorResumoModel resumo() {
        List<QueryDocumentSnapshot> todas = firestoreService.listarSolicitacoes(null);
        int pendentes = (int) todas.stream().filter(a -> "PENDENTE".equals(texto(a.get("status")))).count();
        int aprovadasNoMes = (int) todas.stream().filter(a -> "APROVADO".equals(texto(a.get("status")))).count();
        int rejeitadasNoMes = (int) todas.stream().filter(a -> "REPROVADO".equals(texto(a.get("status")))).count();
        int totalDecididas = aprovadasNoMes + rejeitadasNoMes;
        int taxa = totalDecididas == 0 ? 0 : (aprovadasNoMes * 100) / totalDecididas;

        CoordenadorResumoModel resumo = new CoordenadorResumoModel();
        resumo.setPendentes(pendentes);
        resumo.setAprovadasNoMes(aprovadasNoMes);
        resumo.setRejeitadasNoMes(rejeitadasNoMes);
        resumo.setAlunosAtivos(firestoreService.listarUsuariosPorRole("ALUNO").size());
        resumo.setTaxaAprovacao(taxa);
        return resumo;
    }

    public CoordenadorPerfilModel perfil(String uid, String email) {
        DocumentSnapshot usuario = firestoreService.buscarUsuarioPorUid(uid)
                .or(() -> firestoreService.buscarUsuarioPorEmail(email))
                .orElseThrow(() -> new IllegalArgumentException("Coordenador nao encontrado."));

        CoordenadorPerfilModel perfil = new CoordenadorPerfilModel();
        perfil.setUid(usuario.getId());
        perfil.setNome(usuario.getString("nome"));
        perfil.setEmail(usuario.getString("email"));
        perfil.setCpf("");
        perfil.setTelefone("");
        perfil.setIngresso("");
        perfil.setMatricula("");
        perfil.setDepartamento("");
        return perfil;
    }

    private void validarStatus(String status) {
        if (!"APROVADO".equals(status) && !"REPROVADO".equals(status) && !"PENDENTE".equals(status)) {
            throw new IllegalArgumentException("Status invalido. Use APROVADO, REPROVADO ou PENDENTE.");
        }
    }

    private AtividadeCoordenadorModel paraCoordenador(DocumentSnapshot a) {
        AtividadeCoordenadorModel atividade = new AtividadeCoordenadorModel();
        atividade.setId(a.getId());
        atividade.setTitulo(texto(a.get("titulo_atividade")));
        atividade.setAluno(buscarNomeAluno(texto(a.get("uid_aluno"))));
        atividade.setTipo(texto(a.get("categoria")));
        atividade.setData(texto(a.get("data_envio")));
        atividade.setHoras(asInt(a.get("horas_informadas")));
        atividade.setConfiancaIa(0);
        atividade.setStatus(texto(a.get("status")));
        return atividade;
    }

    private String buscarNomeAluno(String uidAluno) {
        return firestoreService.buscarUsuarioPorUid(uidAluno)
                .map(doc -> texto(doc.get("nome")))
                .filter(v -> !v.isBlank())
                .orElse("Aluno");
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
}
