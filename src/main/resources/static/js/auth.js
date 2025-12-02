/**
 * js/auth.js
 * (VERSÃO HÍBRIDA FINAL)
 * 1. UX: Navegação entre telas (Login -> Seleção -> Cadastro).
 * 2. Lógica: Gerenciamento robusto de Carrinho (ensureActiveCart) e API.
 * 3. Dados: Coleta via FormData para cadastro limpo.
 */

document.addEventListener("DOMContentLoaded", function() {

    // ============================================================
    // 1. SELETORES DE NAVEGAÇÃO (UX)
    // ============================================================
    const viewLogin = document.getElementById("view-login");
    const viewSelection = document.getElementById("view-selection");
    const viewCadastro = document.getElementById("view-cadastro");

    // Botões de Navegação
    const btnIrCadastro = document.getElementById("btn-ir-cadastro");
    const btnVoltarLoginSel = document.getElementById("btn-voltar-login-sel");
    const btnVoltarSelecao = document.getElementById("btn-voltar-selecao");

    // Elementos do Cadastro
    const formLogin = document.getElementById("form-login");
    const formCadastro = document.getElementById("form-cadastro");
    const radioCliente = document.getElementById("radio-cliente"); // Radio oculto ou visível no form
    const radioArtesao = document.getElementById("radio-artesao"); // Radio oculto ou visível no form
    const extraArtesao = document.getElementById("extra-artesao"); // Div com campos extras
    const tituloCadastro = document.getElementById("titulo-cadastro");

    // Inicialização: Mostra Login
    if(viewSelection) viewSelection.style.display = 'none';
    if(viewCadastro) viewCadastro.style.display = 'none';

    // ============================================================
    // 2. FUNÇÕES DE UX (Troca de Telas)
    // ============================================================
    function showView(viewId) {
        // Esconde todos
        [viewLogin, viewSelection, viewCadastro].forEach(v => {
            if(v) {
                v.classList.remove('active');
                setTimeout(() => { if(!v.classList.contains('active')) v.style.display = 'none'; }, 400);
            }
        });

        // Mostra o alvo
        const target = document.getElementById(viewId);
        if(target) {
            target.style.display = 'flex';
            setTimeout(() => target.classList.add('active'), 50);
        }
    }

    // Eventos de Navegação
    if(btnIrCadastro) btnIrCadastro.addEventListener('click', (e) => { e.preventDefault(); showView('view-selection'); });
    if(btnVoltarLoginSel) btnVoltarLoginSel.addEventListener('click', (e) => { e.preventDefault(); showView('view-login'); });
    if(btnVoltarSelecao) btnVoltarSelecao.addEventListener('click', (e) => { e.preventDefault(); showView('view-selection'); });

    // Lógica de Seleção de Perfil (Disparada pelo HTML da tela de seleção)
    document.addEventListener('roleSelected', (e) => {
        const role = e.detail; // 'cliente' ou 'artesao'
        
        if (role === 'cliente') {
            if(radioCliente) radioCliente.checked = true;
            if(extraArtesao) extraArtesao.style.display = 'none';
            if(tituloCadastro) tituloCadastro.innerText = "Cadastro de Cliente";
        } else {
            if(radioArtesao) radioArtesao.checked = true;
            if(extraArtesao) extraArtesao.style.display = 'block';
            if(tituloCadastro) tituloCadastro.innerText = "Cadastro de Artesão";
        }
        
        showView('view-cadastro');
        if(viewCadastro) viewCadastro.scrollTop = 0;
    });

    // ============================================================
    // 3. API HELPERS (Fetch e Carrinho)
    // ============================================================
    
    // Helper genérico de Fetch
    async function apiFetch(endpoint, method = 'POST', body = null) {
        const token = localStorage.getItem('userToken');
        
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
    
        const config = { method: method, headers: headers };
        if (body) config.body = JSON.stringify(body);
    
        const response = await fetch(endpoint, config);
    
        if (!response.ok) {
            let errorData;
            try { errorData = await response.json(); } catch (e) { errorData = await response.text(); }
            throw new Error(errorData.message || errorData || `Erro ${response.status}`);
        }
        
        if (response.status === 204) return null;
        return await response.json();
    }

    // LÓGICA VITAL: Garantir Carrinho Ativo
    async function ensureActiveCart(clienteId, token) {
        console.log("Verificando carrinho para cliente:", clienteId);
        const existingCartId = localStorage.getItem('carrinhoId');

        // 1. Tenta validar carrinho existente
        if (existingCartId) {
            try {
                const response = await fetch(`/api/carrinhos/${existingCartId}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const carrinhoDTO = await response.json();
                    if (carrinhoDTO.clienteId.toString() === clienteId) {
                        return carrinhoDTO; // Carrinho válido
                    }
                }
            } catch (error) {
                console.warn("Erro ao validar carrinho antigo, criando novo...", error);
            }
        }

        // 2. Cria novo carrinho se necessário
        try {
            const response = await fetch(`/api/carrinhos/cliente/${clienteId}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                }
            });

            if (!response.ok) throw new Error('Falha ao criar carrinho');
            return await response.json();
        } catch (error) {
            console.error("Erro crítico no carrinho:", error);
            throw error;
        }
    }

    // ============================================================
    // 4. LÓGICA DE LOGIN
    // ============================================================
    if (formLogin) {
        formLogin.addEventListener("submit", async function(event) {
            event.preventDefault(); 
            
            // Pega dados baseados nos IDs do seu HTML de Login
            const email = document.getElementById("login-email").value;
            const senha = document.getElementById("login-senha").value;
            
            try {
                // 1. Login na API
                const data = await apiFetch('/api/auth/login', 'POST', { email, senha });
                
                // 2. Salva Tokens
                localStorage.setItem('userToken', data.token); 
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userId', data.userId);
                
                console.log("Login OK. Role:", data.role);
                alert("Login realizado com sucesso!");

                // 3. Verifica Role e Redireciona
                if (data.role === 'ROLE_CLIENTE') {
                    try {
                        // Lógica do Carrinho antes de redirecionar
                        const carrinho = await ensureActiveCart(data.userId.toString(), data.token);
                        if (carrinho && carrinho.id) {
                            localStorage.setItem('carrinhoId', carrinho.id);
                        }
                        window.location.href = 'dashboard-cliente.html';
                    } catch (cartError) {
                        alert("Login feito, mas houve erro no carrinho. Tente recarregar.");
                        window.location.href = 'dashboard-cliente.html';
                    }
                } else if (data.role === 'ROLE_ARTISTA') {
                    window.location.href = 'dashboard-artesao.html';
                } else if (data.role === 'ROLE_ADMIN') {
                    window.location.href = 'dashboard-admin.html';
                } else {
                    window.location.href = 'index.html';
                }

            } catch (error) {
                console.error("Erro Login:", error);
                alert("Erro no login: " + error.message);
            }
        });
    }

    // ============================================================
    // 5. LÓGICA DE CADASTRO
    // ============================================================
    if (formCadastro) {
        formCadastro.addEventListener("submit", async function(event) {
            event.preventDefault();
            
            // Usa FormData para capturar todos os inputs com name="..."
            const formData = new FormData(formCadastro);
            const dadosFormulario = Object.fromEntries(formData.entries());
            
            // Detecta tipo de conta (se o radio button não estiver no formData, forçamos a lógica)
            // Se o seu HTML usa name="tipoConta" nos radios, o 'dadosFormulario' já terá o valor.
            // Caso contrário, injetamos manualmente baseando-se na UI:
            if (!dadosFormulario.tipoConta) {
                dadosFormulario.tipoConta = radioCliente.checked ? 'cliente' : 'artesao';
            }

            const { url, payload } = construirPayloadCadastro(dadosFormulario);

            console.log("Enviando cadastro...", payload);

            try {
                await apiFetch(url, 'POST', payload);
                alert("Cadastro realizado! Faça login.");
                formCadastro.reset(); 
                showView('view-login'); // Volta para tela de login (UX)

            } catch (error) {
                alert(`Erro no cadastro: ${error.message}`);
            }
        });
    }

    // Helper para montar o JSON correto do cadastro
    function construirPayloadCadastro(dados) {
        const credencial = {
            email: dados.email,
            senha: dados.senha
        };
        
        // Garante numéricos
        const numeroEndereco = parseInt(dados.numero) || 0;

        const endereco = {
            logradouro: dados.logradouro,
            numero: numeroEndereco,
            complemento: dados.complemento || null, 
            bairro: dados.bairro,
            cidade: dados.cidade,
            estado: dados.estado,
            cep: dados.cep,
            telefone: dados.telefoneEndereco || dados.telefone // Fallback
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
        } else { // artesao
            url = '/api/artistas';
            payload = {
                nome: dados.nome, 
                cpf: dados.cpf,   
                telefone: dados.telefone, 
                nomeEmpresa: dados.nomeEmpresa || dados.nome_empresa || null, // Aceita ambos os nomes
                cnpj: dados.cnpj || null, 
                credencial: credencial,
                endereco: endereco
            };
        }
        return { url, payload };
    }

});