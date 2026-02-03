const API_BASE_URL = 'http://localhost:8080/api';

console.log("LOG: dashboard-cliente.js CARREGADO! API:", API_BASE_URL);

document.addEventListener("DOMContentLoaded", function() {

    // --- Elementos do Formulário e Visualização ---
    const formEditar = document.getElementById('form-editar-cliente');
    
    // Elementos de Foto
    const previewFoto = document.getElementById('foto-preview-cliente');
    const inputFoto = document.getElementById('input-foto-cliente');
    const btnCamera = document.getElementById('btn-camera-upload'); 
    const uploadStatus = document.getElementById('upload-status-cliente');
    
    // Elementos de Texto
    const nomeInput = document.getElementById('cliente-nome');
    const sidebarNome = document.getElementById('sidebar-nome-display'); // Nome na barra lateral
    
    // Accordion (Menu retrátil)
    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(header => {
        header.addEventListener('click', () => {
            header.classList.toggle('active');
            const content = header.nextElementSibling;
            if (content) {
                content.classList.toggle('open');
            }
        });
    });

    // --- Helpers de Autenticação (Igual ao Artesão) ---
    function getToken() { return localStorage.getItem('userToken'); }
    function getUserId() { return localStorage.getItem('userId'); }

    // --- Cliente API Genérico ---
    async function apiClient(endpoint, method, body = null) {
        const token = getToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        
        if (body && !(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        
        const options = {
            method: method,
            headers: headers,
            body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : null
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            let errorMsg = `Erro ${response.status}`;
            try {
                const data = await response.json();
                if(data.message) errorMsg = data.message;
            } catch(e) {}
            
            if (response.status === 403 || response.status === 401) {
                alert("Sessão expirada.");
                localStorage.clear();
                window.location.href = 'login.html';
                return;
            }
            throw new Error(errorMsg);
        }
        
        if (response.status === 204) return null;
        return await response.json();
    }

    // --- Carga Inicial de Dados ---
    async function checkLoginAndLoadData() {
        const role = localStorage.getItem('userRole');
        const userId = getUserId();

        if (!getToken() || !userId || role !== 'ROLE_CLIENTE') {
            alert("Acesso negado. Por favor, faça o login.");
            localStorage.clear(); 
            window.location.href = 'login.html';
            return; 
        }

        try {
            const cliente = await apiClient(`/clientes/${userId}`, 'GET');
            
            // --- LÓGICA DO HEADER IGUAL AO ARTESÃO ---
            if (cliente.nome) localStorage.setItem('userName', cliente.nome);
            if (cliente.fotoUrl) localStorage.setItem('userPhoto', cliente.fotoUrl);

            // Atualiza avatar do header se existir
            const headerAvatar = document.getElementById('nav-user-avatar');
            if (headerAvatar && cliente.fotoUrl) {
                headerAvatar.src = `${cliente.fotoUrl}?t=${new Date().getTime()}`;
            }
            // ------------------------------------------

            populatePage(cliente); 
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    }

    // --- Preencher a Tela ---
    function populatePage(cliente) {
        const titleElement = document.getElementById('dashboard-title');
        if(titleElement) titleElement.textContent = `Painel do Cliente - Bem-vindo, ${cliente.nome}!`;

        // Atualiza a foto de preview do perfil (Dashboard)
        if (previewFoto) {
            const timestamp = new Date().getTime();
            if (cliente.fotoUrl) {
                previewFoto.src = `${cliente.fotoUrl}?t=${timestamp}`;
            } else {
                previewFoto.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cliente.nome)}&background=9c8b75&color=fff&size=150`;
            }
        }

        // Dados Básicos
        if(nomeInput) nomeInput.value = cliente.nome || '';
        if(document.getElementById('cliente-cpf')) document.getElementById('cliente-cpf').value = cliente.cpf || '';
        if(document.getElementById('cliente-telefone')) document.getElementById('cliente-telefone').value = cliente.telefone || '';
        
        // Email
        if (cliente.credencial) {
            const emailInput = document.getElementById('cliente-email');
            const emailVisual = document.getElementById('cliente-email-visual'); // Caso tenha campo readonly
            if(emailInput) emailInput.value = cliente.credencial.email || '';
            if(emailVisual) emailVisual.value = cliente.credencial.email || ''; 
        }

        // Sidebar
        if(sidebarNome) sidebarNome.textContent = cliente.nome || 'Cliente';

        // Endereço
        if (cliente.endereco) {
            const fields = {
                'end-logradouro': cliente.endereco.logradouro,
                'end-numero': cliente.endereco.numero,
                'end-complemento': cliente.endereco.complemento,
                'end-bairro': cliente.endereco.bairro,
                'end-cidade': cliente.endereco.cidade,
                'end-estado': cliente.endereco.estado,
                'end-cep': cliente.endereco.cep,
                'end-telefone': cliente.endereco.telefone
            };

            for (const [id, value] of Object.entries(fields)) {
                const el = document.getElementById(id);
                if (el) el.value = value || '';
            }
        }
    }

    // Atualizar nome na sidebar em tempo real
    if(nomeInput && sidebarNome) {
        nomeInput.addEventListener('input', (e) => {
            sidebarNome.textContent = e.target.value || 'Cliente';
        });
    }

    // --- Upload de Foto (Logica Corrigida) ---
    if(btnCamera) {
        btnCamera.addEventListener('click', () => {
            if(inputFoto) inputFoto.click();
        });
    }

    if(inputFoto) {
        inputFoto.addEventListener('change', async () => {
            const file = inputFoto.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) { 
                alert("A imagem é muito grande. Máximo 5MB.");
                return;
            }

            uploadStatus.textContent = 'Enviando...';
            uploadStatus.style.color = 'var(--accent)';

            const formData = new FormData();
            formData.append('foto', file);

            try {
                // Usa fetch direto para upload (igual ao artesão) para evitar processamento JSON
                const response = await fetch(`${API_BASE_URL}/clientes/${getUserId()}/foto`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${getToken()}` },
                    body: formData
                });

                if (response.ok) {
                    const clienteAtualizado = await response.json();
                    const timestamp = new Date().getTime();
                    const novaUrl = `${clienteAtualizado.fotoUrl}?t=${timestamp}`;
                    
                    // 1. Atualiza Preview
                    previewFoto.src = novaUrl;
                    
                    // 2. Atualiza LocalStorage
                    localStorage.setItem('userPhoto', clienteAtualizado.fotoUrl);
                    
                    // 3. Atualiza Header (igual ao artesão)
                    const headerAvatar = document.getElementById('nav-user-avatar');
                    if (headerAvatar) headerAvatar.src = novaUrl;

                    uploadStatus.textContent = 'Sucesso!';
                    uploadStatus.style.color = 'green';
                    setTimeout(() => { uploadStatus.textContent = ''; }, 3000);
                } else {
                    throw new Error(`Falha: ${response.status}`);
                }
            } catch (error) {
                console.error('Erro upload:', error);
                uploadStatus.textContent = 'Erro ao enviar.';
                uploadStatus.style.color = 'red';
            }
            inputFoto.value = null;
        });
    }

    // --- Salvar Edição de Perfil ---
    if (formEditar) {
        formEditar.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const payload = {
                nome: document.getElementById('cliente-nome').value,
                cpf: document.getElementById('cliente-cpf').value,
                telefone: document.getElementById('cliente-telefone').value,
                credencial: {
                    email: document.getElementById('cliente-email').value
                },
                endereco: {
                    logradouro: document.getElementById('end-logradouro').value,
                    numero: parseInt(document.getElementById('end-numero').value) || 0,
                    complemento: document.getElementById('end-complemento').value,
                    bairro: document.getElementById('end-bairro').value,
                    cidade: document.getElementById('end-cidade').value,
                    estado: document.getElementById('end-estado').value,
                    cep: document.getElementById('end-cep').value,
                    telefone: document.getElementById('end-telefone').value
                }
            };

            const novaSenha = document.getElementById('nova-senha').value;
            const confirmaSenha = document.getElementById('confirma-senha').value;

            if (novaSenha && novaSenha.trim() !== "") {
                if (novaSenha !== confirmaSenha) {
                    alert('As senhas digitadas não conferem!');
                    return; 
                }
                payload.credencial.senha = novaSenha;
            } 

            try {
                const clienteAtualizado = await apiClient(`/clientes/${getUserId()}`, 'PUT', payload);
                alert('Dados atualizados com sucesso!');
                
                // Atualiza Header e Storage com novo nome
                if(clienteAtualizado.nome) {
                    localStorage.setItem('userName', clienteAtualizado.nome);
                }
                
                populatePage(clienteAtualizado);
                
                document.getElementById('nova-senha').value = '';
                document.getElementById('confirma-senha').value = '';
            } catch (error) {
                alert('Erro ao atualizar dados: ' + error.message);
                console.error(error);
            }
        });
    }

    checkLoginAndLoadData();
});