const API_URL = 'http://localhost:8080/api'; 

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

function atualizarEstadoLogin() {
    const token = localStorage.getItem('userToken'); 
    const role = localStorage.getItem('userRole');
    
    const storedName = localStorage.getItem('userName');
    const storedPhoto = localStorage.getItem('userPhoto');

    const divVisitante = document.getElementById('auth-visitante');
    const divLogado = document.getElementById('auth-logado');
    const imgAvatar = document.getElementById('nav-user-avatar'); 
    const linkAvatar = document.getElementById('user-avatar-link');
    const btnLogout = document.getElementById('btn-logout');
    
    if (token && role) {
        if (divVisitante) divVisitante.style.display = 'none';
        if (divLogado) divLogado.style.display = 'flex';

        if (imgAvatar) {
            if (storedPhoto && storedPhoto !== "null" && storedPhoto.trim() !== "") {
                imgAvatar.src = storedPhoto;
            } else {
                const nameToUse = storedName || "User";
                imgAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameToUse)}&background=9c8b75&color=fff&size=150`;
            }
        }

        if (linkAvatar) {
            if (role === 'ROLE_CLIENTE') linkAvatar.href = 'dashboard-cliente.html';
            else if (role === 'ROLE_ARTISTA') linkAvatar.href = 'dashboard-artesao.html';
            else linkAvatar.href = 'dashboard-admin.html';
        }

        if (btnLogout) {
            btnLogout.replaceWith(btnLogout.cloneNode(true));
            document.getElementById('btn-logout').addEventListener('click', (e) => {
                e.preventDefault();
                if(confirm("Deseja sair?")) {
                    localStorage.clear();
                    window.location.href = 'index.html';
                }
            });
        }

    } else {
        if (divVisitante) divVisitante.style.display = 'block';
        if (divLogado) divLogado.style.display = 'none';
    }
}

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

document.addEventListener("DOMContentLoaded", function() {
    
    loadComponent('componente-footer.html', 'footer-placeholder');

    loadComponent('componente-header.html', 'header-placeholder')
        .then(() => {
            atualizarEstadoLogin();
        });

    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('btn-adicionar-carrinho')) {
            handleAdicionarAoCarrinho(e);
        }
    });
});