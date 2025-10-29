// --- TESTE PARA VER SE O ARQUIVO NOVO CARREGOU ---
console.log("LOG DE TESTE: dashboard-artesao.js v2 CARREGADO!");
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", function() {
    
    // --- TESTE PARA VER SE O 'DOMContentLoaded' RODOU ---
    console.log("LOG DE TESTE: DOMContentLoaded disparado.");

    // Seletores dos formulários
    const formEditarPerfil = document.getElementById('form-editar-artesao');
    const formNovoProduto = document.getElementById('form-novo-produto'); // <-- NOSSO ALVO
    const listaMeusProdutos = document.getElementById('lista-meus-produtos');

    // --- TESTE PARA VER SE O FORMULÁRIO FOI ENCONTRADO ---
    if (formNovoProduto) {
        console.log("LOG DE TESTE: Formulário 'form-novo-produto' encontrado!");
    } else {
        console.error("ERRO CRÍTICO: Formulário 'form-novo-produto' NÃO encontrado!");
        return; // Para a execução se o formulário não existir
    }


    // Função principal: Verifica o login e carrega os dados
    async function checkLoginAndLoadData() {
        const token = localStorage.getItem('userToken');
        const role = localStorage.getItem('userRole');
        const userId = localStorage.getItem('userId');

        if (!token || !userId || role !== 'ROLE_ARTISTA') {
            alert("Acesso negado. Por favor, faça o login como artesão.");
            localStorage.clear();
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch(`/api/artistas/${userId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const artista = await response.json();
                populatePage(artista); 
            } else if (response.status === 403) {
                 alert("Sua sessão expirou. Por favor, faça login novamente.");
                 localStorage.clear();
                 window.location.href = 'login.html';
            } else {
                throw new Error('Falha ao carregar dados do artesão.');
            }
        } catch (error) {
            console.error("Erro ao buscar dados do artesão:", error);
            alert("Erro ao conectar ao servidor para buscar seus dados.");
        }

        if (formEditarPerfil) {
            formEditarPerfil.addEventListener('submit', handleUpdateProfileSubmit);
        }
        
        if (formNovoProduto) {
            formNovoProduto.addEventListener('submit', handleNewProductSubmit);
            console.log("LOG DE TESTE: 'Ouvinte' (submit) adicionado ao formulário de produto.");
        }
    }

    /**
     * Preenche a página com os dados vindos do (GET /api/artistas/{id})
     */
    function populatePage(artista) {
        document.getElementById('dashboard-title').textContent = `Painel do Artesão - Bem-vindo, ${artista.nome}!`;
        // (Outros campos do perfil...)

        // Renderiza a lista de produtos (COM A FOTO CORRETA)
        renderProdutos(artista.produtos);
    }

    /**
     * Renderiza a lista de produtos do artesão (ATUALIZADO)
     */
    function renderProdutos(produtos) {
        if (!produtos || produtos.length === 0) {
            listaMeusProdutos.innerHTML = "<p>Você ainda não cadastrou nenhum produto.</p>";
            return;
        }

        listaMeusProdutos.innerHTML = ''; 
        produtos.forEach(produto => {
            const card = document.createElement('article');
            card.className = 'meu-produto-item';
            
            const fotoUrl = produto.fotoUrl || 'https://via.placeholder.com/100';
            
            card.innerHTML = `
                <img src="${fotoUrl}" alt="${produto.nome}" style="width:100px; height:100px; object-fit: cover;">
                <div class="meu-produto-info">
                    <h3>${produto.nome}</h3>
                    <p class="produto-preco">R$ ${produto.preco.toFixed(2)}</p>
                    <p class="produto-status">Status: <span>${produto.ativo ? 'Ativo' : 'Inativo'}</span></p>
                </div>
                <div class="meu-produto-acoes">
                    <button class="btn-editar-produto" data-id="${produto.id}">Editar</button>
                    <button class="btn-inativar-produto" data-id="${produto.id}">Inativar</button>
                </div>
            `;
            listaMeusProdutos.appendChild(card);
        });
    }

    /**
     * (Placeholder) Lógica de 'Editar Perfil'
     */
    async function handleUpdateProfileSubmit(event) {
        event.preventDefault();
        alert("Função 'Salvar Perfil' ainda em construção. Precisamos adicionar os campos de endereço ao formulário HTML.");
    }


    /**
     * --- FUNÇÃO PRINCIPAL DE UPLOAD DE FOTO ---
     */
    async function handleNewProductSubmit(event) {
        event.preventDefault(); // <-- O COMANDO QUE ESTAVA FALHANDO
        
        console.log("LOG DE TESTE: handleNewProductSubmit FOI ACIONADO! O upload vai começar.");

        const token = localStorage.getItem('userToken');
        const fotoInput = document.getElementById('produto-foto');
        const foto = fotoInput.files[0];

        if (!foto) {
            alert('Por favor, selecione uma foto para o produto.');
            return;
        }

        const formData = new FormData();
        formData.append('nome', document.getElementById('produto-nome').value);
        formData.append('descricao', document.getElementById('produto-descricao').value);
        formData.append('preco', document.getElementById('produto-preco').value);
        formData.append('categoria', document.getElementById('produto-categoria').value);
        formData.append('foto', foto);

        console.log("Enviando cadastro de produto...");

        try {
            const response = await fetch('/api/produtos', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData 
            });

            if (response.ok) {
                alert('Produto cadastrado com sucesso!'); // <-- O ALERTA QUE QUEREMOS VER
                window.location.reload(); 
            } else {
                const error = await response.json();
                console.error("Erro ao cadastrar produto:", error);
                alert(`Erro ao cadastrar: ${error.message || 'Verifique os dados.'}`);
            }
        } catch (error) {
            console.error("Erro de rede ao cadastrar produto:", error);
            alert("Erro de rede. Não foi possível salvar o produto.");
        }
    }

    // --- Inicia tudo ---
    checkLoginAndLoadData();
});