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
        dados.put("perfil", perfilService.resolverPerfil(uid, email));

        return dados;
    }

    @GetMapping("/api/aluno/perfil")
    public AlunoPerfilModel getPerfilAluno(HttpServletRequest request) {
        String uid = lerUid(request);
        String email = lerEmail(request);
        return alunoService.buscarPerfil(uid, email);
    }

    @GetMapping("/api/aluno/resumo")
    public AlunoResumoModel getResumoAluno(HttpServletRequest request) {
        return alunoService.buscarResumo(lerUid(request), lerEmail(request));
    }

    @GetMapping("/api/aluno/atividades/recentes")
    public List<AlunoAtividadeModel> listarRecentes(HttpServletRequest request) {
        return alunoService.listarRecentes(3, lerUid(request), lerEmail(request));
    }

    @GetMapping("/api/aluno/atividades")
    public List<AlunoAtividadeModel> listarHistorico(HttpServletRequest request) {
        return alunoService.listarHistorico(lerUid(request), lerEmail(request));
    }

    @PostMapping("/api/aluno/atividades")
    public ResponseEntity<AlunoAtividadeModel> submeterAtividade(
            HttpServletRequest request,
            @RequestBody AlunoSubmissaoRequestModel payload) {
        String uid = lerUid(request);
        String email = lerEmail(request);
        AlunoAtividadeModel atividadeCriada = alunoService.submeterAtividade(payload, uid, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(atividadeCriada);
    }

    private String lerUid(HttpServletRequest request) {
        String uid = (String) request.getAttribute("uid");
        return uid == null ? "" : uid;
    }

    private String lerEmail(HttpServletRequest request) {
        String email = (String) request.getAttribute("email");
        return email == null ? "" : email;
    }
}