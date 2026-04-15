package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AtividadeCoordenadorModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
        return atividades.stream().filter(a -> "PENDENTE".equals(a.getStatus())).toList();
    }

    public Optional<AtividadeCoordenadorModel> decidir(Long id, String status) {
        for (AtividadeCoordenadorModel atividade : atividades) {
            if (atividade.getId().equals(id)) {
                atividade.setStatus(status);
                return Optional.of(atividade);
            }
        }
        return Optional.empty();
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
