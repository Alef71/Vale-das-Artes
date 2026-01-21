document.addEventListener("DOMContentLoaded", function() {
    
    const formEditar = document.getElementById('form-editar-cliente');
    const previewFoto = document.getElementById('foto-preview-cliente');
    const inputFoto = document.getElementById('input-foto-cliente');
    const btnCamera = document.getElementById('btn-camera-upload'); 
    const uploadStatus = document.getElementById('upload-status-cliente');
    
    const nomeInput = document.getElementById('cliente-nome');
    const sidebarNome = document.getElementById('sidebar-nome-display');

    let token = localStorage.getItem('userToken');
    let userId = localStorage.getItem('userId');
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
    function populatePage(cliente) {
        const titleElement = document.getElementById('dashboard-title');
        if(titleElement) titleElement.textContent = `Painel do Cliente - Bem-vindo, ${cliente.nome}!`;

        
        if (cliente.fotoUrl) {
            previewFoto.src = `${cliente.fotoUrl}?t=${new Date().getTime()}`;
        } else {
            previewFoto.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cliente.nome)}&background=9c8b75&color=fff&size=150`;
        }

        
        if(nomeInput) nomeInput.value = cliente.nome || '';
        if(document.getElementById('cliente-cpf')) document.getElementById('cliente-cpf').value = cliente.cpf || '';
        if(document.getElementById('cliente-telefone')) document.getElementById('cliente-telefone').value = cliente.telefone || '';
        
        
        if (cliente.credencial) {
            const emailInput = document.getElementById('cliente-email');
            const emailVisual = document.getElementById('cliente-email-visual');
            if(emailInput) emailInput.value = cliente.credencial.email || '';
            if(emailVisual) emailVisual.value = cliente.credencial.email || ''; 
        }

        
        if(sidebarNome) sidebarNome.textContent = cliente.nome || 'Cliente';

        
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
    if(nomeInput && sidebarNome) {
        nomeInput.addEventListener('input', (e) => {
            sidebarNome.textContent = e.target.value || 'Cliente';
        });
    }

    
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
                const clienteAtualizado = await apiClient(`/clientes/${userId}`, 'PUT', payload);
                alert('Dados atualizados com sucesso!');
                populatePage(clienteAtualizado);
                
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