// Aguarda o HTML estar 100% carregado antes de executar o script
document.addEventListener("DOMContentLoaded", function() {

    // (O topo do arquivo, seletores, toggleCamposArtesao, e formLogin... tudo igual)
    // ...
    const formLogin = document.getElementById("form-login");
    const formCadastro = document.getElementById("form-cadastro");
    const radioCliente = document.getElementById("tipo-cliente");
    const radioArtesao = document.getElementById("tipo-artesao");
    const camposArtesao = document.getElementById("campos-artesao");

    function toggleCamposArtesao() {
        if (radioArtesao.checked) {
            camposArtesao.style.display = "block"; 
        } else {
            camposArtesao.style.display = "none";
        }
    }
    if (radioCliente && radioArtesao) {
        radioCliente.addEventListener('change', toggleCamposArtesao);
        radioArtesao.addEventListener('change', toggleCamposArtesao);
    }

    if (formLogin) {
        formLogin.addEventListener("submit", async function(event) {
            event.preventDefault(); 
            const loginData = {
                email: document.getElementById("login-email").value,
                senha: document.getElementById("login-senha").value
            };
            
            console.log("Enviando dados de Login:", loginData);

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(loginData)
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Login bem-sucedido!", data);
                    localStorage.setItem('userToken', data.token);
                    localStorage.setItem('userRole', data.role);
                    localStorage.setItem('userId', data.userId);
                    
                    alert("Login realizado com sucesso! Redirecionando...");

                    if (data.role === 'ROLE_CLIENTE') {
                        window.location.href = 'dashboard-cliente.html';
                    } else if (data.role === 'ROLE_ARTISTA') {
                        window.location.href = 'dashboard-artesao.html';
                    } else if (data.role === 'ROLE_ADMIN') {
                        window.location.href = 'dashboard-admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    const errorData = await response.text(); 
                    console.error("Erro no login:", response.status, errorData);
                    alert("Erro no login: " + errorData);
                }
            } catch (error) {
                console.error("Erro de rede:", error);
                alert("Não foi possível conectar ao servidor. Tente novamente.");
            }
        });
    }
    // ...

    // (A lógica de 'formCadastro' continua a mesma)
    if (formCadastro) {
        formCadastro.addEventListener("submit", async function(event) {
            event.preventDefault();
            const formData = new FormData(formCadastro);
            const dadosFormulario = Object.fromEntries(formData.entries());
            
            // A mudança está na função chamada abaixo
            const { url, payload } = construirPayloadCadastro(dadosFormulario);

            console.log("Enviando cadastro para:", url);
            console.log("Payload (JSON) a ser enviado:", payload);

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert("Cadastro realizado com sucesso! Você já pode fazer o login.");
                    window.location.href = 'login.html'; 
                } else {
                    // (A linha 100 que deu o erro)
                    const errorData = await response.json(); 
                    console.error("Erro no cadastro:", response.status, errorData);
                    alert(`Erro no cadastro: ${errorData.message || 'Verifique os dados.'}`);
                }
            } catch (error) {
                console.error("Erro de rede no cadastro:", error);
                alert("Não foi possível conectar ao servidor. Tente novamente.");
            }
        });
    }

    /**
     * Função auxiliar para transformar os dados planos do formulário
     * no JSON aninhado que os DTOs do back-end esperam.
     */
    function construirPayloadCadastro(dados) {
        const credencial = {
            email: dados.email,
            senha: dados.senha
        };
        const endereco = {
            logradouro: dados.logradouro,
            numero: parseInt(dados.numero) || 0,
            complemento: dados.complemento || null, // Também é bom enviar nulo
            bairro: dados.bairro,
            cidade: dados.cidade,
            estado: dados.estado,
            cep: dados.cep,
            telefone: dados.telefoneEndereco
        };
        let payload;
        let url;
        if (dados.tipoConta === 'cliente') {
            url = '/api/clientes';
            payload = {
                nome: dados.nome,
                cpf: dados.cpf,
                telefone: dados.telefone,
                credencial: credencial,
                endereco: endereco
            };
        } else { // 'artesao'
            url = '/api/artistas';
            payload = {
                nome: dados.nome,
                cpf: dados.cpf,
                telefone: dados.telefone,
                
                // --- A CORREÇÃO ESTÁ AQUI ---
                // Se o campo estiver vazio (""), envie 'null'.
                nomeEmpresa: dados.nome_empresa || null,
                cnpj: dados.cnpj || null, // <-- ISSO CONSERTA O BUG
                
                credencial: credencial,
                endereco: endereco
            };
        }
        return { url, payload };
    }
});