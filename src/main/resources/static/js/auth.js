/**
 * js/auth.js
 * (VERSÃO FINAL - CORRIGIDA COM URL DO BACKEND)
 */

document.addEventListener("DOMContentLoaded", function() {

    // ============================================================
    // 0. CONFIGURAÇÃO DA API (Aponta para o Java)
    // ============================================================
    const API_BASE_URL = "http://localhost:8080"; // <--- AQUI ESTÁ A CORREÇÃO

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
    const radioCliente = document.getElementById("radio-cliente"); 
    const radioArtesao = document.getElementById("radio-artesao"); 
    const extraArtesao = document.getElementById("extra-artesao"); 
    const tituloCadastro = document.getElementById("titulo-cadastro");

    // Inicialização: Mostra Login
    if(viewSelection) viewSelection.style.display = 'none';
    if(viewCadastro) viewCadastro.style.display = 'none';

    // ============================================================
    // 2. FUNÇÕES DE UX (Troca de Telas)
    // ============================================================
    function showView(viewId) {
        [viewLogin, viewSelection, viewCadastro].forEach(v => {
            if(v) {
                v.classList.remove('active');
                setTimeout(() => { if(!v.classList.contains('active')) v.style.display = 'none'; }, 400);
            }
        });

        const target = document.getElementById(viewId);
        if(target) {
            target.style.display = 'flex';
            setTimeout(() => target.classList.add('active'), 50);
        }
    }

    if(btnIrCadastro) btnIrCadastro.addEventListener('click', (e) => { e.preventDefault(); showView('view-selection'); });
    if(btnVoltarLoginSel) btnVoltarLoginSel.addEventListener('click', (e) => { e.preventDefault(); showView('view-login'); });
    if(btnVoltarSelecao) btnVoltarSelecao.addEventListener('click', (e) => { e.preventDefault(); showView('view-selection'); });

    document.addEventListener('roleSelected', (e) => {
        const role = e.detail; 
        
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
    
        // ✅ CORREÇÃO: Garante o uso da URL completa (localhost:8080)
        const urlCompleta = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

        const response = await fetch(urlCompleta, config);
    
        if (!response.ok) {
            // ✅ LEITURA SEGURA (Evita erro de stream)
            const rawBody = await response.text();
            let errorData;

            try {
                errorData = JSON.parse(rawBody);
            } catch (e) {
                errorData = rawBody;
            }

            const errorMessage = (typeof errorData === 'object' && errorData.message)
                ? errorData.message 
                : (errorData || `Erro ${response.status}`);
                
            throw new Error(errorMessage);
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
                // ✅ Atualizado para usar API_BASE_URL
                const response = await fetch(`${API_BASE_URL}/api/carrinhos/${existingCartId}`, {
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
            // ✅ Atualizado para usar API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/carrinhos/cliente/${clienteId}`, {
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
            
            const email = document.getElementById("login-email").value;
            const senha = document.getElementById("login-senha").value;
            
            try {
                // Agora chama localhost:8080 automaticamente
                const data = await apiFetch('/api/auth/login', 'POST', { email, senha });
                
                localStorage.setItem('userToken', data.token); 
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userId', data.userId);
                
                console.log("Login OK. Role:", data.role);
                alert("Login realizado com sucesso!");

                if (data.role === 'ROLE_CLIENTE') {
                    try {
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
            
            const formData = new FormData(formCadastro);
            const dadosFormulario = Object.fromEntries(formData.entries());
            
            if (!dadosFormulario.tipoConta) {
                dadosFormulario.tipoConta = radioCliente.checked ? 'cliente' : 'artesao';
            }

            const { url, payload } = construirPayloadCadastro(dadosFormulario);

            console.log("Enviando cadastro...", payload);

            try {
                await apiFetch(url, 'POST', payload);
                alert("Cadastro realizado! Faça login.");
                formCadastro.reset(); 
                showView('view-login'); 

            } catch (error) {
                alert(`Erro no cadastro: ${error.message}`);
            }
        });
    }

    function construirPayloadCadastro(dados) {
        const credencial = {
            email: dados.email,
            senha: dados.senha
        };
        
        const numeroEndereco = parseInt(dados.numero) || 0;

        const endereco = {
            logradouro: dados.logradouro,
            numero: numeroEndereco,
            complemento: dados.complemento || null, 
            bairro: dados.bairro,
            cidade: dados.cidade,
            estado: dados.estado,
            cep: dados.cep,
            telefone: dados.telefoneEndereco || dados.telefone
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
                nomeEmpresa: dados.nomeEmpresa || dados.nome_empresa || null,
                cnpj: dados.cnpj || null, 
                credencial: credencial,
                endereco: endereco
            };
        }
        return { url, payload };
    }

});