package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AtividadeCoordenadorModel;
import com.complementasenac.backend.model.CoordenadorPerfilModel;
import com.complementasenac.backend.model.CoordenadorResumoModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class CoordenadorService {
    private final List<AtividadeCoordenadorModel> atividades = new ArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public CoordenadorService() {
        atividades.add(novaAtividade("Workshop de React Avancado", "Maria Silva", "Workshop", "12/03/2026", 8, 95));
        atividades.add(novaAtividade("Palestra sobre IA Generativa", "Joao Santos", "Palestra", "08/03/2026", 4, 88));
        atividades.add(novaAtividade("Curso de Excel Avancado", "Ana Costa", "Curso Online", "01/03/2026", 20, 42));
    }

    public List<AtividadeCoordenadorModel> listarPendentes() {
        return atividades.stream()
                .filter(a -> "PENDENTE".equals(a.getStatus()))
                .sorted(Comparator.comparing(AtividadeCoordenadorModel::getId))
                .toList();
    }

    public List<AtividadeCoordenadorModel> listarTodas() {
        return atividades.stream()
                .sorted(Comparator.comparing(AtividadeCoordenadorModel::getId).reversed())
                .toList();
    }

    public Optional<AtividadeCoordenadorModel> decidir(Long id, String status) {
        validarStatus(status);
        for (AtividadeCoordenadorModel atividade : atividades) {
            if (atividade.getId().equals(id)) {
                atividade.setStatus(status);
                return Optional.of(atividade);
            }
        }
        return Optional.empty();
    }

    public CoordenadorResumoModel resumo() {
        int pendentes = (int) atividades.stream().filter(a -> "PENDENTE".equals(a.getStatus())).count();
        int aprovadasNoMes = (int) atividades.stream().filter(a -> "APROVADO".equals(a.getStatus())).count();
        int rejeitadasNoMes = (int) atividades.stream().filter(a -> "INDEFERIDO".equals(a.getStatus())).count();
        int totalDecididas = aprovadasNoMes + rejeitadasNoMes;
        int taxa = totalDecididas == 0 ? 0 : (aprovadasNoMes * 100) / totalDecididas;

        CoordenadorResumoModel resumo = new CoordenadorResumoModel();
        resumo.setPendentes(pendentes);
        resumo.setAprovadasNoMes(aprovadasNoMes);
        resumo.setRejeitadasNoMes(rejeitadasNoMes);
        resumo.setAlunosAtivos(40);
        resumo.setTaxaAprovacao(taxa);
        return resumo;
    }

    public CoordenadorPerfilModel perfil(String uid, String email) {
        CoordenadorPerfilModel perfil = new CoordenadorPerfilModel();
        perfil.setUid(uid);
        perfil.setNome("Fabio Faustino");
        perfil.setEmail(email);
        perfil.setCpf("000.000.000-00");
        perfil.setTelefone("(81) 99999-9999");
        perfil.setIngresso("15 de Marco de 2024");
        perfil.setMatricula("2024.1.00042");
        perfil.setDepartamento("Tecnologia da Informacao (ADS)");
        return perfil;
    }

    private void validarStatus(String status) {
        if (!"APROVADO".equals(status) && !"INDEFERIDO".equals(status) && !"PENDENTE".equals(status)) {
            throw new IllegalArgumentException("Status invalido. Use APROVADO, INDEFERIDO ou PENDENTE.");
        }
    }

    private AtividadeCoordenadorModel novaAtividade(String titulo, String aluno, String tipo, String data, int horas, int confiancaIa) {
        AtividadeCoordenadorModel atividade = new AtividadeCoordenadorModel();
        atividade.setId(idGenerator.getAndIncrement());
        atividade.setTitulo(titulo);
        atividade.setAluno(aluno);
        atividade.setTipo(tipo);
        atividade.setData(data);
        atividade.setHoras(horas);
        atividade.setConfiancaIa(confiancaIa);
        atividade.setStatus("PENDENTE");
        return atividade;
    }
}
