// Dispara quando o HTML do dashboard-cliente.html estiver pronto
document.addEventListener("DOMContentLoaded", function() {
    
    // Pega o formulário de edição
    const formEditar = document.getElementById('form-editar-cliente');

    // Função principal: Verifica o login e carrega os dados
    async function checkLoginAndLoadData() {
        const token = localStorage.getItem('userToken');
        const role = localStorage.getItem('userRole');
        const userId = localStorage.getItem('userId');

        // 1. O usuário está logado E é um cliente?
        if (!token || !userId || role !== 'ROLE_CLIENTE') {
            // Se não, expulsa ele para a página de login
            alert("Acesso negado. Por favor, faça o login.");
            localStorage.clear(); // Limpa dados antigos
            window.location.href = 'login.html';
            return; // Para a execução
        }

        // 2. Se está logado, busca os dados do cliente
        try {
            const response = await fetch(`/api/clientes/${userId}`, {
                method: 'GET',
                headers: {
                    // Envia o Token de autorização
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (response.ok) {
                const cliente = await response.json();
                populatePage(cliente); // Chama a função para preencher a página
            } else if (response.status === 403) {
                 // Token expirado ou inválido
                 alert("Sua sessão expirou. Por favor, faça login novamente.");
                 localStorage.clear();
                 window.location.href = 'login.html';
            } else {
                throw new Error('Falha ao carregar dados do cliente.');
            }

        } catch (error) {
            console.error("Erro ao buscar dados do cliente:", error);
            alert("Erro ao conectar ao servidor para buscar seus dados.");
        }

        // 3. Adiciona o "ouvinte" para o botão "Salvar Alterações"
        if (formEditar) {
            formEditar.addEventListener('submit', handleUpdateSubmit);
        }
    }

    /**
     * Preenche a página (título e formulário) com os dados
     * vindos do back-end (GET /api/clientes/{id})
     */
    function populatePage(cliente) {
        // 1. Atualiza o "Bem-vindo" (Seu pedido)
        document.getElementById('dashboard-title').textContent = `Painel do Cliente - Bem-vindo, ${cliente.nome}!`;

        // 2. Preenche os campos de Dados Pessoais
        document.getElementById('cliente-nome').value = cliente.nome || '';
        document.getElementById('cliente-cpf').value = cliente.cpf || '';
        document.getElementById('cliente-telefone').value = cliente.telefone || '';
        
        // 3. Guarda o email (escondido)
        if (cliente.credencial && cliente.credencial.email) {
            document.getElementById('cliente-email').value = cliente.credencial.email;
        }

        // 4. Preenche os campos de Endereço
        if (cliente.endereco) {
            document.getElementById('end-logradouro').value = cliente.endereco.logradouro || '';
            document.getElementById('end-numero').value = cliente.endereco.numero || '';
            document.getElementById('end-complemento').value = cliente.endereco.complemento || '';
            document.getElementById('end-bairro').value = cliente.endereco.bairro || '';
            document.getElementById('end-cidade').value = cliente.endereco.cidade || '';
            document.getElementById('end-estado').value = cliente.endereco.estado || '';
            document.getElementById('end-cep').value = cliente.endereco.cep || '';
            document.getElementById('end-telefone').value = cliente.endereco.telefone || ''; // Campo novo
        }

        // (Carrega os pedidos - Faremos isso em seguida)
        document.getElementById('lista-pedidos').innerHTML = "<p>Nenhum pedido encontrado (função ainda não implementada).</p>";
    }

    /**
     * Função chamada quando o usuário clica em "Salvar Alterações"
     */
    async function handleUpdateSubmit(event) {
        event.preventDefault(); // Impede o recarregamento
        console.log("Iniciando atualização de cadastro...");
        
        const token = localStorage.getItem('userToken');
        const userId = localStorage.getItem('userId');

        // 1. Monta o payload (JSON) com os dados do formulário
        // (Baseado no ClienteRequestDTO que seu back-end espera)
        const payload = {
            nome: document.getElementById('cliente-nome').value,
            cpf: document.getElementById('cliente-cpf').value,
            telefone: document.getElementById('cliente-telefone').value,
            
            credencial: {
                email: document.getElementById('cliente-email').value, // Email (do campo escondido)
                senha: null // (Será preenchido abaixo se houver nova senha)
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

        // 2. Verifica a lógica de "Nova Senha"
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmaSenha = document.getElementById('confirma-senha').value;

        if (novaSenha) { // Se o usuário digitou uma nova senha
            if (novaSenha !== confirmaSenha) {
                alert('As novas senhas não coincidem! Tente novamente.');
                return; // Para a execução
            }
            // Se coincidem, adiciona ao payload
            payload.credencial.senha = novaSenha; 
        }

        console.log("Enviando atualização para /api/clientes/", userId, payload);

        // 3. Envia o PUT para o back-end
        try {
            const response = await fetch(`/api/clientes/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const clienteAtualizado = await response.json();
                alert('Dados atualizados com sucesso!');
                populatePage(clienteAtualizado); // Repopula a página com os dados novos
                
                // Limpa os campos de senha por segurança
                document.getElementById('nova-senha').value = '';
                document.getElementById('confirma-senha').value = '';

            } else {
                const error = await response.json();
                console.error("Erro ao atualizar:", error);
                alert(`Erro ao atualizar: ${error.message || 'Verifique os dados.'}`);
            }

        } catch (error) {
            console.error("Erro de rede ao atualizar:", error);
            alert("Erro de rede. Não foi possível salvar as alterações.");
        }
    }

    // --- Inicia tudo ---
    checkLoginAndLoadData();
});