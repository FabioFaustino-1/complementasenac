package com.complementasenac.backend.controller;

import com.complementasenac.backend.model.CursoModel;
import com.complementasenac.backend.service.AdminCursoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cursos")
public class AdminCursoController {
    private final AdminCursoService service;

    public AdminCursoController(AdminCursoService service) {
        this.service = service;
    }

    @GetMapping
    public List<CursoModel> listar() {
        return service.listar();
    }

    @GetMapping("/{idCurso}")
    public ResponseEntity<CursoModel> buscar(@PathVariable String idCurso) {
        return service.buscarPorId(idCurso).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CursoModel> criar(@RequestBody CursoModel curso) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(curso));
    }

    @PutMapping("/{idCurso}")
    public ResponseEntity<CursoModel> atualizar(@PathVariable String idCurso, @RequestBody CursoModel curso) {
        return service.atualizar(idCurso, curso).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
