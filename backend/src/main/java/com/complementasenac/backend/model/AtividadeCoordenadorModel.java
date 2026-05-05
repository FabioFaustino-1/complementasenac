package com.complementasenac.backend.model;

public class AtividadeCoordenadorModel {
    private String id;
    private String titulo;
    private String aluno;
    private String tipo;
    private String data;
    private int horas;
    private int confiancaIa;
    private String status;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAluno() {
        return aluno;
    }

    public void setAluno(String aluno) {
        this.aluno = aluno;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public int getHoras() {
        return horas;
    }

    public void setHoras(int horas) {
        this.horas = horas;
    }

    public int getConfiancaIa() {
        return confiancaIa;
    }

    public void setConfiancaIa(int confiancaIa) {
        this.confiancaIa = confiancaIa;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
