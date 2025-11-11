/*
 * js/dashboard-admin.js
 *
 * VERSÃO 3.1: (Corrigida para usar a 'API_URL' do seu main.js)
 * - Remove 'API_BASE_URL' duplicada.
 * - Adiciona a função handleDeletarArtista(id)
 * - Mantém o gerenciador de fotos estilo "menu" para Destaques.
 */

// A constante API_URL agora é lida do main.js. Não definimos aqui.

console.log("LOG: dashboard-admin.js (v3.1 - Usando API_URL) CARREGADO!");

document.addEventListener("DOMContentLoaded", function() {

    // --- Funções Helper de Autenticação ---
    function getToken() {
        return localStorage.getItem('userToken');
    }

    // --- Verificação de Login ---
    async function checkLoginAndLoadData() {
        const token = getToken();
        const role = localStorage.getItem('userRole');

        if (!token || role !== 'ROLE_ADMIN') {
            console.warn("Acesso negado: Token ou Role de Admin ausente/inválido.");
            alert("Acesso negado. Por favor, faça o login como administrador.");
            localStorage.clear();
            window.location.href = '/login.html';
            return;
        }

        // Carrega todos os módulos da página
        loadDestaques();
        loadArtistasPendentes();
        loadTodosArtistas(); 
        loadClientes();
    }

    // --- Seletores do DOM (Comuns) ---
    const formNovoDestaque = document.getElementById('form-novo-destaque');
    const novoDestaqueStatus = document.getElementById('novo-destaque-status');
    const listaDestaquesAtivos = document.getElementById('lista-destaques-ativos');
    const listaArtesaosPendentes = document.getElementById('lista-artesaos-pendentes');
    const listaArtesaosTodos = document.getElementById('lista-artesaos-todos'); 
    const listaClientes = document.getElementById('lista-clientes');

    // --- Seletores do DOM (Modal Destaque) ---
    const destaqueModal = document.getElementById('editDestaqueModal');
    const formEditarDestaque = document.getElementById('form-editar-destaque');
    const editDestaqueIdInput = document.getElementById('edit-destaque-id');
    const closeButtons = document.querySelectorAll('.close-button, #btn-fechar-destaque-modal');

    // --- Seletores do DOM (Modal Foto Destaque - ESTILO MENU) ---
    const destaqueFotoPreview = document.getElementById('destaque-foto-preview-menu');
    const inputFotoDestaque = document.getElementById('input-foto-destaque');
    const destaqueFotoMenu = document.getElementById('foto-options-menu-destaque');
    const uploadStatusDestaque = document.getElementById('upload-status-destaque');
    const btnAdicionarFotoDestaque = document.getElementById('btn-adicionar-foto-destaque');
    const btnAtualizarFotoDestaque = document.getElementById('btn-atualizar-foto-destaque');
    const btnRemoverFotoDestaque = document.getElementById('btn-remover-foto-destaque');
    const btnCancelarFotoDestaque = document.getElementById('btn-cancelar-foto-destaque');


    // ===================================================================
    // --- GESTÃO DE DESTAQUES (CRUD + FOTO) ---
    // ===================================================================

    async function loadDestaques() {
        if (!listaDestaquesAtivos) {
            console.warn("Elemento #lista-destaques-ativos não encontrado.");
            return; 
        }
        listaDestaquesAtivos.innerHTML = '<p>Carregando destaques...</p>';
        try {
            // Usa apiClient (do main.js)
            const destaques = await apiClient('/destaques', 'GET');

            if (destaques.length === 0) {
                listaDestaquesAtivos.innerHTML = '<p>Nenhum destaque cadastrado.</p>';
                return;
            }

            listaDestaquesAtivos.innerHTML = destaques.map(destaque => `
                <div class="destaque-item ${destaque.ativo ? 'ativo' : 'inativo'}">
                    <img src="${destaque.fotoUrl || 'https://via.placeholder.com/100x50?text=Sem+Foto'}" alt="Preview">
                    <div class="destaque-info">
                        <strong>ID: ${destaque.id} - ${destaque.titulo}</strong>
                        <p>Link: ${destaque.link || 'N/A'}</p>
                        <p>Status: ${destaque.ativo ? 'ATIVO' : 'INATIVO'}</p>
                    </div>
                    <div class="destaque-acoes">
                        <button class="btn btn-primary btn-editar-destaque" data-id="${destaque.id}">Editar</button>
                        <button class="btn btn-danger btn-deletar-destaque" data-id="${destaque.id}">Deletar</button>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.btn-editar-destaque').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    try {
                        const destaque = destaques.find(d => d.id == id);
                        if (destaque) {
                            openDestaqueModal(destaque);
                        } else {
                            const destaqueCompleto = await apiClient(`/destaques/${id}`, 'GET');
                            openDestaqueModal(destaqueCompleto);
                        }
                    } catch (error) {
                        alert("Erro ao buscar dados do destaque para edição.");
                    }
                });
            });

            document.querySelectorAll('.btn-deletar-destaque').forEach(btn => {
                btn.addEventListener('click', (e) => handleDeletarDestaque(e.target.dataset.id));
            });

        } catch (error) {
            console.error("Erro ao carregar destaques:", error);
            listaDestaquesAtivos.innerHTML = '<p>Erro ao carregar destaques.</p>';
        }
    }

    async function handleCriarDestaque(e) {
        e.preventDefault();
        const titulo = e.target.titulo.value;
        const link = e.target.link.value;

        novoDestaqueStatus.textContent = 'Publicando...';
        try {
            const novoDestaque = await apiClient('/destaques', 'POST', { titulo, link });
            novoDestaqueStatus.textContent = `Destaque ID ${novoDestaque.id} criado com sucesso!`;
            formNovoDestaque.reset();
            loadDestaques();
        } catch (error) {
            console.error("Erro ao criar destaque:", error);
            novoDestaqueStatus.textContent = 'Erro ao publicar destaque.';
        }
    }

    async function handleDeletarDestaque(id) {
        if (!confirm(`Tem certeza que deseja deletar o destaque ID ${id}?`)) return;
        try {
            await apiClient(`/destaques/${id}`, 'DELETE');
            alert('Destaque deletado com sucesso.');
            loadDestaques();
        } catch (error) {
            console.error("Erro ao deletar destaque:", error);
            alert('Erro ao deletar destaque.');
        }
    }

    // --- Funções do Modal de Destaque ---

    function openDestaqueModal(destaque) {
        if (!destaque) return;
        currentDestaqueId = destaque.id;
        destaqueAtualTemFoto = !!destaque.fotoUrl;
        document.getElementById('edit-destaque-id-display').textContent = destaque.id;
        document.getElementById('edit-destaque-id').value = destaque.id;
        document.getElementById('edit-destaque-titulo').value = destaque.titulo;
        document.getElementById('edit-destaque-link').value = destaque.link || '';
        document.getElementById('edit-destaque-ativo').checked = destaque.ativo;
        destaqueFotoPreview.src = destaque.fotoUrl || 'https://via.placeholder.com/200?text=Sem+Foto';
        uploadStatusDestaque.textContent = '';
        inputFotoDestaque.value = null; 
        destaqueModal.style.display = 'block';
    }

    function closeDestaqueModal() {
        destaqueModal.style.display = 'none';
        currentDestaqueId = null;
        fecharMenuDestaque();
    }

    async function handleEditarDestaqueSubmit(e) {
        e.preventDefault();
        const id = editDestaqueIdInput.value;
        const body = {
            titulo: document.getElementById('edit-destaque-titulo').value,
            link: document.getElementById('edit-destaque-link').value,
            ativo: document.getElementById('edit-destaque-ativo').checked
        };
        try {
            await apiClient(`/destaques/${id}`, 'PUT', body);
            alert('Destaque atualizado com sucesso!');
            closeDestaqueModal();
            loadDestaques();
        } catch (error) {
            console.error("Erro ao atualizar destaque:", error);
            alert('Erro ao salvar alterações.');
        }
    }

    // --- Funções da Foto de Destaque (ESTILO MENU) ---

    function abrirMenuDestaque() {
        if (!destaqueFotoMenu) return; 
        if (destaqueAtualTemFoto) {
            btnAdicionarFotoDestaque.style.display = 'none';
            btnAtualizarFotoDestaque.style.display = 'block';
            btnRemoverFotoDestaque.style.display = 'block';
        } else {
            btnAdicionarFotoDestaque.style.display = 'block';
            btnAtualizarFotoDestaque.style.display = 'none';
            btnRemoverFotoDestaque.style.display = 'none';
        }
        destaqueFotoMenu.style.display = 'block';
    }

    function fecharMenuDestaque() {
        if(destaqueFotoMenu) destaqueFotoMenu.style.display = 'none';
    }

    function acionarInputDeArquivoDestaque() {
        inputFotoDestaque.click();
        fecharMenuDestaque();
    }

    async function handleUploadDestaqueSubmit() {
        const file = inputFotoDestaque.files[0];
        if (!file || !currentDestaqueId) return;

        uploadStatusDestaque.textContent = 'Enviando...';
        const token = getToken();
        const formData = new FormData();
        formData.append('foto', file);

        try {
            // [ CORREÇÃO v3.1 ] 
            // Usa a variável 'API_URL' que está no main.js
            const response = await fetch(`${API_URL}/destaques/${currentDestaqueId}/foto`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const destaqueAtualizado = await response.json();
                destaqueFotoPreview.src = destaqueAtualizado.fotoUrl;
                destaqueAtualTemFoto = true;
                uploadStatusDestaque.textContent = 'Foto atualizada!';
                loadDestaques();
            } else {
                throw new Error('Falha no upload.');
            }
        } catch (error) {
            console.error('Erro no upload da foto do destaque:', error);
            uploadStatusDestaque.textContent = 'Erro ao enviar foto.';
        } finally {
            inputFotoDestaque.value = null;
        }
    }

    async function handleRemoveDestaqueSubmit() {
        if (!currentDestaqueId || !destaqueAtualTemFoto) return;
        if (!confirm('Tem certeza que deseja remover a foto deste destaque?')) {
            fecharMenuDestaque();
            return;
        }
        fecharMenuDestaque();
        uploadStatusDestaque.textContent = 'Removendo...';
        try {
            // apiClient (do main.js) lida com isso
            await apiClient(`/destaques/${currentDestaqueId}/foto`, 'DELETE');
            destaqueFotoPreview.src = 'https://via.placeholder.com/200?text=Sem+Foto';
            destaqueAtualTemFoto = false;
            uploadStatusDestaque.textContent = 'Foto removida.';
            loadDestaques();
        } catch (error) {
            console.error('Erro ao remover foto:', error);
            uploadStatusDestaque.textContent = 'Erro ao remover foto.';
        }
    }


    // ===================================================================
    // --- GESTÃO DE USUÁRIOS (ARTISTAS PENDENTES) ---
    // ===================================================================

    async function loadArtistasPendentes() {
        if (!listaArtesaosPendentes) return;
        listaArtesaosPendentes.innerHTML = '<p>Carregando...</p>';
        try {
            const artistas = await apiClient('/artistas/pendentes', 'GET');
            if (artistas.length === 0) {
                listaArtesaosPendentes.innerHTML = '<p>Nenhum artesão pendente de aprovação.</p>';
                return;
            }
            listaArtesaosPendentes.innerHTML = artistas.map(artista => `
                <div class="user-item">
                    <span>${artista.nome} (ID: ${artista.id}) - ${artista.email}</span>
                    <div class="user-acoes">
                        <button class="btn btn-success btn-aprovar-artista" data-id="${artista.id}">Aprovar</button>
                        <button class="btn btn-warning btn-reprovar-artista" data-id="${artista.id}">Reprovar</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error("Erro ao carregar artistas pendentes:", error);
            listaArtesaosPendentes.innerHTML = '<p>Erro ao carregar artistas.</p>';
        }
    }

    async function updateArtistaStatus(id, status) {
        const body = { status: status }; // "APROVADO" ou "REPROVADO"
        try {
            await apiClient(`/artistas/${id}/status`, 'PATCH', body);
            alert(`Artista ${status.toLowerCase()} com sucesso.`);
            loadArtistasPendentes(); 
            loadTodosArtistas(); 
        } catch (error) {
            console.error(`Erro ao ${status.toLowerCase()} artista:`, error);
            alert('Erro ao atualizar status do artista.');
        }
    }

    // ===================================================================
    // --- GESTÃO DE USUÁRIOS (TODOS OS ARTISTAS - DELETAR) ---
    // ===================================================================
    
    async function loadTodosArtistas() {
        if (!listaArtesaosTodos) {
            console.warn("Elemento #lista-artesaos-todos não encontrado.");
            return;
        }
        listaArtesaosTodos.innerHTML = '<p>Carregando...</p>';
        try {
            const artistas = await apiClient('/artistas', 'GET');
            if (artistas.length === 0) {
                listaArtesaosTodos.innerHTML = '<p>Nenhum artesão cadastrado no sistema.</p>';
                return;
            }
            listaArtesaosTodos.innerHTML = artistas.map(artista => `
                <div class="user-item">
                    <span>${artista.nome} (ID: ${artista.id}) - Status: ${artista.status || 'N/A'}</span>
                    <div class="user-acoes">
                        <button class="btn btn-danger btn-deletar-artista" data-id="${artista.id}">Deletar</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error("Erro ao carregar todos os artistas:", error);
            listaArtesaosTodos.innerHTML = '<p>Erro ao carregar lista de artistas.</p>';
        }
    }

    async function handleDeletarArtista(id) {
        if (!confirm(`Tem certeza que deseja DELETAR PERMANENTEMENTE o artista ID ${id}? Esta ação não pode ser desfeita.`)) return;
        try {
            await apiClient(`/artistas/${id}`, 'DELETE');
            alert('Artista deletado com sucesso.');
            loadTodosArtistas(); 
            loadArtistasPendentes(); 
        } catch (error) {
            console.error("Erro ao deletar artista:", error);
            alert('Erro ao deletar artista.');
        }
    }

    // ===================================================================
    // --- GESTÃO DE USUÁRIOS (CLIENTES) ---
    // ===================================================================

    async function loadClientes() {
        if (!listaClientes) return;
        listaClientes.innerHTML = '<p>Carregando...</p>';
        try {
            const clientes = await apiClient('/clientes', 'GET');
            if (clientes.length === 0) {
                listaClientes.innerHTML = '<p>Nenhum cliente cadastrado.</p>';
                return;
            }
            listaClientes.innerHTML = clientes.map(cliente => `
                <div class="user-item">
                    <span>${cliente.nome} (ID: ${cliente.id}) - ${cliente.email}</span>
                    <div class="user-acoes">
                        <button class="btn btn-danger btn-deletar-cliente" data-id="${cliente.id}">Deletar</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
            listaClientes.innerHTML = '<p>Erro ao carregar clientes. (Endpoint /api/clientes existe?)</p>';
        }
    }

    async function handleDeletarCliente(id) {
        if (!confirm(`Tem certeza que deseja deletar o cliente ID ${id}?`)) return;
        try {
            await apiClient(`/clientes/${id}`, 'DELETE');
            alert('Cliente deletado com sucesso.');
            loadClientes();
        } catch (error) {
            console.error("Erro ao deletar cliente:", error);
            alert('Erro ao deletar cliente. (Endpoint /api/clientes/{id} existe?)');
        }
    }

    // ===================================================================
    // --- ANEXAR EVENT LISTENERS (PONTO DE PARTIDA) ---
    // ===================================================================

    if(formNovoDestaque) formNovoDestaque.addEventListener('submit', handleCriarDestaque);
    if(formEditarDestaque) formEditarDestaque.addEventListener('submit', handleEditarDestaqueSubmit);
    closeButtons.forEach(btn => btn.addEventListener('click', closeDestaqueModal));
    window.onclick = function(event) {
        if (event.target == destaqueModal) {
            closeDestaqueModal();
        }
    }
    if(destaqueFotoPreview) destaqueFotoPreview.addEventListener('click', abrirMenuDestaque);
    if(btnCancelarFotoDestaque) btnCancelarFotoDestaque.addEventListener('click', fecharMenuDestaque);
    if(btnAdicionarFotoDestaque) btnAdicionarFotoDestaque.addEventListener('click', acionarInputDeArquivoDestaque);
    if(btnAtualizarFotoDestaque) btnAtualizarFotoDestaque.addEventListener('click', acionarInputDeArquivoDestaque);
    if(btnRemoverFotoDestaque) btnRemoverFotoDestaque.addEventListener('click', handleRemoveDestaqueSubmit);
    if(inputFotoDestaque) inputFotoDestaque.addEventListener('change', handleUploadDestaqueSubmit);

    // Delegação de Eventos
    if(listaArtesaosPendentes) listaArtesaosPendentes.addEventListener('click', e => {
        const target = e.target;
        const id = target.dataset.id;
        if (!id) return;
        if (target.classList.contains('btn-aprovar-artista')) {
            updateArtistaStatus(id, 'APROVADO');
        } else if (target.classList.contains('btn-reprovar-artista')) {
            updateArtistaStatus(id, 'REPROVADO');
        }
    });

    if(listaArtesaosTodos) listaArtesaosTodos.addEventListener('click', e => {
        const target = e.target;
        const id = target.dataset.id;
        if (!id) return;
        if (target.classList.contains('btn-deletar-artista')) {
            handleDeletarArtista(id);
        }
    });

    if(listaClientes) listaClientes.addEventListener('click', e => {
        const target = e.target;
        const id = target.dataset.id;
        if (!id) return;
        if (target.classList.contains('btn-deletar-cliente')) {
            handleDeletarCliente(id);
        }
    });

    // --- Iniciar a página ---
    checkLoginAndLoadData();
});