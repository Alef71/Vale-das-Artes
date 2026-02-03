const API_BASE_URL = 'http://localhost:8080/api';

console.log("LOG: dashboard-artesao.js CARREGADO! API:", API_BASE_URL);

document.addEventListener("DOMContentLoaded", function() {
    
    // Formulários
    const formNovoProduto = document.getElementById('form-novo-produto');
    const formEditarPerfil = document.getElementById('form-editar-artesao');
    const formEditarProduto = document.getElementById('form-editar-produto');
    const formEndereco = document.getElementById('form-endereco');
    
    // Elementos de Exibição
    const listaMeusProdutos = document.getElementById('lista-meus-produtos');
    const sidebarNome = document.getElementById('artesao-nome-display');

    // Elementos de Upload de Foto de Perfil
    const previewFoto = document.getElementById('foto-preview-artista');
    const inputFoto = document.getElementById('input-foto-artista');
    const btnCamera = document.getElementById('btn-camera-upload'); 
    const uploadStatus = document.getElementById('upload-status-artista');

    // Elementos de Upload de Foto de Produto (Preview)
    const inputProdutoFoto = document.getElementById('produto-foto');
    const imgProdutoPreview = document.getElementById('produto-preview-img');
    const divUploadPlaceholder = document.getElementById('upload-placeholder');

    // Elementos de Endereço
    const cepInput = document.getElementById('endereco-cep');
    const btnBuscarCep = document.getElementById('btn-buscar-cep');
    const logradouroInput = document.getElementById('endereco-logradouro');
    const numeroInput = document.getElementById('endereco-numero');
    const complementoInput = document.getElementById('endereco-complemento');
    const bairroInput = document.getElementById('endereco-bairro');
    const cidadeInput = document.getElementById('endereco-cidade');
    const ufInput = document.getElementById('endereco-estado'); // ID correto do HTML
    const telefoneInput = document.getElementById('endereco-telefone'); // Novo campo adicionado

    // Elementos do Modal de Edição
    const editModal = document.getElementById('editProductModal');
    const closeModalButton = editModal ? editModal.querySelector('.close-button') : null;
    
    const editProductIdInput = document.getElementById('edit-produto-id');
    const editProductNameInput = document.getElementById('edit-produto-nome');
    const editProductDescInput = document.getElementById('edit-produto-descricao');
    const editProductPriceInput = document.getElementById('edit-produto-preco');
    const editProductCategoryInput = document.getElementById('edit-produto-categoria');

    // --- Helpers de Autenticação ---
    function getToken() { return localStorage.getItem('userToken'); }
    function getUserId() { return localStorage.getItem('userId'); }

    // --- Cliente API Genérico ---
    async function apiClient(endpoint, method, body = null) {
        const token = getToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Se não for FormData (upload de arquivo), define JSON
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

    // --- Carga Inicial de Dados ---
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
                apiClient(`/produtos/meus-produtos?artistaId=${userId}`, 'GET')
            ]);
            
            if (artista.nome) localStorage.setItem('userName', artista.nome);
            if (artista.fotoUrl) localStorage.setItem('userPhoto', artista.fotoUrl);

            // Atualiza avatar do header se existir
            const headerAvatar = document.getElementById('nav-user-avatar');
            if (headerAvatar && artista.fotoUrl) {
                headerAvatar.src = `${artista.fotoUrl}?t=${new Date().getTime()}`;
            }

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

    // --- Preencher a Tela ---
    function populatePage(artista, produtos) {
        const title = document.getElementById('dashboard-title');
        if(title) title.textContent = `Painel do Artesão - Bem-vindo, ${artista.nome || 'Artesão'}!`;
        if (sidebarNome) sidebarNome.textContent = artista.nome || 'Artesão';

        const linkPerfilPublico = document.getElementById('btn-perfil-publico');
        if (linkPerfilPublico && artista.id) {
            linkPerfilPublico.href = `perfil-artesao.html?id=${artista.id}`;
        }

        // Dados Pessoais
        const elNome = document.getElementById('artesao-nome');
        const elEmpresa = document.getElementById('artesao-nome-empresa');
        const elBio = document.getElementById('artesao-biografia');

        if(elNome) elNome.value = artista.nome || '';
        if(elEmpresa) elEmpresa.value = artista.nomeEmpresa || '';
        if(elBio) elBio.value = artista.biografia || '';

        // Foto de Perfil
        if (previewFoto) {
            const timestamp = new Date().getTime();
            if (artista.fotoUrl) {
                previewFoto.src = `${artista.fotoUrl}?t=${timestamp}`;
            } else {
                previewFoto.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artista.nome || 'A')}&background=333&color=fff&size=150`;
            }
        }

        // --- Preenchimento de Endereço ---
        if (artista && artista.endereco) {
            const setVal = (el, val) => { if(el) el.value = val || ''; };

            setVal(cepInput, artista.endereco.cep);
            setVal(logradouroInput, artista.endereco.logradouro);
            setVal(numeroInput, artista.endereco.numero);
            setVal(complementoInput, artista.endereco.complemento);
            setVal(bairroInput, artista.endereco.bairro);
            setVal(cidadeInput, artista.endereco.cidade);
            setVal(telefoneInput, artista.endereco.telefone); // Telefone
            
            // Lógica para UF/Estado: tenta 'estado', se não tiver, tenta 'uf'
            setVal(ufInput, artista.endereco.estado || artista.endereco.uf); 
        }

        renderProdutos(produtos);
        
        // Dispara evento para atualizar o preview da bio
        const event = new Event('keyup');
        if(elBio) elBio.dispatchEvent(event);
    }

    // --- Lógica de Busca de CEP ---
    async function buscarCep(cep) {
        cep = cep.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                // Feedback visual
                if(logradouroInput) logradouroInput.value = "Buscando...";
                
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                
                if (!data.erro) {
                    if(logradouroInput) logradouroInput.value = data.logradouro;
                    if(bairroInput) bairroInput.value = data.bairro;
                    if(cidadeInput) cidadeInput.value = data.localidade;
                    
                    // ViaCEP retorna 'uf', jogamos no input de estado
                    if(ufInput) ufInput.value = data.uf;
                    
                    if(numeroInput) numeroInput.focus();
                } else {
                    alert("CEP não encontrado.");
                    if(logradouroInput) logradouroInput.value = "";
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
                alert("Erro ao buscar CEP.");
            }
        }
    }

    if (cepInput) {
        cepInput.addEventListener('blur', () => buscarCep(cepInput.value));
    }
    
    if (btnBuscarCep && cepInput) {
        btnBuscarCep.addEventListener('click', () => buscarCep(cepInput.value));
    }

    // --- Upload de Foto de PERFIL ---
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
                    const timestamp = new Date().getTime();
                    const novaUrl = `${artistaAtt.fotoUrl}?t=${timestamp}`;

                    previewFoto.src = novaUrl;
                    localStorage.setItem('userPhoto', artistaAtt.fotoUrl);
                    
                    const headerAvatar = document.getElementById('nav-user-avatar');
                    if (headerAvatar) headerAvatar.src = novaUrl;

                    uploadStatus.textContent = 'Sucesso!';
                    setTimeout(() => { uploadStatus.textContent = ''; }, 3000);
                } else throw new Error("Falha no upload");
            } catch (error) {
                console.error(error);
                uploadStatus.textContent = 'Erro.';
            }
            inputFoto.value = null;
        });
    }

    // --- Preview de Foto do PRODUTO (Novo) ---
    if (inputProdutoFoto) {
        inputProdutoFoto.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    if(imgProdutoPreview) {
                        imgProdutoPreview.src = evt.target.result;
                        imgProdutoPreview.style.display = 'block';
                    }
                    if(divUploadPlaceholder) divUploadPlaceholder.style.display = 'none';
                }
                reader.readAsDataURL(file);
            } else {
                if(imgProdutoPreview) {
                    imgProdutoPreview.style.display = 'none';
                    imgProdutoPreview.src = '';
                }
                if(divUploadPlaceholder) divUploadPlaceholder.style.display = 'flex';
            }
        });
    }

    // --- Renderização de Produtos ---
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
            
            const fotoUrl = produto.fotoUrl ? produto.fotoUrl : 'https://placehold.co/150?text=Sem+Foto';
            
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

    // --- Submit: Dados Pessoais ---
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
                localStorage.setItem('userName', dados.nome);
            } catch (err) { alert(err.message); }
        });
    }

    // --- Submit: Endereço (Atualizado com Telefone e Estado) ---
    if (formEndereco) {
        formEndereco.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const getVal = (el) => el ? el.value : '';

            const dadosEndereco = {
                cep: getVal(cepInput),
                logradouro: getVal(logradouroInput),
                numero: getVal(numeroInput),
                complemento: getVal(complementoInput),
                bairro: getVal(bairroInput),
                cidade: getVal(cidadeInput),
                estado: getVal(ufInput), // Envia como 'estado' (baseado no DTO mais comum)
                telefone: getVal(telefoneInput) // Novo campo
            };

            try {
                await apiClient(`/artistas/${getUserId()}/endereco`, 'PUT', dadosEndereco);
                alert('Endereço e contato atualizados com sucesso!');
            } catch (err) {
                console.error(err);
                alert('Erro ao salvar endereço: ' + err.message);
            }
        });
    }

    // --- Submit: Novo Produto ---
    if (formNovoProduto) {
        formNovoProduto.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nome = formNovoProduto.querySelector('input[name="nome"]').value;
            const descricao = formNovoProduto.querySelector('textarea[name="descricao"]').value;
            const preco = formNovoProduto.querySelector('input[name="preco"]').value;
            const categoria = formNovoProduto.querySelector('select[name="categoria"]').value;
            const arquivoFoto = formNovoProduto.querySelector('input[name="foto"]').files[0];

            if(!arquivoFoto) {
                alert("A foto do produto é obrigatória!");
                return;
            }

            const produtoDTO = {
                nome: nome,
                descricao: descricao,
                preco: parseFloat(preco),
                categoria: categoria
            };

            const finalFormData = new FormData();
            // Backend espera um blob JSON na parte "dados" e arquivo na parte "foto"
            const jsonBlob = new Blob([JSON.stringify(produtoDTO)], { type: 'application/json' });
            finalFormData.append("dados", jsonBlob);
            finalFormData.append("foto", arquivoFoto);

            try {
                const res = await fetch(`${API_BASE_URL}/produtos?artistaId=${getUserId()}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${getToken()}` },
                    body: finalFormData
                });
                
                if(res.ok) {
                    alert('Produto cadastrado!');
                    formNovoProduto.reset();
                    // Limpa preview
                    if(imgProdutoPreview) {
                        imgProdutoPreview.style.display = 'none';
                        imgProdutoPreview.src = '';
                    }
                    if(divUploadPlaceholder) divUploadPlaceholder.style.display = 'flex';
                    
                    checkLoginAndLoadData(); // Recarrega lista
                } else {
                    const erro = await res.json();
                    throw new Error(erro.message || "Erro ao criar produto");
                }
            } catch (err) { 
                alert(err.message); 
            }
        });
    }

    // --- Ações na Lista de Produtos (Inativar/Editar) ---
    if (listaMeusProdutos) {
        listaMeusProdutos.addEventListener('click', async (e) => {
            const target = e.target;
            const id = target.dataset.id;
            if (!id) return; 

            // Botão Inativar/Ativar
            if (target.classList.contains('btn-toggle-status')) {
                if (!confirm(`Alterar status do produto?`)) return;
                try {
                    await apiClient(`/produtos/${id}/toggle-ativo?artistaId=${getUserId()}`, 'PUT');
                    checkLoginAndLoadData(); 
                } catch (err) { alert(err.message); }
            }
            
            // Botão Editar
            if (target.classList.contains('btn-editar-produto')) {
                openEditModal(id); 
            }
        });
    }

    // --- Modal de Edição ---
    async function openEditModal(id) {
        try {
            const produto = await apiClient(`/produtos/${id}`, 'GET');
            if(editProductIdInput) editProductIdInput.value = produto.id;
            if(editProductNameInput) editProductNameInput.value = produto.nome;
            if(editProductDescInput) editProductDescInput.value = produto.descricao;
            if(editProductPriceInput) editProductPriceInput.value = produto.preco;
            if(editProductCategoryInput) editProductCategoryInput.value = produto.categoria;
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
                await apiClient(`/produtos/${id}?artistaId=${getUserId()}`, 'PUT', dados);
                alert('Produto atualizado!');
                closeModal(); 
                checkLoginAndLoadData(); 
            } catch (err) { alert(err.message); }
        });
    }

    // Inicia a aplicação
    checkLoginAndLoadData();
});