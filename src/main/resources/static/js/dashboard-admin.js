console.log("LOG: dashboard-admin.js INICIADO");

document.addEventListener("DOMContentLoaded", function() {

    function getToken() { 
        return localStorage.getItem('userToken'); 
    }
    
    const API_BASE = (typeof API_URL !== 'undefined') ? API_URL : 'http://localhost:8080';

    async function checkLoginAndLoadData() {
        const token = getToken();
        const role = localStorage.getItem('userRole'); 

        if (!token || !role || !role.includes('ADMIN')) {
            console.warn("Acesso negado: Usuário não é admin ou não está logado.");
            alert("Área restrita para Administradores.");
            window.location.href = 'login.html';
            return;
        }
        
        console.log("Login verificado. Carregando dados...");
        
        loadDestaques();
        loadAvaliacoes();
        loadUsuarios();
    }

    function loadUsuarios() {
        loadArtistasPendentes();
        loadTodosArtistas();
        loadClientes();
    }

    async function apiClient(endpoint, method = 'GET', body = null) {
        const token = getToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        if (body && !(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const config = {
            method: method,
            headers: headers
        };

        if (body) {
            config.body = (body instanceof FormData) ? body : JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
            
            if (response.status === 204) return null;
            
            return await response.json();
        } catch (error) {
            console.error(`Erro em ${endpoint}:`, error);
            throw error;
        }
    }

    const listaAvaliacoes = document.getElementById('lista-avaliacoes-todas');

    async function loadAvaliacoes() {
        if(!listaAvaliacoes) return;
        listaAvaliacoes.innerHTML = '<p>Buscando avaliações...</p>';

        try {
            const data = await apiClient('/avaliacoes', 'GET'); 
            
            if (!data || data.length === 0) {
                listaAvaliacoes.innerHTML = '<p>Nenhuma avaliação encontrada.</p>';
                return;
            }

            listaAvaliacoes.innerHTML = data.map(av => `
                <div class="item-lista avaliacao-box">
                    <div class="item-conteudo">
                        <strong>Produto ID: ${av.produtoId}</strong> | Nota: ${av.nota}/5
                        <div class="comentario-texto">"${av.comentario || 'Sem comentário'}"</div>
                        <small>Por: ${av.nomeCliente || 'Cliente'} (ID: ${av.clienteId})</small>
                    </div>
                    <div class="item-acoes">
                        <button class="btn-danger btn-del-avaliacao" data-id="${av.id}">Excluir</button>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.btn-del-avaliacao').forEach(btn => {
                btn.addEventListener('click', (e) => deletarAvaliacao(e.target.dataset.id));
            });

        } catch (error) {
            listaAvaliacoes.innerHTML = '<p style="color:red">Erro ao carregar avaliações.</p>';
        }
    }

    async function deletarAvaliacao(id) {
        if(!confirm("Tem certeza que deseja apagar este comentário?")) return;
        try {
            await apiClient(`/avaliacoes/${id}`, 'DELETE');
            alert("Avaliação removida!");
            loadAvaliacoes();
        } catch (e) {
            alert("Erro ao excluir avaliação.");
        }
    }

    async function loadArtistasPendentes() {
        const div = document.getElementById('lista-artesaos-pendentes');
        if(!div) return;
        
        try {
            const users = await apiClient('/artistas/pendentes');
            if(users.length === 0) { div.innerHTML = '<p>Nenhum pendente.</p>'; return; }

            div.innerHTML = users.map(u => `
                <div class="item-lista">
                    <div class="item-conteudo">
                        <strong>${u.nome}</strong><br>Email: ${u.email}
                    </div>
                    <div class="item-acoes">
                        <button class="btn-success btn-aprovar" data-id="${u.id}">Aprovar</button>
                        <button class="btn-danger btn-reprovar" data-id="${u.id}">Reprovar</button>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.btn-aprovar').forEach(b => 
                b.addEventListener('click', () => alterarStatusArtista(b.dataset.id, 'APROVADO')));
            
            document.querySelectorAll('.btn-reprovar').forEach(b => 
                b.addEventListener('click', () => alterarStatusArtista(b.dataset.id, 'REPROVADO')));

        } catch (e) { div.innerHTML = '<p>Erro ao carregar pendentes.</p>'; }
    }

    async function alterarStatusArtista(id, novoStatus) {
        try {
            await apiClient(`/artistas/${id}/status`, 'PATCH', { status: novoStatus });
            loadArtistasPendentes();
            loadTodosArtistas();
        } catch(e) { alert('Erro ao atualizar status'); }
    }

    async function loadTodosArtistas() {
        const div = document.getElementById('lista-artesaos-todos');
        if(!div) return;

        try {
            const users = await apiClient('/artistas');
            div.innerHTML = users.map(u => `
                <div class="item-lista">
                    <div class="item-conteudo">
                        <strong>${u.nome}</strong> (ID: ${u.id}) - Status: ${u.status}
                    </div>
                    <div class="item-acoes">
                        <button class="btn-danger btn-del-artista" data-id="${u.id}">Excluir Conta</button>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.btn-del-artista').forEach(b => 
                b.addEventListener('click', () => deletarUsuario(b.dataset.id, 'artistas')));
        } catch(e) { console.log(e); }
    }

    async function loadClientes() {
        const div = document.getElementById('lista-clientes');
        if(!div) return;

        try {
            const users = await apiClient('/clientes');
            div.innerHTML = users.map(u => `
                <div class="item-lista">
                    <div class="item-conteudo">
                        <strong>${u.nome}</strong> (ID: ${u.id})
                    </div>
                    <div class="item-acoes">
                        <button class="btn-danger btn-del-cliente" data-id="${u.id}">Excluir Conta</button>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.btn-del-cliente').forEach(b => 
                b.addEventListener('click', () => deletarUsuario(b.dataset.id, 'clientes')));
        } catch(e) { console.log(e); }
    }

    async function deletarUsuario(id, tipo) {
        if(!confirm(`ATENÇÃO: Deletar este usuário apagará também seus dados (pedidos/produtos)?`)) return;

        try {
            await apiClient(`/${tipo}/${id}`, 'DELETE');
            alert("Usuário deletado com sucesso.");
            loadUsuarios(); 
        } catch (e) {
            alert("Erro ao deletar usuário.");
        }
    }

    const listaDestaques = document.getElementById('lista-destaques-ativos');
    const formNovoDestaque = document.getElementById('form-novo-destaque');

    async function loadDestaques() {
        if(!listaDestaques) return;
        try {
            const destaques = await apiClient('/destaques');
            listaDestaques.innerHTML = destaques.map(d => `
                <div class="item-lista">
                    <div class="item-conteudo" style="display:flex; align-items:center; gap:10px;">
                        <img src="${d.fotoUrl || '#'}" style="width:60px; height:40px; object-fit:cover; border-radius:4px;">
                        <div>
                            <strong>${d.titulo}</strong>
                            <div style="font-size:0.8em; color:#777;">${d.link || 'Sem link'}</div>
                        </div>
                    </div>
                    <div class="item-acoes">
                        <button class="btn-danger btn-del-destaque" data-id="${d.id}">Remover</button>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.btn-del-destaque').forEach(b =>
                b.addEventListener('click', (e) => deletarDestaque(e.target.dataset.id)));
        } catch(e) {
            listaDestaques.innerHTML = '<p>Erro ao carregar destaques.</p>';
        }
    }

    if(formNovoDestaque) {
        formNovoDestaque.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            try {
                await apiClient('/destaques', 'POST', formData);
                alert('Destaque criado!');
                formNovoDestaque.reset();
                loadDestaques();
            } catch(e) { alert('Erro ao criar destaque'); }
        });
    }

    async function deletarDestaque(id) {
        if(!confirm("Remover este destaque?")) return;
        try {
            await apiClient(`/destaques/${id}`, 'DELETE');
            loadDestaques();
        } catch(e) { alert('Erro ao deletar'); }
    }

    checkLoginAndLoadData();
});