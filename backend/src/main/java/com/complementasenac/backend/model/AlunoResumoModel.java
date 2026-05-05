package com.complementasenac.backend.model;

public class AlunoResumoModel {
    private String curso;
    private int horasConcluidas;
    private int horasNecessarias;
    private int percentualConcluido;
    private int aprovadas;
    private int pendentes;
    private int indeferidas;
    private int totalAtividades;

    public String getCurso() {
        return curso;
    }

    public void setCurso(String curso) {
        this.curso = curso;
    }

    public int getHorasConcluidas() {
        return horasConcluidas;
    }

    public void setHorasConcluidas(int horasConcluidas) {
        this.horasConcluidas = horasConcluidas;
    }

    public int getHorasNecessarias() {
        return horasNecessarias;
    }

    public void setHorasNecessarias(int horasNecessarias) {
        this.horasNecessarias = horasNecessarias;
    }

    public int getPercentualConcluido() {
        return percentualConcluido;
    }

    public void setPercentualConcluido(int percentualConcluido) {
        this.percentualConcluido = percentualConcluido;
    }

    public int getAprovadas() {
        return aprovadas;
    }

    public void setAprovadas(int aprovadas) {
        this.aprovadas = aprovadas;
    }

    public int getPendentes() {
        return pendentes;
    }

    public void setPendentes(int pendentes) {
        this.pendentes = pendentes;
    }

    public int getIndeferidas() {
        return indeferidas;
    }

    public void setIndeferidas(int indeferidas) {
        this.indeferidas = indeferidas;
    }

    public int getTotalAtividades() {
        return totalAtividades;
    }

    public void setTotalAtividades(int totalAtividades) {
        this.totalAtividades = totalAtividades;
    }
}
