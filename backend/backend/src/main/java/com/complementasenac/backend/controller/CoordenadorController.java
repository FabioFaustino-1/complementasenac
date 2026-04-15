package com.complementasenac.backend.controller;

import com.complementasenac.backend.model.AtividadeCoordenadorModel;
import com.complementasenac.backend.service.CoordenadorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coordenador")
public class CoordenadorController {

    private final CoordenadorService coordenadorService;

    public CoordenadorController(CoordenadorService coordenadorService) {
        this.coordenadorService = coordenadorService;
    }

    @GetMapping("/atividades")
    public List<AtividadeCoordenadorModel> listarPendentes() {
        return coordenadorService.listarPendentes();
    }

    @PostMapping("/atividades/{id}/decisao")
    public ResponseEntity<?> decidirAtividade(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.getOrDefault("status", "PENDENTE").toUpperCase();
        return coordenadorService.decidir(id, status)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
