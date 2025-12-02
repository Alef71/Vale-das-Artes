/*
 * js/dashboard-admin.js
 *
 * VERSÃO 6.0: 
 * - Criação de destaque agora envia foto junto (FormData) igual ao Artesão.
 */

console.log("LOG: dashboard-admin.js (v6.0 - Unified Upload) CARREGADO!");

document.addEventListener("DOMContentLoaded", function() {

    // --- Variáveis de Estado ---
    let currentDestaqueId = null;
    let destaqueAtualTemFoto = false;

    // --- Helpers ---
    function getToken() { return localStorage.getItem('userToken'); }
    // OBS: Certifique-se que API_URL está definida no main.js, senão use '/api'
    const API_BASE = (typeof API_URL !== 'undefined') ? API_URL : '/api';

    // --- Verificação de Login ---
    async function checkLoginAndLoadData() {
        const token = getToken();
        const role = localStorage.getItem('userRole');

        if (!token || role !== 'ROLE_ADMIN') {
            console.warn("Acesso negado.");
            alert("Acesso negado. Administrador requerido.");
            localStorage.clear();
            window.location.href = '/login.html';
            return;
        }
        
        // Carrega os dados iniciais
        loadDestaques();
        loadArtistasPendentes();
        loadTodosArtistas(); 
        loadClientes();
    }

    // --- Seletores do DOM ---
    const formNovoDestaque = document.getElementById('form-novo-destaque');
    const novoDestaqueStatus = document.getElementById('novo-destaque-status');
    const listaDestaquesAtivos = document.getElementById('lista-destaques-ativos');
    const listaArtesaosPendentes = document.getElementById('lista-artesaos-pendentes');
    const listaArtesaosTodos = document.getElementById('lista-artesaos-todos'); 
    const listaClientes = document.getElementById('lista-clientes');

    // Modal de Edição
    const destaqueModal = document.getElementById('editDestaqueModal');
    const editDestaqueIdInput = document.getElementById('edit-destaque-id');
    const formEditarDestaque = document.getElementById('form-editar-destaque');
    const closeButtons = document.querySelectorAll('.close-button, #btn-fechar-destaque-modal');

    // Menu de Foto (Para o Modal de Edição)
    const destaqueFotoPreview = document.getElementById('destaque-foto-preview-menu');
    const inputFotoDestaque = document.getElementById('input-foto-destaque');
    const destaqueFotoMenu = document.getElementById('foto-options-menu-destaque');
    const uploadStatusDestaque = document.getElementById('upload-status-destaque');
    
    // Botões do Menu de Foto
    const btnAdicionarFotoDestaque = document.getElementById('btn-adicionar-foto-destaque');
    const btnAtualizarFotoDestaque = document.getElementById('btn-atualizar-foto-destaque');
    const btnRemoverFotoDestaque = document.getElementById('btn-remover-foto-destaque');
    const btnCancelarFotoDestaque = document.getElementById('btn-cancelar-foto-destaque');


    // ===================================================================
    // --- GESTÃO DE DESTAQUES (CRUD) ---
    // ===================================================================

    async function loadDestaques() {
        if (!listaDestaquesAtivos) return;
        
        listaDestaquesAtivos.innerHTML = '<p>Carregando destaques...</p>';
        try {
            const destaques = await apiClient('/destaques', 'GET');

            if (destaques.length === 0) {
                listaDestaquesAtivos.innerHTML = '<p>Nenhum destaque cadastrado.</p>';
                return;
            }

            // Gera o HTML da lista
            listaDestaquesAtivos.innerHTML = destaques.map(destaque => `
                <div class="destaque-item ${destaque.ativo ? 'ativo' : 'inativo'}">
                    <img src="${destaque.fotoUrl || 'https://via.placeholder.com/100x50?text=Sem+Foto'}" alt="Preview">
                    <div style="flex: 1;">
                        <strong>ID: ${destaque.id} - ${destaque.titulo}</strong>
                        <p style="margin: 5px 0; font-size: 0.9rem; color: #666;">Link: ${destaque.link || 'N/A'}</p>
                        <p style="font-size: 0.8rem;">Status: ${destaque.ativo ? 'ATIVO' : 'INATIVO'}</p>
                    </div>
                    <div class="destaque-acoes">
                        <button class="btn btn-primary btn-editar-destaque" data-id="${destaque.id}" style="margin-right: 5px;">Editar</button>
                        <button class="btn btn-danger btn-deletar-destaque" data-id="${destaque.id}">Deletar</button>
                    </div>
                </div>
            `).join('');

            // Adiciona eventos aos botões criados dinamicamente
            document.querySelectorAll('.btn-editar-destaque').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    // Tenta pegar do array local ou busca na API
                    const destaque = destaques.find(d => d.id == id) || await apiClient(`/destaques/${id}`, 'GET');
                    openDestaqueModal(destaque);
                });
            });

            document.querySelectorAll('.btn-deletar-destaque').forEach(btn => {
                btn.addEventListener('click', (e) => handleDeletarDestaque(e.target.dataset.id));
            });

        } catch (error) {
            console.error(error);
            listaDestaquesAtivos.innerHTML = '<p>Erro ao carregar destaques.</p>';
        }
    }

    // --- NOVA FUNÇÃO DE CRIAR DESTAQUE (Texto + Foto juntos) ---
    async function handleCriarDestaque(e) {
        e.preventDefault();
        
        if(novoDestaqueStatus) novoDestaqueStatus.textContent = 'Publicando...';
        
        const token = getToken();
        // Cria o FormData com todos os inputs do formulário (titulo, link E foto)
        const formData = new FormData(e.target);

        try {
            // Usa fetch nativo para enviar Multipart/Form-Data
            const response = await fetch(`${API_BASE}/destaques`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Não adicionar Content-Type aqui, o browser adiciona boundary automaticamente
                },
                body: formData
            });

            if (response.ok) {
                const novoDestaque = await response.json();
                if(novoDestaqueStatus) {
                    novoDestaqueStatus.textContent = `Sucesso! Destaque ID ${novoDestaque.id} criado.`;
                    novoDestaqueStatus.style.color = 'green';
                }
                formNovoDestaque.reset();
                loadDestaques();
            } else {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Falha ao criar destaque.');
            }
        } catch (error) {
            console.error(error);
            if(novoDestaqueStatus) {
                novoDestaqueStatus.textContent = 'Erro: ' + error.message;
                novoDestaqueStatus.style.color = 'red';
            }
        }
    }

    async function handleDeletarDestaque(id) {
        if (!confirm(`Tem certeza que deseja deletar o destaque ID ${id}?`)) return;
        try {
            await apiClient(`/destaques/${id}`, 'DELETE');
            alert('Destaque deletado.');
            loadDestaques();
        } catch (error) {
            alert('Erro ao deletar destaque.');
        }
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
            alert('Destaque atualizado!');
            closeDestaqueModal();
            loadDestaques();
        } catch (error) {
            alert('Erro ao salvar alterações.');
        }
    }

    // ===================================================================
    // --- LÓGICA DO MODAL (ABRIR/FECHAR) ---
    // ===================================================================

    function openDestaqueModal(destaque) {
        if (!destaque) return;
        
        currentDestaqueId = destaque.id;
        
        // Verifica se tem foto para configurar o menu
        if (destaque.fotoUrl && destaque.fotoUrl.trim() !== "") {
            destaqueAtualTemFoto = true;
            destaqueFotoPreview.src = destaque.fotoUrl;
        } else {
            destaqueAtualTemFoto = false;
            destaqueFotoPreview.src = 'https://via.placeholder.com/200?text=Sem+Foto';
        }

        // Preenche campos do formulário
        document.getElementById('edit-destaque-id-display').textContent = destaque.id;
        document.getElementById('edit-destaque-id').value = destaque.id;
        document.getElementById('edit-destaque-titulo').value = destaque.titulo;
        document.getElementById('edit-destaque-link').value = destaque.link || '';
        document.getElementById('edit-destaque-ativo').checked = destaque.ativo;
        
        // Reseta estados visuais
        if(uploadStatusDestaque) uploadStatusDestaque.textContent = '';
        if(inputFotoDestaque) inputFotoDestaque.value = null; 
        fecharMenuDestaque(); 
        
        // Exibe o modal
        destaqueModal.style.display = 'flex'; 
    }

    function closeDestaqueModal() {
        destaqueModal.style.display = 'none';
        currentDestaqueId = null;
        fecharMenuDestaque();
    }


    // ===================================================================
    // --- LÓGICA DO MENU DE FOTO (MODAL DE EDIÇÃO) ---
    // ===================================================================

    function abrirMenuDestaque(e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

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
        
        destaqueFotoMenu.style.display = 'flex'; 
    }

    function fecharMenuDestaque(e) {
        if (e) e.stopPropagation();
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
            const response = await fetch(`${API_BASE}/destaques/${currentDestaqueId}/foto`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const destaqueAtualizado = await response.json();
                destaqueFotoPreview.src = destaqueAtualizado.fotoUrl;
                destaqueAtualTemFoto = true;
                uploadStatusDestaque.textContent = 'Foto atualizada com sucesso!';
                loadDestaques(); 
            } else {
                throw new Error('Falha no upload.');
            }
        } catch (error) {
            console.error('Erro upload:', error);
            uploadStatusDestaque.textContent = 'Erro ao enviar foto.';
        } finally {
            inputFotoDestaque.value = null;
        }
    }

    async function handleRemoveDestaqueSubmit() {
        if (!currentDestaqueId || !destaqueAtualTemFoto) return;
        
        if (!confirm('Tem certeza que deseja remover a foto?')) {
            fecharMenuDestaque();
            return;
        }
        
        fecharMenuDestaque();
        uploadStatusDestaque.textContent = 'Removendo...';
        
        try {
            await apiClient(`/destaques/${currentDestaqueId}/foto`, 'DELETE');
            
            destaqueFotoPreview.src = 'https://via.placeholder.com/200?text=Sem+Foto';
            destaqueAtualTemFoto = false;
            uploadStatusDestaque.textContent = 'Foto removida.';
            loadDestaques();
        } catch (error) {
            console.error('Erro remover:', error);
            uploadStatusDestaque.textContent = 'Erro ao remover foto.';
        }
    }


    // ===================================================================
    // --- GESTÃO DE USUÁRIOS ---
    // ===================================================================

    async function loadArtistasPendentes() {
        if (!listaArtesaosPendentes) return;
        try {
            const artistas = await apiClient('/artistas/pendentes', 'GET');
            if (artistas.length === 0) {
                listaArtesaosPendentes.innerHTML = '<p>Nenhum artesão pendente.</p>';
                return;
            }
            listaArtesaosPendentes.innerHTML = artistas.map(a => `
                <div class="user-item">
                    <span>${a.nome} (ID: ${a.id}) - ${a.email}</span>
                    <div class="user-acoes">
                        <button class="btn btn-success btn-aprovar-artista" data-id="${a.id}">Aprovar</button>
                        <button class="btn btn-warning btn-reprovar-artista" data-id="${a.id}">Reprovar</button>
                    </div>
                </div>`).join('');
            
            // Eventos
            document.querySelectorAll('.btn-aprovar-artista').forEach(btn => 
                btn.addEventListener('click', (e) => updateArtistaStatus(e.target.dataset.id, 'APROVADO')));
            document.querySelectorAll('.btn-reprovar-artista').forEach(btn => 
                btn.addEventListener('click', (e) => updateArtistaStatus(e.target.dataset.id, 'REPROVADO')));

        } catch (e) { listaArtesaosPendentes.innerHTML = '<p>Erro ao carregar.</p>'; }
    }

    async function updateArtistaStatus(id, status) {
        try {
            await apiClient(`/artistas/${id}/status`, 'PATCH', { status: status });
            alert(`Artista ${status} com sucesso.`);
            loadArtistasPendentes(); 
            loadTodosArtistas(); 
        } catch (e) { alert('Erro ao atualizar status.'); }
    }

    async function loadTodosArtistas() {
        if (!listaArtesaosTodos) return;
        try {
            const artistas = await apiClient('/artistas', 'GET');
            if (artistas.length === 0) {
                listaArtesaosTodos.innerHTML = '<p>Nenhum artesão cadastrado.</p>';
                return;
            }
            listaArtesaosTodos.innerHTML = artistas.map(a => `
                <div class="user-item">
                    <span>${a.nome} (ID: ${a.id}) - Status: ${a.status || 'N/A'}</span>
                    <div class="user-acoes">
                        <button class="btn btn-danger btn-deletar-artista" data-id="${a.id}">Deletar</button>
                    </div>
                </div>`).join('');
            
            document.querySelectorAll('.btn-deletar-artista').forEach(btn => 
                btn.addEventListener('click', (e) => handleDeletarArtista(e.target.dataset.id)));
        } catch (e) { listaArtesaosTodos.innerHTML = '<p>Erro ao carregar lista.</p>'; }
    }

    async function handleDeletarArtista(id) {
        if (!confirm(`Deletar artista ID ${id}?`)) return;
        try {
            await apiClient(`/artistas/${id}`, 'DELETE');
            alert('Artista deletado.');
            loadTodosArtistas(); 
            loadArtistasPendentes(); 
        } catch (error) { alert('Erro ao deletar artista.'); }
    }

    async function loadClientes() {
        if (!listaClientes) return;
        try {
            const clientes = await apiClient('/clientes', 'GET');
            if (clientes.length === 0) {
                listaClientes.innerHTML = '<p>Nenhum cliente cadastrado.</p>';
                return;
            }
            listaClientes.innerHTML = clientes.map(c => `
                <div class="user-item">
                    <span>${c.nome} (ID: ${c.id}) - ${c.email}</span>
                    <div class="user-acoes">
                        <button class="btn btn-danger btn-deletar-cliente" data-id="${c.id}">Deletar</button>
                    </div>
                </div>`).join('');
            
            document.querySelectorAll('.btn-deletar-cliente').forEach(btn => 
                btn.addEventListener('click', (e) => handleDeletarCliente(e.target.dataset.id)));
        } catch (e) { listaClientes.innerHTML = '<p>Erro ao carregar clientes.</p>'; }
    }

    async function handleDeletarCliente(id) {
        if (!confirm(`Deletar cliente ID ${id}?`)) return;
        try {
            await apiClient(`/clientes/${id}`, 'DELETE');
            alert('Cliente deletado.');
            loadClientes();
        } catch (error) { alert('Erro ao deletar cliente.'); }
    }

    // ===================================================================
    // --- EVENT LISTENERS (VÍNCULOS) ---
    // ===================================================================

    // Formulários
    if(formNovoDestaque) formNovoDestaque.addEventListener('submit', handleCriarDestaque);
    if(formEditarDestaque) formEditarDestaque.addEventListener('submit', handleEditarDestaqueSubmit);
    
    // Modal Geral
    closeButtons.forEach(btn => btn.addEventListener('click', closeDestaqueModal));
    window.onclick = function(event) {
        if (event.target == destaqueModal) closeDestaqueModal();
    }

    // Foto Menu (Apenas para o Modal de Edição)
    const wrapper = document.querySelector('.foto-wrapper');
    if (wrapper) wrapper.addEventListener('click', abrirMenuDestaque);
    if (btnCancelarFotoDestaque) btnCancelarFotoDestaque.addEventListener('click', fecharMenuDestaque);
    
    if (btnAdicionarFotoDestaque) btnAdicionarFotoDestaque.addEventListener('click', acionarInputDeArquivoDestaque);
    if (btnAtualizarFotoDestaque) btnAtualizarFotoDestaque.addEventListener('click', acionarInputDeArquivoDestaque);
    
    if (inputFotoDestaque) inputFotoDestaque.addEventListener('change', handleUploadDestaqueSubmit);
    if (btnRemoverFotoDestaque) btnRemoverFotoDestaque.addEventListener('click', handleRemoveDestaqueSubmit);

    // Inicialização
    checkLoginAndLoadData();
});