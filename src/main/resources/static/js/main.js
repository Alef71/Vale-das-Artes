/*
 * js/main.js (VERSÃO CORRIGIDA)
 *
 * Este arquivo contém a função 'apiClient' e NÃO tem o SyntaxError na linha 109.
 * Este é o "par" correto para o dashboard-admin.js (v3.1).
 */

const API_URL = 'http://localhost:8080/api'; // Ou apenas '/api' se estiver no mesmo domínio

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
    const token = localStorage.getItem('userToken'); // Usa 'userToken'
    
    const headers = new Headers(); // Usar Headers object para flexibilidade
    
    // Se o corpo não for FormData, definir como JSON
    if (body && !(body instanceof FormData)) {
        headers.append('Content-Type', 'application/json');
    }

    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    const config = {
        method: method,
        headers: headers
    };

    if (body) {
        // Envia como JSON ou como FormData (para uploads)
        config.body = (body instanceof FormData) ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        // Se a resposta for 204 (No Content), como em um DELETE, retorne null
        if (response.status === 204) {
            return null;
        }

        // Tenta pegar o JSON. Se não houver, pode dar erro (ex: 500)
        const data = await response.json();

        if (!response.ok) {
            // Usa a mensagem de erro do backend (data.message) ou o status
            throw new Error(data.message || `Erro ${response.status}`);
        }
        
        return data; // Retorna o JSON
        
    } catch (error) {
        console.error(`Falha na API [${method} ${endpoint}]:`, error);
        // Não mostre um 'alert' aqui, apenas lance o erro
        // A função que chamou (ex: loadDestaques) decidirá o que fazer.
        throw error;
    }
}


// --- (ATUALIZADO) Função para atualizar a UI (Login/Logout) ---
function atualizarEstadoLogin() {
    const token = localStorage.getItem('userToken'); 
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
            // Evita adicionar múltiplos listeners
            btnLogout.removeEventListener('click', handleLogout);
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
    
    // Limpa TODAS as chaves que o 'auth.js' salva
    localStorage.removeItem('userToken'); 
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('carrinhoId'); 
    
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
        alert(`Erro ao adicionar: ${error.message}`); // Mostra o erro da API
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