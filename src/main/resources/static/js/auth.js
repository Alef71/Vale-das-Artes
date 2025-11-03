/**
 * js/auth.js
 * (VERSÃO ATUALIZADA)
 * * Corrigido para salvar 'userToken' (em vez de 'authToken')
 * para ser compatível com o 'dashboard-cliente.js'.
 * * Mantém a lógica 'ensureActiveCart' para o carrinho.
 * * Redireciona o cliente para 'dashboard-cliente.html'.
 */
document.addEventListener("DOMContentLoaded", function() {

    // --- SELETORES DO DOM ---
    const formLogin = document.getElementById("form-login");
    const formCadastro = document.getElementById("form-cadastro");
    const radioCliente = document.getElementById("tipo-cliente");
    const radioArtesao = document.getElementById("tipo-artesao");
    const camposArtesao = document.getElementById("campos-artesao");

    // --- FUNÇÃO HELPER: API Fetch ---
    async function apiFetch(endpoint, method = 'POST', body = null) {
        // --- CORREÇÃO AQUI ---
        // Lê 'userToken' em vez de 'authToken'
        const token = localStorage.getItem('userToken'); 
        
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    
        const config = {
            method: method,
            headers: headers
        };
    
        if (body) {
            config.body = JSON.stringify(body);
        }
    
        const response = await fetch(endpoint, config);
    
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json(); 
            } catch (e) {
                errorData = await response.text(); 
            }
            console.error(`Erro na API [${method} ${endpoint}]:`, response.status, errorData);
            throw new Error(errorData.message || errorData || `Erro ${response.status}`);
        }
        
        if (response.status === 204) {
            return null; // Sem conteúdo
        }
        
        return await response.json(); // Sucesso
    }

    // --- LÓGICA DE CADASTRO (Alternar Campos) ---
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

    // --- SUBMISSÃO DO FORMULÁRIO DE LOGIN ---
    if (formLogin) {
        formLogin.addEventListener("submit", async function(event) {
            event.preventDefault(); 
            const loginData = {
                email: document.getElementById("login-email").value,
                senha: document.getElementById("login-senha").value
            };
            
            console.log("Enviando dados de Login:", loginData);

            try {
                // 1. FAZER O LOGIN
                const data = await apiFetch('/api/auth/login', 'POST', loginData);
                // data = { token, role, userId }
                
                console.log("Login bem-sucedido!", data);
                
                // --- INÍCIO DA CORREÇÃO ---
                // 2. SALVAR DADOS DA SESSÃO (COM AS CHAVES CORRETAS)
                // Salva 'userToken' como o 'dashboard-cliente.js' espera
                localStorage.setItem('userToken', data.token); 
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userId', data.userId);
                // --- FIM DA CORREÇÃO ---
                
                alert("Login realizado com sucesso! Preparando sua sessão...");

                // 3. GARANTIR O CARRINHO
                if (data.role === 'ROLE_CLIENTE') {
                    // O 'dashboard-cliente.js' não precisa do 'clienteId',
                    // mas o 'ensureActiveCart' precisa dele (que é o 'userId').
                    // Não precisamos salvar 'clienteId' pois já temos 'userId'.
                    
                    try {
                        const carrinho = await ensureActiveCart(data.userId.toString(), data.token);
                        
                        if (carrinho && carrinho.id) {
                            localStorage.setItem('carrinhoId', carrinho.id); // SUCESSO!
                            console.log("Carrinho ID salvo:", carrinho.id);
                        } else {
                            throw new Error('API não retornou um ID de carrinho válido.');
                        }
                        
                        // 4. REDIRECIONAR O CLIENTE (Corrigido)
                        window.location.href = 'dashboard-cliente.html'; 

                    } catch (cartError) {
                        console.error("Erro crítico ao criar o carrinho:", cartError);
                        alert("Login realizado, mas não foi possível carregar seu carrinho. Tente relogar.");
                        window.location.href = 'index.html'; 
                    }

                } else {
                    // 4. REDIRECIONAR (Para não-clientes)
                    if (data.role === 'ROLE_ARTISTA') {
                        window.location.href = 'dashboard-artesao.html';
                    } else if (data.role === 'ROLE_ADMIN') {
                        window.location.href = 'dashboard-admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }

            } catch (error) {
                console.error("Erro de login:", error);
                alert("Erro no login: " + error.message);
            }
        });
    }

    // A função ensureActiveCart continua a mesma (está correta)
    async function ensureActiveCart(clienteId, token) {
        console.log("Garantindo carrinho para o clienteId:", clienteId);
        const existingCartId = localStorage.getItem('carrinhoId');

        if (existingCartId) {
            console.log("Encontrado carrinhoId salvo:", existingCartId);
            try {
                const response = await fetch(`/api/carrinhos/${existingCartId}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const carrinhoDTO = await response.json();
                    if (carrinhoDTO.clienteId.toString() === clienteId) {
                        console.log("Carrinho salvo é válido e pertence ao cliente.");
                        return carrinhoDTO; 
                    } else {
                        console.warn("Carrinho salvo pertence a outro cliente. Criando um novo.");
                    }
                } else {
                    console.warn("Carrinho salvo não encontrado (404) ou erro. Criando um novo.");
                }
            } catch (error) {
                console.error("Erro ao validar carrinho salvo:", error);
            }
        }

        console.log("Criando novo carrinho para o cliente...");
        try {
            const response = await fetch(`/api/carrinhos/cliente/${clienteId}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('API falhou ao criar novo carrinho.');
            }
            
            const novoCarrinhoDTO = await response.json();
            console.log("Novo carrinho criado:", novoCarrinhoDTO.id);
            return novoCarrinhoDTO;

        } catch (error) {
            console.error("Erro crítico ao criar novo carrinho:", error);
            throw error;
        }
    }


    // --- SUBMISSÃO DO FORMULÁRIO DE CADASTRO (Lógica original mantida) ---
    if (formCadastro) {
        formCadastro.addEventListener("submit", async function(event) {
            event.preventDefault();
            const formData = new FormData(formCadastro);
            const dadosFormulario = Object.fromEntries(formData.entries());
            
            const { url, payload } = construirPayloadCadastro(dadosFormulario);

            console.log("Enviando cadastro para:", url);
            console.log("Payload (JSON) a ser enviado:", payload);

            try {
                await apiFetch(url, 'POST', payload);

                alert("Cadastro realizado com sucesso! Você já pode fazer o login.");
                formCadastro.reset(); 
                document.getElementById('login-container').scrollIntoView();

            } catch (error) {
                alert(`Erro no cadastro: ${error.message}`);
            }
        });
    }

    
    // --- FUNÇÃO HELPER: Construir Payload (Lógica original mantida) ---
    function construirPayloadCadastro(dados) {
        const credencial = {
            email: dados.email,
            senha: dados.senha
        };
        const endereco = {
            logradouro: dados.logradouro,
            numero: parseInt(dados.numero) || 0,
            complemento: dados.complemento || null, 
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
                
                nomeEmpresa: dados.nome_empresa || null,
                cnpj: dados.cnpj || null, 
                
                credencial: credencial,
                endereco: endereco
            };
        }
        return { url, payload };
    }
});