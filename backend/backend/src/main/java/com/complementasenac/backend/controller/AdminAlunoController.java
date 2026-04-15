package com.complementasenac.backend.controller;

import com.complementasenac.backend.model.AlunoAdminModel;
import com.complementasenac.backend.service.AdminAlunoService;
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

    @PostMapping
    public AlunoAdminModel criar(@RequestBody AlunoAdminModel aluno) {
        return adminAlunoService.criar(
                aluno.getNome(),
                aluno.getEmail(),
                aluno.getMatricula(),
                aluno.getCurso()
        );
    }
}
