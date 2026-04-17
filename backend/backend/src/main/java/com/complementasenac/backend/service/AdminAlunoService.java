package com.complementasenac.backend.service;

import com.complementasenac.backend.model.AlunoAdminModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
        return new ArrayList<>(alunos);
    }

    public Optional<AlunoAdminModel> buscarPorId(Long id) {
        return alunos.stream()
                .filter(aluno -> aluno.getId().equals(id))
                .findFirst();
    }

    public AlunoAdminModel criar(String nome, String email, String matricula, String curso) {
        validarDados(nome, email, matricula, curso);
        validarDuplicidade(email, matricula, null);

        AlunoAdminModel aluno = new AlunoAdminModel();
        aluno.setId(idGenerator.getAndIncrement());
        aluno.setNome(nome);
        aluno.setEmail(email);
        aluno.setMatricula(matricula);
        aluno.setCurso(curso);
        alunos.add(aluno);
        return aluno;
    }

    public Optional<AlunoAdminModel> atualizar(Long id, String nome, String email, String matricula, String curso) {
        validarDados(nome, email, matricula, curso);
        Optional<AlunoAdminModel> alunoExistente = buscarPorId(id);
        if (alunoExistente.isEmpty()) {
            return Optional.empty();
        }

        validarDuplicidade(email, matricula, id);

        AlunoAdminModel aluno = alunoExistente.get();
        aluno.setNome(nome);
        aluno.setEmail(email);
        aluno.setMatricula(matricula);
        aluno.setCurso(curso);
        return Optional.of(aluno);
    }

    public boolean remover(Long id) {
        return alunos.removeIf(aluno -> aluno.getId().equals(id));
    }

    private void validarDados(String nome, String email, String matricula, String curso) {
        if (isBlank(nome) || isBlank(email) || isBlank(matricula) || isBlank(curso)) {
            throw new IllegalArgumentException("Todos os campos sao obrigatorios.");
        }
    }

    private void validarDuplicidade(String email, String matricula, Long idIgnorado) {
        boolean emailDuplicado = alunos.stream()
                .filter(aluno -> idIgnorado == null || !aluno.getId().equals(idIgnorado))
                .anyMatch(aluno -> aluno.getEmail().equalsIgnoreCase(email));
        if (emailDuplicado) {
            throw new IllegalArgumentException("Ja existe aluno com esse e-mail.");
        }

        boolean matriculaDuplicada = alunos.stream()
                .filter(aluno -> idIgnorado == null || !aluno.getId().equals(idIgnorado))
                .anyMatch(aluno -> aluno.getMatricula().equalsIgnoreCase(matricula));
        if (matriculaDuplicada) {
            throw new IllegalArgumentException("Ja existe aluno com essa matricula.");
        }
    }

    private boolean isBlank(String valor) {
        return valor == null || valor.isBlank();
    }
}
