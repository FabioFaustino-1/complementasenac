package com.complementasenac.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data // Cria Getters e Setters automaticamente
@AllArgsConstructor // Cria o construtor com todos os campos
@NoArgsConstructor // Cria o construtor vazio
public class StandardError implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long timestamp;    // Hora exata do erro
    private Integer status;     // Código HTTP (Ex: 404 ou 500)
    private String error;       // Nome curto do erro
    private String message;     // Mensagem explicativa para o frontend
    private String path;        // Qual URL (endpoint) gerou o problema
}