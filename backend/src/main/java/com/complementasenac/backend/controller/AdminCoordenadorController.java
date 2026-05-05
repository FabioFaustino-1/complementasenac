package com.complementasenac.backend.controller;

import com.complementasenac.backend.model.CoordenadorAdminModel;
import com.complementasenac.backend.service.AdminCoordenadorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coordenadores")
public class AdminCoordenadorController {
    private final AdminCoordenadorService service;

    public AdminCoordenadorController(AdminCoordenadorService service) {
        this.service = service;
    }

    @GetMapping
    public List<CoordenadorAdminModel> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoordenadorAdminModel> buscarPorId(@PathVariable String id) {
        return service.buscarPorId(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CoordenadorAdminModel> criar(@RequestBody CoordenadorAdminModel coordenador) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(coordenador));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CoordenadorAdminModel> atualizar(@PathVariable String id, @RequestBody CoordenadorAdminModel coordenador) {
        return service.atualizar(id, coordenador).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable String id) {
        if (service.remover(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
