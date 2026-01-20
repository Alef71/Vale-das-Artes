document.addEventListener("DOMContentLoaded", function() {
    
    // --- ELEMENTOS DO DOM ---
    const formEditar = document.getElementById('form-editar-cliente');
    const previewFoto = document.getElementById('foto-preview-cliente');
    const inputFoto = document.getElementById('input-foto-cliente');
    const btnCamera = document.getElementById('btn-camera-upload'); 
    const uploadStatus = document.getElementById('upload-status-cliente');
    
    const nomeInput = document.getElementById('cliente-nome');
    const sidebarNome = document.getElementById('sidebar-nome-display');

    let token = localStorage.getItem('userToken');
    let userId = localStorage.getItem('userId');

    // --- 0. LÓGICA DO ACORDEÃO (ABRIR/FECHAR ABAS) ---
    const accordions = document.querySelectorAll('.accordion-header');
    
    accordions.forEach(header => {
        header.addEventListener('click', () => {
            // Alterna a classe 'active' no cabeçalho (para girar a seta)
            header.classList.toggle('active');
            
            // Pega o próximo elemento (o conteúdo oculto)
            const content = header.nextElementSibling;
            if (content) {
                // Alterna a classe 'open' para mostrar/esconder
                content.classList.toggle('open');
            }
        });
    });

    // --- 1. INICIALIZAÇÃO ---
    async function checkLoginAndLoadData() {
        const role = localStorage.getItem('userRole');

        if (!token || !userId || role !== 'ROLE_CLIENTE') {
            alert("Acesso negado. Por favor, faça o login.");
            localStorage.clear(); 
            window.location.href = 'login.html';
            return; 
        }

        try {
            const cliente = await apiClient(`/clientes/${userId}`, 'GET');
            populatePage(cliente); 
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            if (error.message && error.message.includes('403')) {
                alert("Sessão expirada.");
                window.location.href = 'login.html';
            }
        }
    }

    // --- 2. PREENCHER DADOS NA TELA ---
    function populatePage(cliente) {
        const titleElement = document.getElementById('dashboard-title');
        if(titleElement) titleElement.textContent = `Painel do Cliente - Bem-vindo, ${cliente.nome}!`;

        // FOTO
        if (cliente.fotoUrl) {
            previewFoto.src = `${cliente.fotoUrl}?t=${new Date().getTime()}`;
        } else {
            previewFoto.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cliente.nome)}&background=9c8b75&color=fff&size=150`;
        }

        // DADOS PESSOAIS
        if(nomeInput) nomeInput.value = cliente.nome || '';
        if(document.getElementById('cliente-cpf')) document.getElementById('cliente-cpf').value = cliente.cpf || '';
        if(document.getElementById('cliente-telefone')) document.getElementById('cliente-telefone').value = cliente.telefone || '';
        
        // EMAIL
        if (cliente.credencial) {
            const emailInput = document.getElementById('cliente-email');
            const emailVisual = document.getElementById('cliente-email-visual');
            if(emailInput) emailInput.value = cliente.credencial.email || '';
            if(emailVisual) emailVisual.value = cliente.credencial.email || ''; 
        }

        // SIDEBAR
        if(sidebarNome) sidebarNome.textContent = cliente.nome || 'Cliente';

        // ENDEREÇO
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

    // Sincroniza nome sidebar enquanto digita
    if(nomeInput && sidebarNome) {
        nomeInput.addEventListener('input', (e) => {
            sidebarNome.textContent = e.target.value || 'Cliente';
        });
    }

    // --- 3. UPLOAD DE FOTO ---
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
                const urlUpload = `http://localhost:8080/api/clientes/${userId}/foto`;
                
                const response = await fetch(urlUpload, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (response.ok) {
                    const clienteAtualizado = await response.json();
                    previewFoto.src = clienteAtualizado.fotoUrl + `?t=${new Date().getTime()}`;
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

    // --- 4. ATUALIZAR DADOS (LOGICA CORRIGIDA) ---
    if (formEditar) {
        formEditar.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // 1. Monta o objeto BÁSICO (Sem a senha ainda)
            const payload = {
                nome: document.getElementById('cliente-nome').value,
                cpf: document.getElementById('cliente-cpf').value,
                telefone: document.getElementById('cliente-telefone').value,
                credencial: {
                    email: document.getElementById('cliente-email').value
                    // NOTA: 'senha' NÃO é adicionada aqui, para ir como nula se estiver vazia
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

            // 2. Verifica se o usuário digitou algo na "Nova Senha"
            const novaSenha = document.getElementById('nova-senha').value;
            const confirmaSenha = document.getElementById('confirma-senha').value;

            // Só adiciona a senha ao envio SE o campo não estiver vazio
            if (novaSenha && novaSenha.trim() !== "") {
                if (novaSenha !== confirmaSenha) {
                    alert('As senhas digitadas não conferem!');
                    return; // Para o envio se as senhas forem diferentes
                }
                // Se passou na validação, adiciona ao payload para o Java processar
                payload.credencial.senha = novaSenha;
            } 
            // Se estiver vazio, o payload segue sem o campo 'senha'.
            // O Java receberá null/vazio e manterá a senha antiga.

            try {
                const clienteAtualizado = await apiClient(`/clientes/${userId}`, 'PUT', payload);
                alert('Dados atualizados com sucesso!');
                populatePage(clienteAtualizado);
                
                // Limpa os campos de senha por segurança visual
                document.getElementById('nova-senha').value = '';
                document.getElementById('confirma-senha').value = '';
            } catch (error) {
                alert('Erro ao atualizar dados. Verifique as informações.');
                console.error(error);
            }
        });
    }

    checkLoginAndLoadData();
});