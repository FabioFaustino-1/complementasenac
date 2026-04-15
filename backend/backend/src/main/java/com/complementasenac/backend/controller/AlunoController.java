package com.complementasenac.backend.controller;

import com.complementasenac.backend.service.PerfilService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AlunoController {
    private final PerfilService perfilService;

    public AlunoController(PerfilService perfilService) {
        this.perfilService = perfilService;
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
}