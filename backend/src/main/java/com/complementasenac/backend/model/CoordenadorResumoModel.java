package com.complementasenac.backend.model;

public class CoordenadorResumoModel {
    private int pendentes;
    private int aprovadasNoMes;
    private int rejeitadasNoMes;
    private int alunosAtivos;
    private int taxaAprovacao;

    public int getPendentes() {
        return pendentes;
    }

    public void setPendentes(int pendentes) {
        this.pendentes = pendentes;
    }

    public int getAprovadasNoMes() {
        return aprovadasNoMes;
    }

    public void setAprovadasNoMes(int aprovadasNoMes) {
        this.aprovadasNoMes = aprovadasNoMes;
    }

    public int getRejeitadasNoMes() {
        return rejeitadasNoMes;
    }

    public void setRejeitadasNoMes(int rejeitadasNoMes) {
        this.rejeitadasNoMes = rejeitadasNoMes;
    }

    public int getAlunosAtivos() {
        return alunosAtivos;
    }

    public void setAlunosAtivos(int alunosAtivos) {
        this.alunosAtivos = alunosAtivos;
    }

    public int getTaxaAprovacao() {
        return taxaAprovacao;
    }

    public void setTaxaAprovacao(int taxaAprovacao) {
        this.taxaAprovacao = taxaAprovacao;
    }
}
