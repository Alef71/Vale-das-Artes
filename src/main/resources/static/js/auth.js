/**
 * js/auth.js
 * Gerencia Login e Cadastro corrigido para validação do Endereço
 */

document.addEventListener("DOMContentLoaded", function() {

    const API_BASE_URL = "http://localhost:8080"; 

    // --- SELETORES UX ---
    const viewLogin = document.getElementById("view-login");
    const viewSelection = document.getElementById("view-selection");
    const viewCadastro = document.getElementById("view-cadastro");
    
    const btnIrCadastro = document.getElementById("btn-ir-cadastro");
    const btnVoltarLoginSel = document.getElementById("btn-voltar-login-sel");
    const btnVoltarSelecao = document.getElementById("btn-voltar-selecao");
    
    const formLogin = document.getElementById("form-login");
    const formCadastro = document.getElementById("form-cadastro");
    
    const radioCliente = document.getElementById("radio-cliente"); 
    const radioArtesao = document.getElementById("radio-artesao"); 
    const extraArtesao = document.getElementById("extra-artesao"); 
    const tituloCadastro = document.getElementById("titulo-cadastro");

    // Inicializa Views (esconde cadastro e seleção)
    if(viewSelection) viewSelection.style.display = 'none';
    if(viewCadastro) viewCadastro.style.display = 'none';

    // --- FUNÇÕES DE NAVEGAÇÃO ENTRE TELAS ---
    function showView(viewId) {
        [viewLogin, viewSelection, viewCadastro].forEach(v => {
            if(v) {
                v.classList.remove('active');
                v.style.display = 'none';
            }
        });
        const target = document.getElementById(viewId);
        if(target) {
            target.style.display = 'flex';
            // Pequeno delay para animação CSS funcionar
            setTimeout(() => target.classList.add('active'), 10);
        }
    }

    if(btnIrCadastro) btnIrCadastro.addEventListener('click', (e) => { e.preventDefault(); showView('view-selection'); });
    if(btnVoltarLoginSel) btnVoltarLoginSel.addEventListener('click', (e) => { e.preventDefault(); showView('view-login'); });
    if(btnVoltarSelecao) btnVoltarSelecao.addEventListener('click', (e) => { e.preventDefault(); showView('view-selection'); });

    // Listener para quando o usuário clica nos cartões "Sou Cliente" ou "Sou Artesão"
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
    });

    // --- HELPER PARA FETCH (REQUISIÇÕES HTTP) ---
    async function apiFetch(endpoint, method = 'POST', body = null) {
        const token = localStorage.getItem('userToken');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
    
        const config = { method: method, headers: headers };
        if (body) config.body = JSON.stringify(body);
    
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, config);
    
        if (!response.ok) {
            const text = await response.text();
            // Tenta fazer parse do erro se for JSON, senão retorna o texto
            try {
                const jsonError = JSON.parse(text);
                throw new Error(jsonError.mensagem || jsonError.error || text);
            } catch(e) {
                throw new Error(text || `Erro ${response.status}`);
            }
        }
        if (response.status === 204) return null;
        return await response.json();
    }

    // --- LOGIN ---
    if (formLogin) {
        formLogin.addEventListener("submit", async function(event) {
            event.preventDefault(); 
            
            const email = document.getElementById("login-email").value;
            const senha = document.getElementById("login-senha").value;
            
            try {
                // 1. Faz o Login
                const data = await apiFetch('/api/auth/login', 'POST', { email, senha });
                
                // 2. Salva Token e ID
                localStorage.setItem('userToken', data.token); 
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userId', data.userId);
                
                // 3. Tenta obter nome e foto
                let fotoFinal = data.fotoUrl;
                let nomeFinal = data.nome;

                // Se o login não retornou nome/foto (dependendo da implementação do backend), busca detalhes
                if (!fotoFinal || !nomeFinal) {
                    try {
                        let endpointDetalhes = data.role === 'ROLE_CLIENTE' 
                            ? `/api/clientes/${data.userId}` 
                            : `/api/artistas/${data.userId}`;
                        
                        const detalhes = await apiFetch(endpointDetalhes, 'GET');
                        fotoFinal = detalhes.fotoUrl;
                        nomeFinal = detalhes.nome;
                    } catch (detailError) {
                        console.warn("Info extra login indisponível", detailError);
                    }
                }

                if (nomeFinal) localStorage.setItem('userName', nomeFinal);
                if (fotoFinal) localStorage.setItem('userPhoto', fotoFinal);
                
                // 4. Redirecionamento
                if (data.role === 'ROLE_CLIENTE') {
                    // Lógica de Carrinho para cliente
                    try {
                        await fetch(`${API_BASE_URL}/api/carrinhos/cliente/${data.userId}`, {
                            method: 'POST',
                            headers: { 
                                'Authorization': `Bearer ${data.token}`,
                                'Content-Type': 'application/json' 
                            }
                        }).then(r => r.json()).then(c => {
                             if(c.id) localStorage.setItem('carrinhoId', c.id);
                        });
                    } catch(e) { console.log("Erro carrinho login", e); }

                    window.location.href = 'dashboard-cliente.html';
                } else if (data.role === 'ROLE_ARTISTA') {
                    window.location.href = 'dashboard-artesao.html';
                } else {
                    window.location.href = 'dashboard-admin.html';
                }

            } catch (error) {
                console.error(error);
                alert("Erro ao entrar: " + error.message);
            }
        });
    }

    // --- CADASTRO (A CORREÇÃO PRINCIPAL ESTÁ AQUI) ---
    if (formCadastro) {
        formCadastro.addEventListener("submit", async function(event) {
            event.preventDefault();
            
            // Usamos FormData para pegar todos os campos facilmente
            const formData = new FormData(formCadastro);
            const dados = Object.fromEntries(formData.entries());
            
            // Define o tipo de conta
            if (!dados.tipoConta) dados.tipoConta = radioCliente.checked ? 'cliente' : 'artesao';

            // Verifica qual telefone usar no endereço. 
            // Se o usuário preencheu "telefoneEndereco", usa ele. Se não, usa o telefone pessoal.
            const telefoneParaEndereco = dados.telefoneEndereco && dados.telefoneEndereco.trim() !== "" 
                ? dados.telefoneEndereco 
                : dados.telefone;

            // MONTAGEM DO JSON ESTRUTURADO (NESTED)
            // Isso resolve o erro 400. O backend espera objetos dentro de objetos.
            const payload = {
                nome: dados.nome,
                cpf: dados.cpf,
                telefone: dados.telefone, // Telefone principal (root)
                
                credencial: { 
                    email: dados.email, 
                    senha: dados.senha 
                },
                
                endereco: {
                    logradouro: dados.logradouro,
                    numero: parseInt(dados.numero) || 0, // Garante que é número
                    bairro: dados.bairro,
                    cidade: dados.cidade,
                    estado: dados.estado,
                    cep: dados.cep,
                    complemento: dados.complemento || "",
                    telefone: telefoneParaEndereco // IMPORTANTE: Envia o telefone DENTRO do objeto endereço também
                }
            };
            
            // Adiciona campos exclusivos de Artesão se necessário
            if (dados.tipoConta === 'artesao') {
                payload.nomeEmpresa = dados.nomeEmpresa; // O input name="nomeEmpresa"
                payload.cnpj = dados.cnpj;
            }

            // Define endpoint correto
            const endpoint = dados.tipoConta === 'cliente' ? '/api/clientes' : '/api/artistas';

            console.log("Enviando Payload:", payload); // Para debug no console do navegador

            try {
                await apiFetch(endpoint, 'POST', payload);
                alert("Cadastro realizado com sucesso! Faça login para continuar.");
                formCadastro.reset();
                showView('view-login'); 
            } catch (error) {
                console.error(error);
                alert(`Erro no cadastro: ${error.message}`);
            }
        });
    }
});