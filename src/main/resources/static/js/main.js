/**
 * Função para carregar componentes HTML reutilizáveis (como header e footer)
 * @param {string} url - O caminho para o arquivo HTML do componente
 * @param {string} elementId - O ID do elemento onde o HTML será injetado
 * @returns {Promise<void>} - Retorna uma promessa que resolve quando o componente é carregado
 */
function loadComponent(url, elementId) {
    // Retorna a promessa do fetch para sabermos quando ela termina
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

/**
 * Função para verificar o estado de login (lendo o localStorage)
 * e atualizar o menu (header)
 */
function atualizarEstadoLogin() {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');

    // Espera os elementos do header serem carregados
    const divVisitante = document.getElementById('auth-visitante');
    const divLogado = document.getElementById('auth-logado');
    const linkDashboard = document.getElementById('link-dashboard');
    const btnLogout = document.getElementById('btn-logout');

    if (token && role && divVisitante && divLogado && linkDashboard) {
        // --- USUÁRIO ESTÁ LOGADO ---
        
        // 1. Esconde "Login/Cadastro"
        divVisitante.style.display = 'none';
        // 2. Mostra "Meu Painel/Sair"
        divLogado.style.display = 'block';

        // 3. Define o link correto para "Meu Painel"
        if (role === 'ROLE_CLIENTE') {
            linkDashboard.href = 'dashboard-cliente.html';
        } else if (role === 'ROLE_ARTISTA') {
            linkDashboard.href = 'dashboard-artesao.html';
        } else if (role ===a === 'ROLE_ADMIN') {
            linkDashboard.href = 'dashboard-admin.html';
        }

        // 4. Adiciona a lógica de Logout ao botão "Sair"
        if (btnLogout) {
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault(); // Impede que o link '#' mude a URL
                
                // Limpa a "memória" do navegador
                localStorage.removeItem('userToken');
                localStorage.removeItem('userRole');
                // (Vamos limpar o ID do usuário também, que adicionaremos na Etapa 2)
                localStorage.removeItem('userId'); 
                
                alert("Você saiu da sua conta.");
                
                // Redireciona para a página inicial
                window.location.href = 'index.html';
            });
        }

    } else {
        // --- USUÁRIO NÃO ESTÁ LOGADO (VISITANTE) ---
        if (divVisitante && divLogado) {
            // Garante que o menu de visitante esteja visível
            divVisitante.style.display = 'block';
            divLogado.style.display = 'none';
        }
    }
}


// Evento que dispara quando o HTML da página (DOM) está completamente carregado
document.addEventListener("DOMContentLoaded", function() {
    
    // Carrega o footer primeiro (não depende de nada)
    loadComponent('componente-footer.html', 'footer-placeholder');

    // Carrega o header e, SÓ DEPOIS que ele terminar,
    // chama a função para atualizar o estado do login.
    loadComponent('componente-header.html', 'header-placeholder')
        .then(() => {
            // Esta função só roda DEPOIS que o header.html foi injetado
            atualizarEstadoLogin();
        });
});