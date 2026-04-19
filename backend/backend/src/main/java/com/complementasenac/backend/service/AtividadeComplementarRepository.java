package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AlunoAtividadeModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Armazenamento em memória compartilhado entre aluno e coordenador (demo).
 */
@Service
public class AtividadeComplementarRepository {

    private final List<AlunoAtividadeModel> atividades = new ArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public AtividadeComplementarRepository() {
        seed("Workshop de React Avancado", "Fabio Faustao", "fabio.faustao@edu.pe.senac.br", "Workshop", "12/03/2026", 8, "APROVADO");
        seed("Palestra sobre IA Generativa", "Fabio Faustao", "fabio.faustao@edu.pe.senac.br", "Palestra", "08/03/2026", 4, "PENDENTE");
        seed("Curso de Python para Dados", "Fabio Faustao", "fabio.faustao@edu.pe.senac.br", "Curso Online", "15/02/2026", 8, "APROVADO");
        seed("Monitoria de Banco de Dados", "Fabio Faustao", "fabio.faustao@edu.pe.senac.br", "Monitoria", "10/02/2026", 10, "APROVADO");
        seed("Hackathon Senac 2026", "Fabio Faustao", "fabio.faustao@edu.pe.senac.br", "Congresso", "01/03/2026", 15, "INDEFERIDO");
        seed("Workshop de React Avancado", "Maria Silva", "maria.silva@edu.pe.senac.br", "Workshop", "12/03/2026", 8, "PENDENTE");
        seed("Palestra sobre IA Generativa", "Joao Santos", "joao.santos@edu.pe.senac.br", "Palestra", "08/03/2026", 4, "PENDENTE");
        seed("Curso de Excel Avancado", "Ana Costa", "ana.costa@edu.pe.senac.br", "Curso Online", "01/03/2026", 20, "PENDENTE");
    }

    private void seed(String titulo, String alunoNome, String alunoEmail, String tipo, String data, int horas, String status) {
        AlunoAtividadeModel a = new AlunoAtividadeModel();
        a.setId(idGenerator.getAndIncrement());
        a.setTitulo(titulo);
        a.setAlunoNome(alunoNome);
        a.setAlunoEmail(alunoEmail);
        a.setTipo(tipo);
        a.setData(data);
        a.setHoras(horas);
        a.setStatus(status);
        atividades.add(a);
    }

    public List<AlunoAtividadeModel> todasOrdenadasPorIdDesc() {
        return atividades.stream()
                .sorted(Comparator.comparing(AlunoAtividadeModel::getId).reversed())
                .toList();
    }

    public List<AlunoAtividadeModel> todas() {
        return new ArrayList<>(atividades);
    }

    public Optional<AlunoAtividadeModel> porId(Long id) {
        return atividades.stream().filter(a -> id.equals(a.getId())).findFirst();
    }

    public AlunoAtividadeModel persistir(AlunoAtividadeModel atividade) {
        if (atividade.getId() == null) {
            atividade.setId(idGenerator.getAndIncrement());
        }
        atividades.add(atividade);
        return atividade;
    }
}
