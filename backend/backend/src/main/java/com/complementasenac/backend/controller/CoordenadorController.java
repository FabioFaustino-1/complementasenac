package com.complementasenac.backend.controller;

import com.complementasenac.backend.model.AtividadeCoordenadorModel;
import com.complementasenac.backend.model.CoordenadorPerfilModel;
import com.complementasenac.backend.model.CoordenadorResumoModel;
import com.complementasenac.backend.model.AlunoAdminModel;
import com.complementasenac.backend.service.AdminAlunoService;
import com.complementasenac.backend.service.CoordenadorService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coordenador")
public class CoordenadorController {

    private final CoordenadorService coordenadorService;
    private final AdminAlunoService adminAlunoService;

    public CoordenadorController(CoordenadorService coordenadorService, AdminAlunoService adminAlunoService) {
        this.coordenadorService = coordenadorService;
        this.adminAlunoService = adminAlunoService;
    }

    @GetMapping("/atividades")
    public List<AtividadeCoordenadorModel> listarPendentes() {
        return coordenadorService.listarPendentes();
    }

    @GetMapping("/atividades/todas")
    public List<AtividadeCoordenadorModel> listarTodas() {
        return coordenadorService.listarTodas();
    }

    @PostMapping("/atividades/{id}/decisao")
    public ResponseEntity<?> decidirAtividade(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.getOrDefault("status", "PENDENTE").toUpperCase();
        return coordenadorService.decidir(id, status)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/resumo")
    public CoordenadorResumoModel resumo() {
        return coordenadorService.resumo();
    }

    @GetMapping("/perfil")
    public CoordenadorPerfilModel perfil(HttpServletRequest request) {
        String uid = (String) request.getAttribute("uid");
        String email = (String) request.getAttribute("email");
        if (uid == null || uid.isBlank()) {
            uid = "uid-coordenador-local";
        }
        if (email == null || email.isBlank()) {
            email = "coordenador@senac.pe.br";
        }
        return coordenadorService.perfil(uid, email);
    }

    @GetMapping("/alunos")
    public List<AlunoAdminModel> listarAlunos() {
        return adminAlunoService.listar();
    }
}
