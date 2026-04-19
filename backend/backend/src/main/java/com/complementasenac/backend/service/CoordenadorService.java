package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AlunoAtividadeModel;
import com.complementasenac.backend.model.AtividadeCoordenadorModel;
import com.complementasenac.backend.model.CoordenadorPerfilModel;
import com.complementasenac.backend.model.CoordenadorResumoModel;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class CoordenadorService {

    private final AtividadeComplementarRepository repository;

    public CoordenadorService(AtividadeComplementarRepository repository) {
        this.repository = repository;
    }

    public List<AtividadeCoordenadorModel> listarPendentes() {
        return repository.todas().stream()
                .filter(a -> "PENDENTE".equals(a.getStatus()))
                .sorted(Comparator.comparing(AlunoAtividadeModel::getId))
                .map(this::paraCoordenador)
                .toList();
    }

    public List<AtividadeCoordenadorModel> listarTodas() {
        return repository.todas().stream()
                .sorted(Comparator.comparing(AlunoAtividadeModel::getId).reversed())
                .map(this::paraCoordenador)
                .toList();
    }

    public Optional<AtividadeCoordenadorModel> decidir(Long id, String status) {
        validarStatus(status);
        return repository.porId(id).map(a -> {
            a.setStatus(status);
            return paraCoordenador(a);
        });
    }

    public CoordenadorResumoModel resumo() {
        List<AlunoAtividadeModel> todas = repository.todas();
        int pendentes = (int) todas.stream().filter(a -> "PENDENTE".equals(a.getStatus())).count();
        int aprovadasNoMes = (int) todas.stream().filter(a -> "APROVADO".equals(a.getStatus())).count();
        int rejeitadasNoMes = (int) todas.stream().filter(a -> "INDEFERIDO".equals(a.getStatus())).count();
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

    private AtividadeCoordenadorModel paraCoordenador(AlunoAtividadeModel a) {
        AtividadeCoordenadorModel atividade = new AtividadeCoordenadorModel();
        atividade.setId(a.getId());
        atividade.setTitulo(a.getTitulo());
        atividade.setAluno(a.getAlunoNome() != null ? a.getAlunoNome() : "Aluno");
        atividade.setTipo(a.getTipo());
        atividade.setData(a.getData());
        atividade.setHoras(a.getHoras());
        atividade.setConfiancaIa(50 + (int) (a.getId() != null ? a.getId() % 50 : 0));
        atividade.setStatus(a.getStatus());
        return atividade;
    }
}
