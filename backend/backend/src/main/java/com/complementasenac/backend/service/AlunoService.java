package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AlunoAtividadeModel;
import com.complementasenac.backend.model.AlunoPerfilModel;
import com.complementasenac.backend.model.AlunoResumoModel;
import com.complementasenac.backend.model.AlunoSubmissaoRequestModel;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlunoService {

    private static final int HORAS_NECESSARIAS = 40;
    private final AtividadeComplementarRepository repository;

    public AlunoService(AtividadeComplementarRepository repository) {
        this.repository = repository;
    }

    public AlunoPerfilModel buscarPerfil(String uid, String email) {
        AlunoPerfilModel perfil = new AlunoPerfilModel();
        perfil.setUid(uid);
        perfil.setNome("Fabio Faustao");
        perfil.setEmail(email);
        perfil.setTelefone("(81) 99728-1233");
        perfil.setIngresso("Fevereiro 2024");
        perfil.setCurso("Analise e Desenvolvimento de Sistemas");
        perfil.setDepartamento("Tecnologia da Informacao");
        perfil.setMatricula("2024.1.12.12345");
        return perfil;
    }

    public AlunoResumoModel buscarResumo(String alunoEmail) {
        List<AlunoAtividadeModel> atividades = filtrarDoAluno(alunoEmail);
        int aprovadas = (int) atividades.stream().filter(a -> "APROVADO".equals(a.getStatus())).count();
        int pendentes = (int) atividades.stream().filter(a -> "PENDENTE".equals(a.getStatus())).count();
        int indeferidas = (int) atividades.stream().filter(a -> "INDEFERIDO".equals(a.getStatus())).count();
        int horasConcluidas = atividades.stream()
                .filter(a -> "APROVADO".equals(a.getStatus()))
                .mapToInt(AlunoAtividadeModel::getHoras)
                .sum();

        AlunoResumoModel resumo = new AlunoResumoModel();
        resumo.setCurso("Analise e Desenvolvimento de Sistemas");
        resumo.setHorasConcluidas(horasConcluidas);
        resumo.setHorasNecessarias(HORAS_NECESSARIAS);
        resumo.setPercentualConcluido(HORAS_NECESSARIAS == 0 ? 0
                : Math.min(100, (horasConcluidas * 100) / HORAS_NECESSARIAS));
        resumo.setAprovadas(aprovadas);
        resumo.setPendentes(pendentes);
        resumo.setIndeferidas(indeferidas);
        resumo.setTotalAtividades(atividades.size());
        return resumo;
    }

    public List<AlunoAtividadeModel> listarHistorico(String alunoEmail) {
        return filtrarDoAluno(alunoEmail).stream()
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .toList();
    }

    public List<AlunoAtividadeModel> listarRecentes(int limite, String alunoEmail) {
        return listarHistorico(alunoEmail).stream().limit(limite).toList();
    }

    public AlunoAtividadeModel submeterAtividade(AlunoSubmissaoRequestModel payload, String uid, String email) {
        validarSubmissao(payload);
        String nomeAluno = buscarPerfil(uid, email).getNome();
        AlunoAtividadeModel atividade = criarAtividade(
                payload.getTitulo(),
                nomeAluno,
                email,
                payload.getTipo(),
                payload.getData(),
                payload.getHoras(),
                "PENDENTE"
        );
        atividade.setComprovanteUrl(payload.getComprovanteUrl());
        return repository.persistir(atividade);
    }

    private List<AlunoAtividadeModel> filtrarDoAluno(String alunoEmail) {
        if (alunoEmail == null || alunoEmail.isBlank()) {
            return List.of();
        }
        String e = alunoEmail.trim().toLowerCase();
        return repository.todas().stream()
                .filter(a -> a.getAlunoEmail() != null && e.equals(a.getAlunoEmail().toLowerCase()))
                .toList();
    }

    private void validarSubmissao(AlunoSubmissaoRequestModel payload) {
        if (payload == null) {
            throw new IllegalArgumentException("Payload de submissao nao enviado.");
        }
        if (isBlank(payload.getTitulo()) || isBlank(payload.getTipo()) || isBlank(payload.getData())) {
            throw new IllegalArgumentException("Titulo, tipo e data sao obrigatorios.");
        }
        if (payload.getHoras() <= 0) {
            throw new IllegalArgumentException("Horas deve ser maior que zero.");
        }
    }

    private AlunoAtividadeModel criarAtividade(
            String titulo, String alunoNome, String alunoEmail, String tipo, String data, int horas, String status) {
        AlunoAtividadeModel atividade = new AlunoAtividadeModel();
        atividade.setTitulo(titulo);
        atividade.setAlunoNome(alunoNome);
        atividade.setAlunoEmail(alunoEmail != null ? alunoEmail.trim() : null);
        atividade.setTipo(tipo);
        atividade.setData(data);
        atividade.setHoras(horas);
        atividade.setStatus(status);
        return atividade;
    }

    private boolean isBlank(String valor) {
        return valor == null || valor.isBlank();
    }
}
