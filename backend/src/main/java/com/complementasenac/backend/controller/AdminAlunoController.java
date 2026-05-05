package com.complementasenac.backend.controller;

import com.complementasenac.backend.model.AlunoAdminModel;
import com.complementasenac.backend.service.AdminAlunoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/alunos")
public class AdminAlunoController {
    private final AdminAlunoService adminAlunoService;

    public AdminAlunoController(AdminAlunoService adminAlunoService) {
        this.adminAlunoService = adminAlunoService;
    }

    @GetMapping
    public List<AlunoAdminModel> listar() {
        return adminAlunoService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlunoAdminModel> buscarPorId(@PathVariable String id) {
        return adminAlunoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AlunoAdminModel> criar(@RequestBody AlunoAdminModel aluno) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminAlunoService.criar(
            aluno.getNome(),
            aluno.getEmail(),
            aluno.getMatricula(),
            aluno.getCurso()
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlunoAdminModel> atualizar(@PathVariable String id, @RequestBody AlunoAdminModel aluno) {
        return adminAlunoService.atualizar(
                id,
                aluno.getNome(),
                aluno.getEmail(),
                aluno.getMatricula(),
                aluno.getCurso()
        ).map(ResponseEntity::ok)
         .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable String id) {
        if (adminAlunoService.remover(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
