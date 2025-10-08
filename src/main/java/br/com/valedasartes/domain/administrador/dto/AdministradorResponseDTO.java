package br.com.valedasartes.domain.administrador.dto;

import br.com.valedasartes.domain.administrador.Administrador;

public class AdministradorResponseDTO {

    private final Long id;
    private final String nome;
    private final String cpf;
    private final String telefone;
    private final String email;

    public AdministradorResponseDTO(Administrador admin) {
        this.id = admin.getId();
        this.nome = admin.getNome();
        this.cpf = admin.getCpf();
        this.telefone = admin.getTelefone();

        if (admin.getCredencial() != null) {
            this.email = admin.getCredencial().getEmail();
        } else {
            this.email = null;
        }
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCpf() { return cpf; }
    public String getTelefone() { return telefone; }
    public String getEmail() { return email; }
}
