document.addEventListener("DOMContentLoaded", function() {
    
    const formEditar = document.getElementById('form-editar-cliente');
    
    // --- 1. SELETORES DA FOTO DE PERFIL ADICIONADOS ---
    const previewFoto = document.getElementById('foto-preview-cliente');
    const inputFoto = document.getElementById('input-foto-cliente');
    const menu = document.getElementById('foto-options-menu-cliente');
    const uploadStatus = document.getElementById('upload-status-cliente');
    const btnAdicionar = document.getElementById('btn-adicionar-foto-cliente');
    const btnAtualizar = document.getElementById('btn-atualizar-foto-cliente');
    const btnRemover = document.getElementById('btn-remover-foto-cliente');
    const btnCancelar = document.getElementById('btn-cancelar-foto-cliente');

    let token = null;       // Movido para escopo global do script
    let userId = null;      // Movido para escopo global do script
    let clientePossuiFoto = false; // Controla o estado da foto

    
    async function checkLoginAndLoadData() {
        token = localStorage.getItem('userToken'); // Atribui ao escopo global
        const role = localStorage.getItem('userRole');
        userId = localStorage.getItem('userId'); // Atribui ao escopo global

        
        if (!token || !userId || role !== 'ROLE_CLIENTE') {
            
            alert("Acesso negado. Por favor, faça o login.");
            localStorage.clear(); 
            window.location.href = 'login.html';
            return; 
        }

        
        try {
            // Usa a função apiClient global do main.js
            const cliente = await apiClient(`/clientes/${userId}`, 'GET');
            populatePage(cliente); 

        } catch (error) {
            console.error("Erro ao buscar dados do cliente:", error);
            
            if (error.message.includes('403')) {
                alert("Sua sessão expirou. Por favor, faça login novamente.");
                localStorage.clear();
                window.location.href = 'login.html';
            } else {
                alert("Erro ao conectar ao servidor para buscar seus dados.");
            }
        }

        
        if (formEditar) {
            formEditar.addEventListener('submit', handleUpdateSubmit);
        }
        
        // --- 2. LISTENERS DA FOTO DE PERFIL ADICIONADOS ---
        if (previewFoto) previewFoto.addEventListener('click', abrirMenuFoto);
        if (btnCancelar) btnCancelar.addEventListener('click', fecharMenuFoto);
        if (btnAdicionar) btnAdicionar.addEventListener('click', acionarInputDeArquivo);
        if (btnAtualizar) btnAtualizar.addEventListener('click', acionarInputDeArquivo);
        if (btnRemover) btnRemover.addEventListener('click', handleRemoveFoto);
        if (inputFoto) inputFoto.addEventListener('change', handleUploadFoto);
    }

    
    function populatePage(cliente) {
        
        document.getElementById('dashboard-title').textContent = `Painel do Cliente - Bem-vindo, ${cliente.nome}!`;

        // --- 3. ATUALIZAÇÃO DA FOTO NA PÁGINA ---
        if (previewFoto) {
            if (cliente.fotoUrl) {
                previewFoto.src = cliente.fotoUrl;
                clientePossuiFoto = true;
            } else {
                previewFoto.src = 'https://via.placeholder.com/150?text=Sem+Foto';
                clientePossuiFoto = false;
            }
        }
        // --- FIM DA ATUALIZAÇÃO DA FOTO ---

        
        document.getElementById('cliente-nome').value = cliente.nome || '';
        document.getElementById('cliente-cpf').value = cliente.cpf || '';
        document.getElementById('cliente-telefone').value = cliente.telefone || '';
        
        
        if (cliente.credencial && cliente.credencial.email) {
            document.getElementById('cliente-email').value = cliente.credencial.email;
        }

        
        if (cliente.endereco) {
            document.getElementById('end-logradouro').value = cliente.endereco.logradouro || '';
            document.getElementById('end-numero').value = cliente.endereco.numero || '';
            document.getElementById('end-complemento').value = cliente.endereco.complemento || '';
            document.getElementById('end-bairro').value = cliente.endereco.bairro || '';
            document.getElementById('end-cidade').value = cliente.endereco.cidade || '';
            document.getElementById('end-estado').value = cliente.endereco.estado || '';
            document.getElementById('end-cep').value = cliente.endereco.cep || '';
            document.getElementById('end-telefone').value = cliente.endereco.telefone || ''; 
        }
        document.getElementById('lista-pedidos').innerHTML = "<p>Nenhum pedido encontrado (função ainda não implementada).</p>";
    }

    
    async function handleUpdateSubmit(event) {
        event.preventDefault(); 
        console.log("Iniciando atualização de cadastro...");
        
        // (token e userId já são globais)

        const payload = {
            nome: document.getElementById('cliente-nome').value,
            cpf: document.getElementById('cliente-cpf').value,
            telefone: document.getElementById('cliente-telefone').value,
            
            credencial: {
                email: document.getElementById('cliente-email').value, 
                senha: null 
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

        if (novaSenha) {
            if (novaSenha !== confirmaSenha) {
                alert('As novas senhas não coincidem! Tente novamente.');
                return; 
            }
            
            payload.credencial.senha = novaSenha; 
        }

        console.log("Enviando atualização para /api/clientes/", userId, payload);

        try {
            // Usa a função apiClient global do main.js
            const clienteAtualizado = await apiClient(`/clientes/${userId}`, 'PUT', payload);
            
            alert('Dados atualizados com sucesso!');
            populatePage(clienteAtualizado); 
            
            document.getElementById('nova-senha').value = '';
            document.getElementById('confirma-senha').value = '';

        } catch (error) {
            console.error("Erro ao atualizar:", error);
            alert(`Erro ao atualizar: ${error.message || 'Verifique os dados.'}`);
        }
    }

    
    // --- 4. TODAS AS NOVAS FUNÇÕES DA FOTO DE PERFIL ---

    function abrirMenuFoto() {
        if (clientePossuiFoto) {
            btnAdicionar.style.display = 'none';
            btnAtualizar.style.display = 'block';
            btnRemover.style.display = 'block';
        } else {
            btnAdicionar.style.display = 'block';
            btnAtualizar.style.display = 'none';
            btnRemover.style.display = 'none';
        }
        menu.style.display = 'block';
    }

    function fecharMenuFoto() {
        menu.style.display = 'none';
    }

    function acionarInputDeArquivo() {
        inputFoto.click();
        fecharMenuFoto();
    }

    async function handleUploadFoto() {
        const file = inputFoto.files[0];
        if (!file) return; 

        uploadStatus.textContent = 'Enviando...';
        
        const formData = new FormData();
        formData.append('foto', file); // Nome "foto", como no backend

        try {
            // Usamos fetch direto para FormData
            const response = await fetch(`/api/clientes/${userId}/foto`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const clienteAtualizado = await response.json();
                previewFoto.src = clienteAtualizado.fotoUrl;
                clientePossuiFoto = true; 
                uploadStatus.textContent = 'Foto atualizada!';
                inputFoto.value = null; 
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Falha no upload.');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            uploadStatus.textContent = 'Erro ao enviar foto.';
            inputFoto.value = null;
        }
    }

    async function handleRemoveFoto() {
        if (!confirm('Tem certeza que deseja remover sua foto de perfil?')) {
            fecharMenuFoto();
            return;
        }
        
        fecharMenuFoto();
        uploadStatus.textContent = 'Removendo...';

        try {
            // Usa a função apiClient global do main.js
            const clienteAtualizado = await apiClient(`/clientes/${userId}/foto`, 'DELETE');
            
            previewFoto.src = 'https://via.placeholder.com/150?text=Sem+Foto';
            clientePossuiFoto = false; 
            uploadStatus.textContent = 'Foto removida.';
        } catch (error) {
            console.error('Erro ao remover foto:', error);
            uploadStatus.textContent = 'Erro ao remover foto.';
        }
    }

    // --- FIM DAS NOVAS FUNÇÕES ---

    checkLoginAndLoadData();
});