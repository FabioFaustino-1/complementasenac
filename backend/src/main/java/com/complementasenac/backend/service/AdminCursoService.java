package com.complementasenac.backend.service;

import com.complementasenac.backend.model.CursoModel;
import com.google.cloud.firestore.DocumentSnapshot;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminCursoService {
    private final FirestoreService firestoreService;

    public AdminCursoService(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    public List<CursoModel> listar() {
        return firestoreService.listarCursos().stream().map(this::paraModel).toList();
    }

    public Optional<CursoModel> buscarPorId(String idCurso) {
        return firestoreService.buscarCurso(idCurso).map(this::paraModel);
    }

    public CursoModel criar(CursoModel curso) {
        validar(curso);
        String idCurso = curso.getIdCurso().trim();
        firestoreService.salvarCurso(idCurso, payload(curso));
        return buscarPorId(idCurso).orElseThrow();
    }

    public Optional<CursoModel> atualizar(String idCurso, CursoModel curso) {
        validar(curso);
        if (buscarPorId(idCurso).isEmpty()) {
            return Optional.empty();
        }
        curso.setIdCurso(idCurso);
        firestoreService.salvarCurso(idCurso, payload(curso));
        return buscarPorId(idCurso);
    }

    private Map<String, Object> payload(CursoModel curso) {
        Map<String, Object> data = new HashMap<>();
        data.put("id_curso", curso.getIdCurso().trim());
        data.put("nome_curso", curso.getNomeCurso().trim());
        data.put("eixo_tecnologico", curso.getEixoTecnologico() == null ? "" : curso.getEixoTecnologico().trim());
        return data;
    }

    private CursoModel paraModel(DocumentSnapshot doc) {
        CursoModel model = new CursoModel();
        model.setIdCurso(textoOuPadrao(doc.getString("id_curso"), doc.getId()));
        model.setNomeCurso(textoOuPadrao(doc.getString("nome_curso"), doc.getString("nome")));
        model.setEixoTecnologico(textoOuPadrao(doc.getString("eixo_tecnologico"), doc.getString("eixo")));
        return model;
    }

    private void validar(CursoModel curso) {
        if (curso == null || isBlank(curso.getIdCurso()) || isBlank(curso.getNomeCurso())) {
            throw new IllegalArgumentException("idCurso e nomeCurso sao obrigatorios.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String textoOuPadrao(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
