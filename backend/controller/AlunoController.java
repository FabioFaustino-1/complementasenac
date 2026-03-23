package com.complementasenac.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AlunoController {

    @GetMapping("/api/teste")
    public String teste() {
        return "Backend funcionando!";
    }
}