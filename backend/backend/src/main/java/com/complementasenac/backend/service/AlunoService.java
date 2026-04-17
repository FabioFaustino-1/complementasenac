package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AlunoAtividadeModel;
import com.complementasenac.backend.model.AlunoPerfilModel;
import com.complementasenac.backend.model.AlunoResumoModel;
import com.complementasenac.backend.model.AlunoSubmissaoRequestModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AlunoService {

    private static final int HORAS_NECESSARIAS = 40;
    private final AtomicLong idGenerator = new AtomicLong(1);
    private final List<AlunoAtividadeModel> atividades = new ArrayList<>();

    public AlunoService() {
        atividades.add(criarAtividade("Workshop de React Avancado", "Workshop", "12/03/2026", 8, "APROVADO"));
        atividades.add(criarAtividade("Palestra sobre IA Generativa", "Palestra", "08/03/2026", 4, "PENDENTE"));
        atividades.add(criarAtividade("Curso de Python para Dados", "Curso Online", "15/02/2026", 8, "APROVADO"));
        atividades.add(criarAtividade("Monitoria de Banco de Dados", "Monitoria", "10/02/2026", 10, "APROVADO"));
        atividades.add(criarAtividade("Hackathon Senac 2026", "Congresso", "01/03/2026", 15, "INDEFERIDO"));
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

    public AlunoResumoModel buscarResumo() {
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
        resumo.setPercentualConcluido(Math.min(100, (horasConcluidas * 100) / HORAS_NECESSARIAS));
        resumo.setAprovadas(aprovadas);
        resumo.setPendentes(pendentes);
        resumo.setIndeferidas(indeferidas);
        resumo.setTotalAtividades(atividades.size());
        return resumo;
    }

    public List<AlunoAtividadeModel> listarHistorico() {
        return atividades.stream()
                .sorted(Comparator.comparing(AlunoAtividadeModel::getId).reversed())
                .toList();
    }

    public List<AlunoAtividadeModel> listarRecentes(int limite) {
        return listarHistorico().stream().limit(limite).toList();
    }

    public AlunoAtividadeModel submeterAtividade(AlunoSubmissaoRequestModel payload) {
        validarSubmissao(payload);
        AlunoAtividadeModel atividade = criarAtividade(
                payload.getTitulo(),
                payload.getTipo(),
                payload.getData(),
                payload.getHoras(),
                "PENDENTE"
        );
        atividade.setComprovanteUrl(payload.getComprovanteUrl());
        atividades.add(atividade);
        return atividade;
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

    private AlunoAtividadeModel criarAtividade(String titulo, String tipo, String data, int horas, String status) {
        AlunoAtividadeModel atividade = new AlunoAtividadeModel();
        atividade.setId(idGenerator.getAndIncrement());
        atividade.setTitulo(titulo);
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
