/*
 * js/dashboard-artesao.js
 * (VERSÃO CORRIGIDA)
 *
 * O bug 'API_BASE_URL is not defined' foi corrigido.
 * A constante foi re-adicionada na linha 7.
 */
const API_BASE_URL = '/api'; // <-- ESTA É A CORREÇÃO

console.log("LOG: dashboard-artesao.js v9 (Corrigido) CARREGADO!");

let artistaPossuiFoto = false; // Variável global para controlar o estado da foto

document.addEventListener("DOMContentLoaded", function() {
    
    console.log("LOG: DOMContentLoaded disparado.");

    // --- Seletores do DOM (Formulários) ---
    const formNovoProduto = document.getElementById('form-novo-produto');
    const formEditarPerfil = document.getElementById('form-editar-artesao');
    const formEditarProduto = document.getElementById('form-editar-produto');

    // --- Seletores do DOM (Listas e Modais) ---
    const listaMeusProdutos = document.getElementById('lista-meus-produtos');
    const editModal = document.getElementById('editProductModal');
    const closeModalButton = editModal ? editModal.querySelector('.close-button') : null;
    
    // --- Seletores do DOM (Campos do Modal de Edição) ---
    const editProductIdInput = document.getElementById('edit-produto-id');
    const editProductNameInput = document.getElementById('edit-produto-nome');
    const editProductDescInput = document.getElementById('edit-produto-descricao');
    const editProductPriceInput = document.getElementById('edit-produto-preco');
    const editProductCategoryInput = document.getElementById('edit-produto-categoria');
    
    // --- Seletores do DOM (Foto de Perfil) ---
    const previewFoto = document.getElementById('foto-preview-artista');
    const inputFoto = document.getElementById('input-foto-artista');
    const menu = document.getElementById('foto-options-menu');
    const uploadStatus = document.getElementById('upload-status-artista');
    const btnAdicionar = document.getElementById('btn-adicionar-foto');
    const btnAtualizar = document.getElementById('btn-atualizar-foto');
    const btnRemover = document.getElementById('btn-remover-foto');
    const btnCancelar = document.getElementById('btn-cancelar-foto');

    // --- Funções Helper de Autenticação ---
    function getToken() {
        return localStorage.getItem('userToken');
    }
    function getUserId() {
        return localStorage.getItem('userId');
    }

    /**
     * Função principal: Verifica o login e carrega todos os dados da página.
     */
    async function checkLoginAndLoadData() {
        const token = getToken();
        const role = localStorage.getItem('userRole');
        const userId = getUserId();

        if (!token || !userId || role !== 'ROLE_ARTISTA') {
            console.warn("Acesso negado: Token, User ID ou Role de Artista ausente/inválido.");
            alert("Acesso negado. Por favor, faça o login como artesão.");
            localStorage.clear();
            window.location.href = '/login.html';
            return;
        }

        try {
            // (Usando a função apiClient global do main.js)
            const artista = await apiClient(`/artistas/${userId}`, 'GET');
            const produtos = await apiClient(`/produtos/meus-produtos`, 'GET');
            
            populatePage(artista, produtos); 

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            alert("Erro ao conectar ao servidor para buscar seus dados: " + error.message);
        }
    }

    /**
     * Preenche a página com os dados do artesão e seus produtos.
     */
    function populatePage(artista, produtos) {
        document.getElementById('dashboard-title').textContent = `Painel do Artesão - Bem-vindo, ${artista.nome || 'Artesão'}!`;
        
        const artesaoNomeInput = document.getElementById('artesao-nome');
        const artesaoEmpresaInput = document.getElementById('artesao-nome-empresa');
        const artesaoBiografiaInput = document.getElementById('artesao-biografia'); 

        if (artesaoNomeInput) artesaoNomeInput.value = artista.nome || '';
        if (artesaoEmpresaInput) artesaoEmpresaInput.value = artista.nomeEmpresa || '';
        if (artesaoBiografiaInput) artesaoBiografiaInput.value = artista.biografia || ''; 
        
        if (previewFoto) {
            if (artista.fotoUrl) {
                previewFoto.src = artista.fotoUrl;
                artistaPossuiFoto = true;
            } else {
                previewFoto.src = 'https://via.placeholder.com/200?text=Sem+Foto';
                artistaPossuiFoto = false;
            }
        }
        
        renderProdutos(produtos);
    }

    /**
     * Renderiza a lista de produtos do artesão.
     */
    function renderProdutos(produtos) {
        if (!listaMeusProdutos) return;
        if (!produtos || produtos.length === 0) {
            listaMeusProdutos.innerHTML = "<p>Você ainda não cadastrou nenhum produto.</p>";
            return;
        }
        listaMeusProdutos.innerHTML = ''; 
        produtos.forEach(produto => {
            const card = document.createElement('article');
            card.className = `meu-produto-item ${!produto.ativo ? 'inativo' : ''}`; 
            const fotoUrl = produto.fotoUrl || 'https://via.placeholder.com/100';
            let botaoToggle = produto.ativo 
                ? `<button class="btn-toggle-status btn-inativar" data-id="${produto.id}">Inativar</button>`
                : `<button class="btn-toggle-status btn-ativar" data-id="${produto.id}">Ativar</button>`;
            
            card.innerHTML = `
                <img src="${fotoUrl}" alt="${produto.nome || '?'}" style="width:100px; height:100px; object-fit: cover;">
                <div class="meu-produto-info">
                    <h3>${produto.nome || '?'}</h3>
                    <p class="produto-preco">R$ ${(produto.preco || 0).toFixed(2)}</p>
                    <p class="produto-status">Status: <span>${produto.ativo ? 'Ativo' : 'Inativo'}</span></p>
                </div>
                <div class="meu-produto-acoes">
                    <button class="btn-editar-produto" data-id="${produto.id}">Editar</button>
                    ${botaoToggle} 
                </div>`;
            listaMeusProdutos.appendChild(card);
        });
    }

    /**
     * Lida com o envio do formulário de EDIÇÃO DE PERFIL.
     */
    async function handleUpdateProfileSubmit(event) {
        event.preventDefault(); 
        const userId = getUserId();
        const token = getToken();

        const dadosAtualizados = {
            nome: document.getElementById('artesao-nome').value.trim(),
            nomeEmpresa: document.getElementById('artesao-nome-empresa').value.trim(),
            biografia: document.getElementById('artesao-biografia').value.trim() 
        };

        try {
            // (apiClient é do main.js)
            await apiClient(`/artistas/${userId}`, 'PUT', dadosAtualizados);
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Erro na atualização do perfil:', error);
            alert(`Falha ao atualizar o perfil. ${error.message}`);
        }
    }

    /**
     * Lida com o envio do formulário de NOVO PRODUTO.
     */
    async function handleNewProductSubmit(event) {
        event.preventDefault();
        const token = getToken();
        if (!token) {
            alert('Sessão expirada. Faça login.');
            return;
        }

        const formData = new FormData(formNovoProduto);
        
        try {
            // (Usamos fetch + API_BASE_URL porque apiClient não lida com FormData)
            const response = await fetch(`${API_BASE_URL}/produtos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                alert('Produto cadastrado com sucesso!');
                formNovoProduto.reset();
                checkLoginAndLoadData(); // Recarrega a página
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Falha ao cadastrar produto.');
            }
        } catch (error) {
            console.error('Erro ao cadastrar produto:', error);
            alert('Erro: ' + error.message);
        }
    }

    /**
     * Lida com cliques nos botões da lista de produtos (Editar, Ativar/Inativar).
     */
    async function handleProdutoActionClick(event) {
        const target = event.target;
        const token = getToken();
        const id = target.dataset.id;
        
        if (!id) return; 

        if (target.classList.contains('btn-toggle-status')) {
            const acao = target.classList.contains('btn-inativar') ? 'INATIVAR' : 'ATIVAR';
            if (!confirm(`Tem certeza que deseja ${acao} o produto ID ${id}?`)) return;
            
            try {
                // (apiClient é do main.js)
                await apiClient(`/produtos/${id}/toggle-status`, 'PUT');
                alert(`Produto ${acao.toLowerCase()} com sucesso!`);
                checkLoginAndLoadData(); 
            } catch (error) { 
                console.error(`Erro:`, error); 
                alert(`Erro: ${error.message}`); 
            }
        }

        if (target.classList.contains('btn-editar-produto')) {
            openEditModal(id); 
        }
    }

    /**
     * Abre o modal de edição de produto e busca os dados do produto.
     */
    async function openEditModal(productId) {
        try {
            // (apiClient é do main.js)
            const produto = await apiClient(`/produtos/${productId}`, 'GET');

            editProductIdInput.value = produto.id;
            editProductNameInput.value = produto.nome;
            editProductDescInput.value = produto.descricao;
            editProductPriceInput.value = produto.preco;
            editProductCategoryInput.value = produto.categoria;

            if(editModal) editModal.style.display = 'block';

        } catch (error) {
            console.error("Erro ao abrir modal de edição:", error);
            alert("Não foi possível carregar os dados para edição: " + error.message);
        }
    }

    function closeModal() {
        if (editModal) {
            editModal.style.display = 'none';
        }
    }

    /**
     * Lida com o envio do formulário de EDIÇÃO DE PRODUTO (dentro do modal).
     */
    async function handleEditFormSubmit(event) {
        event.preventDefault(); 
        const productId = editProductIdInput.value;

        const updatedProductData = {
            nome: editProductNameInput.value,
            descricao: editProductDescInput.value,
            preco: parseFloat(editProductPriceInput.value), 
            categoria: editProductCategoryInput.value
        };

        try {
            // (apiClient é do main.js)
            await apiClient(`/produtos/${productId}`, 'PUT', updatedProductData);
            alert('Produto atualizado com sucesso!');
            closeModal(); 
            checkLoginAndLoadData(); 
        } catch (error) {
            console.error("Erro ao salvar edição:", error);
            alert("Erro ao salvar as alterações: " + error.message);
        }
    }
    

    // --- Funções da Foto de Perfil ---

    function abrirMenu() {
        if (artistaPossuiFoto) {
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

    function fecharMenu() {
        menu.style.display = 'none';
    }

    function acionarInputDeArquivo() {
        inputFoto.click(); 
        fecharMenu();
    }

    async function handleUploadFotoSubmit() {
        const file = inputFoto.files[0];
        if (!file) return; 

        uploadStatus.textContent = 'Enviando...';
        
        const token = getToken();
        const artistaId = getUserId();
        const formData = new FormData();
        formData.append('foto', file); 

        try {
            // (Usamos fetch + API_BASE_URL porque apiClient não lida com FormData)
            const response = await fetch(`${API_BASE_URL}/artistas/${artistaId}/foto`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const artistaAtualizado = await response.json();
                previewFoto.src = artistaAtualizado.fotoUrl;
                artistaPossuiFoto = true; 
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

    async function handleRemoveSubmit() {
        if (!confirm('Tem certeza que deseja remover sua foto de perfil?')) {
            fecharMenu();
            return;
        }
        
        fecharMenu();
        uploadStatus.textContent = 'Removendo...';
        const artistaId = getUserId();

        try {
            // (apiClient é do main.js)
            const artistaAtualizado = await apiClient(`/artistas/${artistaId}/foto`, 'DELETE');
            
            previewFoto.src = 'https://via.placeholder.com/200?text=Sem+Foto';
            artistaPossuiFoto = false; 
            uploadStatus.textContent = 'Foto removida.';
        } catch (error) {
            console.error('Erro ao remover foto:', error);
            uploadStatus.textContent = 'Erro ao remover foto.';
        }
    }

    // --- Ponto de Partida: Anexar todos os Event Listeners ---
    
    // Formulários
    if (formEditarPerfil) formEditarPerfil.addEventListener('submit', handleUpdateProfileSubmit);
    if (formNovoProduto) formNovoProduto.addEventListener('submit', handleNewProductSubmit);
    if (formEditarProduto) formEditarProduto.addEventListener('submit', handleEditFormSubmit);

    // Modal
    if (closeModalButton) closeModalButton.onclick = closeModal;
    window.onclick = function(event) {
        if (event.target == editModal) {
            closeModal();
        }
    }

    // Lista de Produtos (Delegação de Eventos)
    if (listaMeusProdutos) listaMeusProdutos.addEventListener('click', handleProdutoActionClick);

    // Botões de Foto de Perfil
    if (previewFoto) previewFoto.addEventListener('click', abrirMenu);
    if (btnCancelar) btnCancelar.addEventListener('click', fecharMenu);
    if (btnAdicionar) btnAdicionar.addEventListener('click', acionarInputDeArquivo);
    if (btnAtualizar) btnAtualizar.addEventListener('click', acionarInputDeArquivo);
    if (btnRemover) btnRemover.addEventListener('click', handleRemoveSubmit);
    if (inputFoto) inputFoto.addEventListener('change', handleUploadFotoSubmit);
    

    // --- Iniciar a página ---
    checkLoginAndLoadData();
});