package com.complementasenac.backend.controller;

import com.complementasenac.backend.model.AlunoAtividadeModel;
import com.complementasenac.backend.model.AlunoPerfilModel;
import com.complementasenac.backend.model.AlunoResumoModel;
import com.complementasenac.backend.model.AlunoSubmissaoRequestModel;
import com.complementasenac.backend.service.AlunoService;
import com.complementasenac.backend.service.PerfilService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class AlunoController {
    private final PerfilService perfilService;
    private final AlunoService alunoService;

    public AlunoController(PerfilService perfilService, AlunoService alunoService) {
        this.perfilService = perfilService;
        this.alunoService = alunoService;
    }

    @GetMapping("/api/usuario")
    public Map<String, String> getUsuario(HttpServletRequest request) {
        
        String uid = (String) request.getAttribute("uid");
        String email = (String) request.getAttribute("email");
        
        Map<String, String> dados = new HashMap<>();
        dados.put("uid", uid);
        dados.put("email", email);
        dados.put("perfil", perfilService.resolverPerfil(email));

        return dados;
    }

    @GetMapping("/api/aluno/perfil")
    public AlunoPerfilModel getPerfilAluno(HttpServletRequest request) {
        String uid = lerUid(request);
        String email = lerEmail(request);
        return alunoService.buscarPerfil(uid, email);
    }

    @GetMapping("/api/aluno/resumo")
    public AlunoResumoModel getResumoAluno() {
        return alunoService.buscarResumo();
    }

    @GetMapping("/api/aluno/atividades/recentes")
    public List<AlunoAtividadeModel> listarRecentes() {
        return alunoService.listarRecentes(3);
    }

    @GetMapping("/api/aluno/atividades")
    public List<AlunoAtividadeModel> listarHistorico() {
        return alunoService.listarHistorico();
    }

    @PostMapping("/api/aluno/atividades")
    public ResponseEntity<AlunoAtividadeModel> submeterAtividade(@RequestBody AlunoSubmissaoRequestModel payload) {
        AlunoAtividadeModel atividadeCriada = alunoService.submeterAtividade(payload);
        return ResponseEntity.status(HttpStatus.CREATED).body(atividadeCriada);
    }

    private String lerUid(HttpServletRequest request) {
        String uid = (String) request.getAttribute("uid");
        if (uid == null || uid.isBlank()) {
            return "uid-local";
        }
        return uid;
    }

    private String lerEmail(HttpServletRequest request) {
        String email = (String) request.getAttribute("email");
        if (email == null || email.isBlank()) {
            return "aluno@edu.pe.senac.br";
        }
        return email;
    }
}