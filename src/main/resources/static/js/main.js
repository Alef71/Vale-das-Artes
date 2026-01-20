/**
 * js/main.js
 * Gerencia o Header, Footer e carrega a FOTO DO PERFIL
 */

const API_URL = 'http://localhost:8080/api'; 

// --- Carrega HTML externo (Header/Footer) ---
function loadComponent(url, elementId) {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar ' + url);
            return response.text();
        })
        .then(html => {
            const element = document.getElementById(elementId);
            if (element) element.innerHTML = html;
        })
        .catch(err => console.error(err));
}

// --- Cliente HTTP Genérico ---
async function apiClient(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('userToken');
    const headers = new Headers();
    
    if (body && !(body instanceof FormData)) {
        headers.append('Content-Type', 'application/json');
    }
    if (token) headers.append('Authorization', `Bearer ${token}`);

    const config = { method, headers };
    if (body) config.body = (body instanceof FormData) ? body : JSON.stringify(body);

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        if (response.status === 204) return null;
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Erro ${response.status}`);
        return data;
    } catch (error) {
        console.error("API Client Error:", error);
        throw error;
    }
}

// --- ATUALIZA HEADER COM FOTO E LOGIN ---
function atualizarEstadoLogin() {
    const token = localStorage.getItem('userToken'); 
    const role = localStorage.getItem('userRole');
    
    // Recupera o que o auth.js salvou
    const storedName = localStorage.getItem('userName');
    const storedPhoto = localStorage.getItem('userPhoto');

    // Elementos do Header
    const divVisitante = document.getElementById('auth-visitante');
    const divLogado = document.getElementById('auth-logado');
    const imgAvatar = document.getElementById('nav-user-avatar'); // O IMG da bolinha
    const linkAvatar = document.getElementById('user-avatar-link');
    const btnLogout = document.getElementById('btn-logout');
    
    // Se está logado
    if (token && role) {
        if (divVisitante) divVisitante.style.display = 'none';
        if (divLogado) divLogado.style.display = 'flex'; // Mostra área do usuário

        // 1. ATUALIZA A FOTO
        if (imgAvatar) {
            if (storedPhoto && storedPhoto !== "null" && storedPhoto.trim() !== "") {
                // Tem foto no banco? Usa ela.
                imgAvatar.src = storedPhoto;
            } else {
                // Não tem? Gera avatar com iniciais
                const nameToUse = storedName || "User";
                imgAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameToUse)}&background=9c8b75&color=fff&size=150`;
            }
        }

        // 2. Define link do dashboard
        if (linkAvatar) {
            if (role === 'ROLE_CLIENTE') linkAvatar.href = 'dashboard-cliente.html';
            else if (role === 'ROLE_ARTISTA') linkAvatar.href = 'dashboard-artesao.html';
            else linkAvatar.href = 'dashboard-admin.html';
        }

        // 3. Configura Logout
        if (btnLogout) {
            // Remove listener anterior para não duplicar
            btnLogout.replaceWith(btnLogout.cloneNode(true));
            document.getElementById('btn-logout').addEventListener('click', (e) => {
                e.preventDefault();
                if(confirm("Deseja sair?")) {
                    localStorage.clear(); // Limpa tudo (Token, Foto, Nome)
                    window.location.href = 'index.html';
                }
            });
        }

    } else {
        // Se NÃO está logado
        if (divVisitante) divVisitante.style.display = 'block';
        if (divLogado) divLogado.style.display = 'none';
    }
}

// --- ADICIONAR AO CARRINHO ---
async function handleAdicionarAoCarrinho(e) {
    const btn = e.target;
    const produtoId = btn.dataset.produtoId;
    const carrinhoId = localStorage.getItem('carrinhoId');

    if (!localStorage.getItem('userToken')) {
        alert("Faça login para comprar!");
        window.location.href = 'login.html';
        return;
    }

    if (!carrinhoId) {
        alert("Erro: Carrinho não encontrado. Tente fazer login novamente.");
        return;
    }

    try {
        btn.textContent = "...";
        btn.disabled = true;
        
        await apiClient(`/carrinhos/${carrinhoId}/itens`, 'POST', {
            produtoId: parseInt(produtoId),
            quantidade: 1
        });
        
        alert("Produto na sacola!");
    } catch (err) {
        alert("Erro ao adicionar: " + err.message);
    } finally {
        btn.textContent = "Comprar";
        btn.disabled = false;
    }
}

// --- INICIALIZAÇÃO GERAL ---
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Carrega Footer
    loadComponent('componente-footer.html', 'footer-placeholder');

    // 2. Carrega Header E DEPOIS atualiza a foto
    loadComponent('componente-header.html', 'header-placeholder')
        .then(() => {
            // O HTML do header já existe agora, então podemos buscar os IDs e atualizar
            atualizarEstadoLogin();
        });

    // 3. Escuta cliques em botões de compra (Delegate event)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('btn-adicionar-carrinho')) {
            handleAdicionarAoCarrinho(e);
        }
    });
});