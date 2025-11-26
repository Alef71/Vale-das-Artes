document.addEventListener("DOMContentLoaded", function() {

    // --- SELETORES ---
    const viewLogin = document.getElementById("view-login");
    const viewSelection = document.getElementById("view-selection");
    const viewCadastro = document.getElementById("view-cadastro");

    // Botões de Navegação
    const btnIrCadastro = document.getElementById("btn-ir-cadastro");
    const btnVoltarLoginSel = document.getElementById("btn-voltar-login-sel");
    const btnVoltarSelecao = document.getElementById("btn-voltar-selecao");

    // Elementos do Cadastro
    const radioCliente = document.getElementById("radio-cliente");
    const radioArtesao = document.getElementById("radio-artesao");
    const extraArtesao = document.getElementById("extra-artesao");
    const tituloCadastro = document.getElementById("titulo-cadastro");

    // --- FUNÇÃO DE TROCA DE TELA ---
    function showView(viewId) {
        // Esconde todos
        [viewLogin, viewSelection, viewCadastro].forEach(v => {
            v.classList.remove('active');
            // Pequeno delay para display:none não quebrar animação
            setTimeout(() => { if(!v.classList.contains('active')) v.style.display = 'none'; }, 400);
        });

        // Mostra o alvo
        const target = document.getElementById(viewId);
        target.style.display = 'flex'; // Garante que existe
        setTimeout(() => target.classList.add('active'), 50); // Adiciona classe para opacidade
    }

    // Inicialização: Mostra Login, esconde outros via style
    viewSelection.style.display = 'none';
    viewCadastro.style.display = 'none';

    // --- EVENTOS DE CLIQUE ---
    
    // 1. Tela Login -> Tela Seleção
    if(btnIrCadastro) {
        btnIrCadastro.addEventListener('click', (e) => {
            e.preventDefault();
            showView('view-selection');
        });
    }

    // 2. Tela Seleção -> Tela Login
    if(btnVoltarLoginSel) {
        btnVoltarLoginSel.addEventListener('click', (e) => {
            e.preventDefault();
            showView('view-login');
        });
    }

    // 3. Tela Cadastro -> Tela Seleção
    if(btnVoltarSelecao) {
        btnVoltarSelecao.addEventListener('click', (e) => {
            e.preventDefault();
            showView('view-selection');
        });
    }

    // 4. LÓGICA DE SELEÇÃO (Recebe do HTML)
    document.addEventListener('roleSelected', (e) => {
        const role = e.detail;
        
        if (role === 'cliente') {
            radioCliente.checked = true;
            extraArtesao.style.display = 'none';
            tituloCadastro.innerText = "Cadastro de Cliente";
        } else {
            radioArtesao.checked = true;
            extraArtesao.style.display = 'block';
            tituloCadastro.innerText = "Cadastro de Artesão";
        }
        
        showView('view-cadastro');
        // Reseta scroll
        viewCadastro.scrollTop = 0;
    });

    // --- API FETCH HELPER ---
    async function apiFetch(url, method, body) {
        const token = localStorage.getItem('userToken');
        const headers = { 'Content-Type': 'application/json' };
        if(token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch(url, {
            method: method,
            headers: headers,
            body: JSON.stringify(body)
        });
        
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || res.statusText);
        }
        return res.status === 204 ? null : await res.json();
    }

    // --- SUBMIT LOGIN ---
    const formLogin = document.getElementById("form-login");
    if(formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const senha = document.getElementById("login-senha").value;

            try {
                const data = await apiFetch('/api/auth/login', 'POST', { email, senha });
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userId', data.userId);
                
                alert("Login realizado!");
                
                if(data.role === 'ROLE_CLIENTE') window.location.href = 'dashboard-cliente.html';
                else if(data.role === 'ROLE_ARTISTA') window.location.href = 'dashboard-artesao.html';
                else window.location.href = 'dashboard-admin.html';
                
            } catch (err) {
                alert("Erro no login: " + err.message);
            }
        });
    }

    // --- SUBMIT CADASTRO ---
    const formCadastro = document.getElementById("form-cadastro");
    if(formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Coleta dados manualmente para garantir estrutura
            const tipo = radioCliente.checked ? 'cliente' : 'artesao';
            const body = {
                nome: document.getElementById('cad-nome').value,
                cpf: document.getElementById('cad-cpf').value,
                telefone: document.getElementById('cad-telefone').value,
                credencial: {
                    email: document.getElementById('cad-email').value,
                    senha: document.getElementById('cad-senha').value
                },
                endereco: {
                    cep: document.getElementById('end-cep').value,
                    cidade: document.getElementById('end-cidade').value,
                    logradouro: document.getElementById('end-logradouro').value,
                    numero: parseInt(document.getElementById('end-numero').value) || 0,
                    bairro: document.getElementById('end-bairro').value,
                    estado: document.getElementById('end-estado').value,
                    telefone: document.getElementById('end-tel-entrega').value
                }
            };

            let url = '/api/clientes';
            if (tipo === 'artesao') {
                url = '/api/artistas';
                body.nomeEmpresa = document.getElementById('cad-empresa').value;
                body.cnpj = document.getElementById('cad-cnpj').value;
            }

            try {
                await apiFetch(url, 'POST', body);
                alert("Cadastro realizado! Faça login.");
                formCadastro.reset();
                showView('view-login');
            } catch (err) {
                alert("Erro ao cadastrar: " + err.message);
            }
        });
    }
});