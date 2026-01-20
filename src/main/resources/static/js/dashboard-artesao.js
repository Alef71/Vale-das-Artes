/*
 * js/dashboard-artesao.js
 * (VERSÃO ATUALIZADA - COM ENDEREÇO E CEP)
 */

const API_BASE_URL = 'http://localhost:8080/api';

console.log("LOG: dashboard-artesao.js CARREGADO! API:", API_BASE_URL);

document.addEventListener("DOMContentLoaded", function() {
    
    // --- Seletores do DOM ---
    const formNovoProduto = document.getElementById('form-novo-produto');
    const formEditarPerfil = document.getElementById('form-editar-artesao');
    const formEditarProduto = document.getElementById('form-editar-produto');
    const formEndereco = document.getElementById('form-endereco'); // NOVO
    const listaMeusProdutos = document.getElementById('lista-meus-produtos');
    const sidebarNome = document.getElementById('artesao-nome-display');

    // Foto
    const previewFoto = document.getElementById('foto-preview-artista');
    const inputFoto = document.getElementById('input-foto-artista');
    const btnCamera = document.getElementById('btn-camera-upload'); 
    const uploadStatus = document.getElementById('upload-status-artista');

    // Inputs Endereço (NOVO)
    const cepInput = document.getElementById('endereco-cep');
    const logradouroInput = document.getElementById('endereco-logradouro');
    const numeroInput = document.getElementById('endereco-numero');
    const complementoInput = document.getElementById('endereco-complemento');
    const bairroInput = document.getElementById('endereco-bairro');
    const cidadeInput = document.getElementById('endereco-cidade');
    const ufInput = document.getElementById('endereco-uf');

    // Modal Editar Produto
    const editModal = document.getElementById('editProductModal');
    const closeModalButton = editModal ? editModal.querySelector('.close-button') : null;
    
    // Inputs Edição Produto
    const editProductIdInput = document.getElementById('edit-produto-id');
    const editProductNameInput = document.getElementById('edit-produto-nome');
    const editProductDescInput = document.getElementById('edit-produto-descricao');
    const editProductPriceInput = document.getElementById('edit-produto-preco');
    const editProductCategoryInput = document.getElementById('edit-produto-categoria');

    // --- Helpers ---
    function getToken() { return localStorage.getItem('userToken'); }
    function getUserId() { return localStorage.getItem('userId'); }

    // Helper API Cliente
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
            throw new Error(errorMsg);
        }
        
        if (response.status === 204) return null;
        return await response.json();
    }

    /**
     * INICIALIZAÇÃO
     */
    async function checkLoginAndLoadData() {
        const token = getToken();
        const role = localStorage.getItem('userRole');
        const userId = getUserId();

        if (!token || !userId || role !== 'ROLE_ARTISTA') {
            alert("Acesso negado ou sessão expirada.");
            window.location.href = 'login.html';
            return;
        }

        try {
            const [artista, produtos] = await Promise.all([
                apiClient(`/artistas/${userId}`, 'GET'),
                apiClient(`/produtos/meus-produtos`, 'GET')
            ]);
            
            populatePage(artista, produtos); 

        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
            if (error.message.includes("404")) {
                alert("Usuário não encontrado.");
                localStorage.clear();
                window.location.href = 'login.html';
            }
        }
    }

    /**
     * PREENCHER PÁGINA
     */
    function populatePage(artista, produtos) {
        // Título e Sidebar
        const title = document.getElementById('dashboard-title');
        if(title) title.textContent = `Painel do Artesão - Bem-vindo, ${artista.nome || 'Artesão'}!`;
        if (sidebarNome) sidebarNome.textContent = artista.nome || 'Artesão';

        // Link Perfil Público
        const linkPerfilPublico = document.getElementById('btn-perfil-publico');
        if (linkPerfilPublico && artista.id) {
            linkPerfilPublico.href = `perfil-artesao.html?id=${artista.id}`;
        }

        // Preencher Form Perfil
        document.getElementById('artesao-nome').value = artista.nome || '';
        document.getElementById('artesao-nome-empresa').value = artista.nomeEmpresa || '';
        document.getElementById('artesao-biografia').value = artista.biografia || '';

        // Foto
        if (previewFoto) {
            const timestamp = new Date().getTime();
            if (artista.fotoUrl) {
                previewFoto.src = `${artista.fotoUrl}?t=${timestamp}`;
            } else {
                previewFoto.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artista.nome || 'A')}&background=333&color=fff&size=150`;
            }
        }

        // --- NOVO: Preencher Endereço ---
        if (artista.endereco) {
            if(cepInput) cepInput.value = artista.endereco.cep || '';
            if(logradouroInput) logradouroInput.value = artista.endereco.logradouro || '';
            if(numeroInput) numeroInput.value = artista.endereco.numero || '';
            if(complementoInput) complementoInput.value = artista.endereco.complemento || '';
            if(bairroInput) bairroInput.value = artista.endereco.bairro || '';
            if(cidadeInput) cidadeInput.value = artista.endereco.cidade || '';
            if(ufInput) ufInput.value = artista.endereco.uf || '';
        }

        renderProdutos(produtos);
        
        // Dispara evento visual para o preview (se existir)
        const event = new Event('keyup');
        if(document.getElementById('artesao-biografia')) document.getElementById('artesao-biografia').dispatchEvent(event);
    }

    // --- NOVO: BUSCA DE CEP (ViaCEP) ---
    if (cepInput) {
        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            if (cep.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    if (!data.erro) {
                        logradouroInput.value = data.logradouro;
                        bairroInput.value = data.bairro;
                        cidadeInput.value = data.localidade;
                        ufInput.value = data.uf;
                        numeroInput.focus();
                    } else {
                        alert("CEP não encontrado.");
                    }
                } catch (error) {
                    console.error("Erro ao buscar CEP:", error);
                }
            }
        });
    }

    // --- UPLOAD DE FOTO ---
    if(btnCamera) btnCamera.addEventListener('click', () => inputFoto.click());
    if(inputFoto) {
        inputFoto.addEventListener('change', async () => {
            const file = inputFoto.files[0];
            if (!file) return;
            uploadStatus.textContent = 'Enviando...';
            
            const userId = getUserId();
            const formData = new FormData();
            formData.append('foto', file); 

            try {
                const response = await fetch(`${API_BASE_URL}/artistas/${userId}/foto`, {
                    method: 'POST', 
                    headers: { 'Authorization': `Bearer ${getToken()}` },
                    body: formData
                });

                if (response.ok) {
                    const artistaAtt = await response.json();
                    previewFoto.src = `${artistaAtt.fotoUrl}?t=${new Date().getTime()}`;
                    uploadStatus.textContent = 'Sucesso!';
                    setTimeout(() => { uploadStatus.textContent = ''; }, 3000);
                } else throw new Error("Falha no upload");
            } catch (error) {
                uploadStatus.textContent = 'Erro.';
            }
            inputFoto.value = null;
        });
    }

    // --- RENDERIZAR PRODUTOS ---
    function renderProdutos(produtos) {
        if (!listaMeusProdutos) return;
        listaMeusProdutos.innerHTML = '';
        if (!produtos || produtos.length === 0) {
            listaMeusProdutos.innerHTML = "<p>Nenhum produto cadastrado.</p>";
            return;
        }
        produtos.forEach(produto => {
            const card = document.createElement('article');
            card.className = `meu-produto-item ${!produto.ativo ? 'inativo' : ''}`; 
            const fotoUrl = produto.fotoUrl || 'https://placehold.co/150?text=Sem+Foto';
            
            const btnStatus = produto.ativo 
                ? `<button class="btn-toggle-status btn-inativar" data-id="${produto.id}">Inativar</button>`
                : `<button class="btn-toggle-status btn-ativar" data-id="${produto.id}">Ativar</button>`;
            
            card.innerHTML = `
                <img src="${fotoUrl}" alt="${produto.nome}" style="width:100px; height:100px; object-fit: cover;">
                <div class="meu-produto-info">
                    <h3>${produto.nome}</h3>
                    <p class="produto-preco">R$ ${(produto.preco || 0).toFixed(2)}</p>
                    <p class="produto-status">Status: <span>${produto.ativo ? 'Ativo' : 'Inativo'}</span></p>
                </div>
                <div class="meu-produto-acoes">
                    <button class="btn-editar-produto" data-id="${produto.id}">Editar</button>
                    ${btnStatus} 
                </div>`;
            listaMeusProdutos.appendChild(card);
        });
    }

    // --- SUBMITS ---
    
    // Perfil
    if (formEditarPerfil) {
        formEditarPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dados = {
                nome: document.getElementById('artesao-nome').value,
                nomeEmpresa: document.getElementById('artesao-nome-empresa').value,
                biografia: document.getElementById('artesao-biografia').value
            };
            try {
                await apiClient(`/artistas/${getUserId()}`, 'PUT', dados);
                alert('Perfil atualizado!');
                if(sidebarNome) sidebarNome.textContent = dados.nome;
            } catch (err) { alert(err.message); }
        });
    }

    // --- NOVO: Submit Endereço ---
    if (formEndereco) {
        formEndereco.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dadosEndereco = {
                cep: cepInput.value,
                logradouro: logradouroInput.value,
                numero: numeroInput.value,
                complemento: complementoInput.value,
                bairro: bairroInput.value,
                cidade: cidadeInput.value,
                uf: ufInput.value
            };

            // NOTA: Dependendo do backend, pode ser '/endereco' ou parte do PUT do artista.
            // Aqui assumimos uma rota específica para manter organizado, ou ajustamos.
            // Se o backend espera tudo junto, teríamos que mesclar com o update de perfil.
            // Vamos tentar uma rota dedicada primeiro, se falhar, você me avisa.
            try {
                // Opção A: Rota específica (Recomendado)
                await apiClient(`/artistas/${getUserId()}/endereco`, 'PUT', dadosEndereco);
                
                // Opção B (Alternativa se não existir rota específica):
                // await apiClient(`/artistas/${getUserId()}`, 'PUT', { endereco: dadosEndereco });
                
                alert('Endereço atualizado com sucesso!');
            } catch (err) {
                alert('Erro ao salvar endereço: ' + err.message);
            }
        });
    }

    // Novo Produto
    if (formNovoProduto) {
        formNovoProduto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formNovoProduto);
            try {
                await fetch(`${API_BASE_URL}/produtos`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${getToken()}` },
                    body: formData
                }).then(async res => {
                    if(res.ok) {
                        alert('Produto cadastrado!');
                        formNovoProduto.reset();
                        checkLoginAndLoadData();
                    } else throw new Error((await res.json()).message);
                });
            } catch (err) { alert(err.message); }
        });
    }

    // Ações na Lista (Delegação de Eventos)
    if (listaMeusProdutos) {
        listaMeusProdutos.addEventListener('click', async (e) => {
            const target = e.target;
            const id = target.dataset.id;
            if (!id) return; 

            if (target.classList.contains('btn-toggle-status')) {
                if (!confirm(`Alterar status?`)) return;
                try {
                    await apiClient(`/produtos/${id}/toggle-status`, 'PUT');
                    checkLoginAndLoadData(); 
                } catch (err) { alert(err.message); }
            }

            if (target.classList.contains('btn-editar-produto')) {
                openEditModal(id); 
            }
        });
    }

    // --- MODAL DE EDIÇÃO ---
    async function openEditModal(id) {
        try {
            const produto = await apiClient(`/produtos/${id}`, 'GET');
            editProductIdInput.value = produto.id;
            editProductNameInput.value = produto.nome;
            editProductDescInput.value = produto.descricao;
            editProductPriceInput.value = produto.preco;
            editProductCategoryInput.value = produto.categoria;
            if(editModal) editModal.style.display = 'block';
        } catch (err) { alert(err.message); }
    }

    function closeModal() { if(editModal) editModal.style.display = 'none'; }
    if(closeModalButton) closeModalButton.onclick = closeModal;
    window.onclick = (e) => { if(e.target == editModal) closeModal(); };

    if (formEditarProduto) {
        formEditarProduto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = editProductIdInput.value;
            const dados = {
                nome: editProductNameInput.value,
                descricao: editProductDescInput.value,
                preco: parseFloat(editProductPriceInput.value), 
                categoria: editProductCategoryInput.value
            };
            try {
                await apiClient(`/produtos/${id}`, 'PUT', dados);
                alert('Produto atualizado!');
                closeModal(); 
                checkLoginAndLoadData(); 
            } catch (err) { alert(err.message); }
        });
    }

    // Start
    checkLoginAndLoadData();
});