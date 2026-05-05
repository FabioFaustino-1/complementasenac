package com.complementasenac.backend.model;

public class AlunoAtividadeModel {
    private String id;
    private String titulo;
    private String tipo;
    private String categoria;
    private String data;
    private int horas;
    private Integer horasAprovadas;
    private String status;
    private String comprovanteUrl;
    private String justificativaCoordenador;
    /** Nome do aluno (visível na fila do coordenador). */
    private String alunoNome;
    /** E-mail do aluno (filtro de histórico / resumo). */
    private String alunoEmail;

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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
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

    public Integer getHorasAprovadas() {
        return horasAprovadas;
    }

    public void setHorasAprovadas(Integer horasAprovadas) {
        this.horasAprovadas = horasAprovadas;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getComprovanteUrl() {
        return comprovanteUrl;
    }

    public void setComprovanteUrl(String comprovanteUrl) {
        this.comprovanteUrl = comprovanteUrl;
    }

    public String getJustificativaCoordenador() {
        return justificativaCoordenador;
    }

    public void setJustificativaCoordenador(String justificativaCoordenador) {
        this.justificativaCoordenador = justificativaCoordenador;
    }

    public String getAlunoNome() {
        return alunoNome;
    }

    public void setAlunoNome(String alunoNome) {
        this.alunoNome = alunoNome;
    }

    public String getAlunoEmail() {
        return alunoEmail;
    }

    public void setAlunoEmail(String alunoEmail) {
        this.alunoEmail = alunoEmail;
    }
}
