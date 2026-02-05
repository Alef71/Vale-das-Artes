package br.com.valedasartes.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.com.valedasartes.domain.administrador.Administrador;
import br.com.valedasartes.domain.administrador.repository.AdministradorRepository;
import br.com.valedasartes.domain.endereco.Endereco;
import br.com.valedasartes.domain.security.Credencial;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final AdministradorRepository administradorRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(AdministradorRepository administradorRepository, 
                           PasswordEncoder passwordEncoder) {
        this.administradorRepository = administradorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        
        String cpfAdmin = "07934307632"; 

        if (administradorRepository.findByCpf(cpfAdmin).isEmpty()) {
            
            System.out.println(">>> INICIANDO CRIAÇÃO DO ADMIN <<<");

            // 1. Instanciar Credencial (NÃO SALVAR AINDA)
            Credencial credencial = new Credencial();
            credencial.setEmail("Admin.VDA@hotmail.com");
            credencial.setSenha(passwordEncoder.encode("Afra-1993")); 

            // 2. Instanciar Endereço (NÃO SALVAR AINDA)
            Endereco endereco = new Endereco();
            endereco.setLogradouro("Av JK");
            endereco.setNumero(681);
            endereco.setComplemento("casa");
            endereco.setBairro("Planaltinho");
            endereco.setCidade("Berilo");
            endereco.setEstado("MG");
            endereco.setCep("39640000");
            endereco.setTelefone("33999026412");

            // 3. Criar Admin e associar tudo
            Administrador admin = new Administrador();
            admin.setNome("Admin-Vale das Artes");
            admin.setCpf(cpfAdmin);
            admin.setTelefone("33999026412");
            
            // Relacionamentos
            admin.setCredencial(credencial);
            admin.setEndereco(endereco);

            // 4. SALVAR APENAS O PAI (O Cascade salvará os filhos)
            administradorRepository.save(admin);

            System.out.println("---------------------------------------------");
            System.out.println(" LOG: ADMINISTRADOR CRIADO COM SUCESSO!");
            System.out.println(" Login: Admin.VDA@hotmail.com");
            System.out.println(" Senha: Afra-1993");
            System.out.println("---------------------------------------------");
        }
    }
}