/*
 * js/dashboard-admin.js
 *
 * VERSÃO 5.1: (Completa e Otimizada)
 * - Correção do Menu de Foto (stopPropagation)
 * - Integração com a classe .foto-wrapper do HTML
 * - Upload via FormData
 */

console.log("LOG: dashboard-admin.js (v5.1) CARREGADO!");

document.addEventListener("DOMContentLoaded", function() {

    // --- Variáveis de Estado ---
    let currentDestaqueId = null;
    let destaqueAtualTemFoto = false;

    // --- Helpers ---
    function getToken() { return localStorage.getItem('userToken'); }

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

    // Menu de Foto
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

    async function handleCriarDestaque(e) {
        e.preventDefault();
        const titulo = e.target.titulo.value;
        const link = e.target.link.value;

        novoDestaqueStatus.textContent = 'Publicando...';
        try {
            const novoDestaque = await apiClient('/destaques', 'POST', { titulo, link });
            novoDestaqueStatus.textContent = `Sucesso! ID: ${novoDestaque.id}`;
            formNovoDestaque.reset();
            loadDestaques();
        } catch (error) {
            console.error(error);
            novoDestaqueStatus.textContent = 'Erro ao publicar.';
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
        uploadStatusDestaque.textContent = '';
        inputFotoDestaque.value = null; 
        fecharMenuDestaque(); // Garante que o menu comece fechado
        
        // Exibe o modal
        destaqueModal.style.display = 'flex'; 
    }

    function closeDestaqueModal() {
        destaqueModal.style.display = 'none';
        currentDestaqueId = null;
        fecharMenuDestaque();
    }


    // ===================================================================
    // --- LÓGICA DO MENU DE FOTO (O PULO DO GATO) ---
    // ===================================================================

    function abrirMenuDestaque(e) {
        // [IMPORTANTE] Impede que o clique na foto feche o menu ou propague para o fundo
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        if (!destaqueFotoMenu) return; 

        console.log("Abrindo menu de foto..."); 

        // Alterna quais botões aparecem (Adicionar vs Trocar/Remover)
        if (destaqueAtualTemFoto) {
            btnAdicionarFotoDestaque.style.display = 'none';
            btnAtualizarFotoDestaque.style.display = 'block';
            btnRemoverFotoDestaque.style.display = 'block';
        } else {
            btnAdicionarFotoDestaque.style.display = 'block';
            btnAtualizarFotoDestaque.style.display = 'none';
            btnRemoverFotoDestaque.style.display = 'none';
        }
        
        destaqueFotoMenu.style.display = 'flex'; // Exibe o menu
    }

    function fecharMenuDestaque(e) {
        // Se clicar fora, fecha o menu
        if (e) e.stopPropagation();
        if(destaqueFotoMenu) destaqueFotoMenu.style.display = 'none';
    }

    function acionarInputDeArquivoDestaque() {
        inputFotoDestaque.click(); // Abre a janela de seleção de arquivo
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
            // Usa o API_URL global (do main.js)
            const response = await fetch(`${API_URL}/destaques/${currentDestaqueId}/foto`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const destaqueAtualizado = await response.json();
                
                // Atualiza tela na hora
                destaqueFotoPreview.src = destaqueAtualizado.fotoUrl;
                destaqueAtualTemFoto = true;
                
                uploadStatusDestaque.textContent = 'Foto atualizada com sucesso!';
                loadDestaques(); // Atualiza a lista no fundo
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

    // --- EVENTOS DA FOTO (CORRIGIDO) ---
    // 1. Tenta pegar o wrapper novo (div que envolve a foto e o menu)
    const fotoWrapper = document.querySelector('.foto-wrapper');
    if (fotoWrapper) {
        fotoWrapper.addEventListener('click', abrirMenuDestaque);
    } 
    // 2. Fallback: Se não achar o wrapper, tenta a imagem direto
    else if (destaqueFotoPreview) {
        destaqueFotoPreview.addEventListener('click', abrirMenuDestaque);
    }

    // Botões do Menu
    if(btnCancelarFotoDestaque) btnCancelarFotoDestaque.addEventListener('click', fecharMenuDestaque);
    if(btnAdicionarFotoDestaque) btnAdicionarFotoDestaque.addEventListener('click', acionarInputDeArquivoDestaque);
    if(btnAtualizarFotoDestaque) btnAtualizarFotoDestaque.addEventListener('click', acionarInputDeArquivoDestaque);
    if(btnRemoverFotoDestaque) btnRemoverFotoDestaque.addEventListener('click', handleRemoveDestaqueSubmit);
    
    // Upload automático ao selecionar arquivo
    if(inputFotoDestaque) inputFotoDestaque.addEventListener('change', handleUploadDestaqueSubmit);

    // Listas (Delegação de Eventos)
    if(listaArtesaosPendentes) listaArtesaosPendentes.addEventListener('click', e => {
        const id = e.target.dataset.id;
        if (!id) return;
        if (e.target.classList.contains('btn-aprovar-artista')) updateArtistaStatus(id, 'APROVADO');
        if (e.target.classList.contains('btn-reprovar-artista')) updateArtistaStatus(id, 'REPROVADO');
    });

    if(listaArtesaosTodos) listaArtesaosTodos.addEventListener('click', e => {
        const id = e.target.dataset.id;
        if (id && e.target.classList.contains('btn-deletar-artista')) handleDeletarArtista(id);
    });

    if(listaClientes) listaClientes.addEventListener('click', e => {
        const id = e.target.dataset.id;
        if (id && e.target.classList.contains('btn-deletar-cliente')) handleDeletarCliente(id);
    });

    // Inicia tudo
    checkLoginAndLoadData();
});