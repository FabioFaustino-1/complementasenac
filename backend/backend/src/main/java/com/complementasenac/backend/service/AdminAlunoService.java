package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AlunoAdminModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AdminAlunoService {
    private final List<AlunoAdminModel> alunos = new ArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public AdminAlunoService() {
        criar("Fabio Faustao", "fabio.faustao@edu.pe.senac.br", "2024.1.12.12345", "Analise e Desenvolvimento de Sistemas");
        criar("Ana Oliveira", "ana.oliveira@edu.pe.senac.br", "2024.1.12.12346", "Design Grafico");
    }

    public List<AlunoAdminModel> listar() {
        return alunos;
    }

    public AlunoAdminModel criar(String nome, String email, String matricula, String curso) {
        AlunoAdminModel aluno = new AlunoAdminModel();
        aluno.setId(idGenerator.getAndIncrement());
        aluno.setNome(nome);
        aluno.setEmail(email);
        aluno.setMatricula(matricula);
        aluno.setCurso(curso);
        alunos.add(aluno);
        return aluno;
    }
}
