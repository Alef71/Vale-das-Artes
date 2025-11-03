/*
 * js/main.js (VERSÃO ATUALIZADA)
 *
 * CORRIGIDO: Agora usa 'userToken' em vez de 'authToken' para
 * ser consistente com 'auth.js' e 'dashboard-cliente.js'.
 */

const API_URL = 'http://localhost:8080/api';

// --- (DO SEU CÓDIGO) Função para carregar componentes (header/footer) ---
function loadComponent(url, elementId) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar componente: ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
            } else {
                console.error('Elemento placeholder não encontrado:', elementId);
            }
        })
        .catch(error => {
            console.error('Erro no fetch do componente:', error);
        });
}

// --- (NOVO) Função Helper de API ---
// Centraliza todas as chamadas à API e já inclui o token
async function apiClient(endpoint, method = 'GET', body = null) {
    // --- CORREÇÃO AQUI ---
    const token = localStorage.getItem('userToken'); // Usa 'userToken'
    
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro ${response.status}`);
        }
        if (response.status === 204) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Falha na API [${method} ${endpoint}]:`, error);
        alert(`Erro: ${error.message}`);
        throw error;
    }
}


// --- (ATUALIZADO) Função para atualizar a UI (Login/Logout) ---
function atualizarEstadoLogin() {
    // --- CORREÇÃO AQUI ---
    const token = localStorage.getItem('userToken'); // Usa 'userToken'
    const role = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId'); 

    // Seletores do SEU header (componente-header.html)
    const divVisitante = document.getElementById('auth-visitante');
    const divLogado = document.getElementById('auth-logado');
    const linkDashboard = document.getElementById('link-dashboard');
    const btnLogout = document.getElementById('btn-logout');
    const linkPerfilPublico = document.getElementById('link-perfil-publico'); 

    // Seletores GLOBAIS (para os botões "Comprar", etc.)
    const elementosAutenticados = document.querySelectorAll('.auth-required');
    const elementosNaoAutenticados = document.querySelectorAll('.auth-hidden');

    if (token && role) {
        // --- SE ESTIVER LOGADO ---

        // 1. Controla o SEU header
        if (divVisitante && divLogado) {
            divVisitante.style.display = 'none';
            divLogado.style.display = 'block';
        }
        if (linkDashboard) {
            if (role === 'ROLE_CLIENTE') {
                linkDashboard.href = 'dashboard-cliente.html';
            } else if (role === 'ROLE_ARTISTA') {
                linkDashboard.href = 'dashboard-artesao.html';
            } else if (role === 'ROLE_ADMIN') {
                linkDashboard.href = 'dashboard-admin.html';
            }
        }
        if (role === 'ROLE_ARTISTA' && linkPerfilPublico && userId) {
            const urlCorreta = `perfil-artesao.html?id=${userId}`;
            linkPerfilPublico.style.display = 'inline-block'; 
            linkPerfilPublico.href = urlCorreta; 
        } else if (linkPerfilPublico) {
            linkPerfilPublico.style.display = 'none'; 
        }
        
        // 2. Controla os botões GLOBAIS ("Comprar", etc.)
        elementosAutenticados.forEach(el => el.style.display = 'block');
        elementosNaoAutenticados.forEach(el => el.style.display = 'none');

        // 3. Adiciona o listener de Logout
        if (btnLogout) {
            btnLogout.addEventListener('click', handleLogout);
        }

    } else {
        // --- SE ESTIVER DESLOGADO ---

        // 1. Controla o SEU header
        if (divVisitante && divLogado) {
            divVisitante.style.display = 'block';
            divLogado.style.display = 'none';
        }
        
        // 2. Controla os botões GLOBAIS ("Comprar", etc.)
        elementosAutenticados.forEach(el => el.style.display = 'none');
        elementosNaoAutenticados.forEach(el => el.style.display = 'block');
    }
}

// --- (NOVO) Lógica de Logout ---
function handleLogout(e) {
    if (e) e.preventDefault();
    if (!confirm('Deseja realmente sair?')) return;
    
    // --- CORREÇÃO AQUI ---
    // Limpa TODAS as chaves que o 'auth.js' salva
    localStorage.removeItem('userToken'); // Usa 'userToken'
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    // localStorage.removeItem('clienteId'); // Esta chave não é mais necessária
    localStorage.removeItem('carrinhoId'); // <-- MUITO IMPORTANTE
    
    alert("Você saiu da sua conta.");
    window.location.href = 'index.html';
}

// --- (NOVO) Lógica de Adicionar ao Carrinho ---
async function handleAdicionarAoCarrinho(evento) {
    const botao = evento.target;
    const produtoId = botao.dataset.produtoId;
    
    const carrinhoId = localStorage.getItem('carrinhoId'); 
    
    if (!carrinhoId) {
        console.error('ERRO: carrinhoId não encontrado no localStorage.');
        alert('Seu carrinho não foi encontrado. Por favor, faça o login novamente.');
        handleLogout(); 
        return;
    }

    try {
        botao.disabled = true;
        botao.textContent = 'Adicionando...';

        const dto = { 
            produtoId: parseInt(produtoId), 
            quantidade: 1 
        };
        
        const carrinhoAtualizado = await apiClient(`/carrinhos/${carrinhoId}/itens`, 'POST', dto);
        
        console.log("Item adicionado!", carrinhoAtualizado);
        alert('Produto adicionado ao carrinho!');
        
    } catch (error) {
        console.error('Falha ao adicionar item:', error);
    } finally {
        botao.disabled = false;
        botao.textContent = 'Comprar Produto';
    }
}


// --- INICIALIZAÇÃO (DOMContentLoaded) ---
document.addEventListener("DOMContentLoaded", function() {
    
    // Carrega o footer
    loadComponent('componente-footer.html', 'footer-placeholder');

    // Carrega o header e, DEPOIS, atualiza o estado de login
    loadComponent('componente-header.html', 'header-placeholder')
        .then(() => {
            // Esta função agora controla TUDO (o header e os botões de comprar)
            atualizarEstadoLogin();
        });

    // --- (NOVO) DELEGAÇÃO DE EVENTOS ---
    document.addEventListener('click', function(e) {
        // Se o elemento clicado tem a classe 'btn-adicionar-carrinho'
        if (e.target && e.target.classList.contains('btn-adicionar-carrinho')) {
            handleAdicionarAoCarrinho(e);
        }
    });
});