/*
 * js/index.js (VERSÃO CORRIGIDA)
 * * CORREÇÃO: Chamada explícita ao método 'GET' na função apiClient dentro de carregarDestaques.
 */

// A função formatarMoeda continua igual
const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


/**
 * --- FUNÇÃO ATUALIZADA (PRODUTOS) ---
 */
const criarCardProduto = (produto) => {
    
    // Use a URL completa da foto, se disponível, ou o placeholder padrão.
    // NOTE: O erro de via.placeholder.com é de rede, não de código. Mantenha para o caso de a rede funcionar.
    const imagemSrc = produto.fotoUrl; 
    const urlDetalhe = `produto-detalhe.html?id=${produto.id}`; 
    const produtoId = produto.id;
    
    let artesaoHtml;
    
    // Verificação robusta para a existência do Artista no Produto
    if (produto.artista && produto.artista.id) {
        
        const artistaId = produto.artista.id; 
        const nomeArtesao = produto.artista.nome || 'Artesão Desconhecido';
        
        artesaoHtml = `
            <p class="card-artesao">
                Artesão: <a href="perfil-artesao.html?id=${artistaId}">${nomeArtesao}</a>
            </p>
        `;
    } else {
        // Se não tiver artista, mostramos o texto simples
        artesaoHtml = `
            <p class="card-artesao">
                Artesão: Desconhecido
            </p>
        `;
    }

    return `
        <div class="card-produto">
            <a href="${urlDetalhe}">
                <img 
                    src="${imagemSrc}" 
                    alt="Imagem do Produto: ${produto.nome}" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='https://via.placeholder.com/200?text=Sem+Foto';"
                >
            </a>
            <div class="card-body">
                <h3 class="card-title">${produto.nome}</h3>
                
                ${artesaoHtml} 
                
                <p class="card-preco">${formatarMoeda(produto.preco)}</p>
                
                <button 
                    class="btn-adicionar-carrinho auth-required" 
                    data-produto-id="${produtoId}" 
                    style="display: none;">
                    Comprar Produto
                </button>

                <p class="auth-hidden" style="display: block;">
                    <a href="login.html">Faça o login</a> para comprar
                </p>
            </div>
        </div>
    `;
};


// --- INÍCIO: FUNÇÕES PARA DESTAQUES ---

const criarItemDestaque = (destaque, isFirst) => {
    // Acessa a propriedade caminhoImagem (como definido no DTO)
    const imagemSrc = destaque.caminhoImagem || 'https://via.placeholder.com/800x400?text=Adicionar+Imagem+Destaque';
    const linkUrl = destaque.linkUrl || '#'; // Usando linkUrl como no backend

    return `
        <div class="carousel-item ${isFirst ? 'active' : ''}">
            <a href="${linkUrl}">
                <img 
                    src="${imagemSrc}" 
                    class="d-block w-100" 
                    alt="${destaque.titulo}"
                    onerror="this.onerror=null; this.src='https://via.placeholder.com/800x400?text=Erro+de+Imagem';"
                >
            </a>
            <div class="carousel-caption d-none d-md-block">
                <h5>${destaque.titulo}</h5>
            </div>
        </div>
    `;
};


/**
 * Função principal para buscar e renderizar os destaques
 */
const carregarDestaques = async () => {
    const carouselInner = document.querySelector('#destaques-carousel .carousel-inner'); 
    
    if (!carouselInner) {
        console.warn("Elemento container de destaques não encontrado. Verifique se o seu HTML tem '#destaques-carousel .carousel-inner'.");
        return;
    }
    
    carouselInner.innerHTML = ''; 

    try {
        // 🛑 CORREÇÃO APLICADA AQUI: Passando 'GET' explicitamente.
        const destaques = await apiClient('/destaques', 'GET'); 
        
        // Filtra apenas os destaques ativos
        const destaquesAtivos = destaques.filter(d => d.ativo === true); 
        
        if (destaquesAtivos.length === 0) {
            carouselInner.innerHTML = '<div class="carousel-item active"><p class="aviso">Nenhum destaque ativo no momento.</p></div>';
            return;
        }

        // Mapeia e junta todos os itens do carousel
        const itensHTML = destaquesAtivos
            .map((destaque, index) => criarItemDestaque(destaque, index === 0))
            .join('');

        carouselInner.innerHTML = itensHTML;
        
        // Inicialização do Carousel do Bootstrap (se o Bootstrap estiver carregado)
        const carouselElement = document.getElementById('destaques-carousel');
        if (carouselElement && typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
            new bootstrap.Carousel(carouselElement);
        }

    } catch (error) {
        // Agora o erro virá do apiClient se a API falhar, e não mais um 404 /null
        console.error('Falha ao carregar destaques:', error);
        carouselInner.innerHTML = '<div class="carousel-item active"><p class="erro">Erro ao carregar destaques. Verifique a API.</p></div>';
    }
};

// --- FIM: FUNÇÕES PARA DESTAQUES ---


// O resto do arquivo (carregarProdutos)
const carregarProdutos = async () => {
    const gridProdutos = document.querySelector('.grid-produtos');
    if (!gridProdutos) return; 
    
    gridProdutos.innerHTML = '<h2>Carregando produtos...</h2>'; 

    try {
        // Esta chamada usa fetch nativo sem o token, diferente do apiClient
        const response = await fetch('/api/produtos'); 
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const produtos = await response.json();

        if (produtos.length === 0) {
            gridProdutos.innerHTML = '<p class="aviso">Nenhum produto ativo encontrado no momento.</p>';
            return;
        }

        const cardsHTML = produtos.map(criarCardProduto).join('');
        gridProdutos.innerHTML = cardsHTML;
        
        // Esta linha chama o main.js para mostrar os botões "Comprar"
        if (typeof atualizarEstadoLogin === 'function') {
            atualizarEstadoLogin();
        }

    } catch (error) {
        console.error('Falha ao carregar produtos:', error);
        gridProdutos.innerHTML = `<p class="erro">Erro ao buscar produtos. Tente novamente.</p>`;
    }
};

// --- INICIALIZAÇÃO CORRIGIDA ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega os destaques
    carregarDestaques(); 
    
    // 2. Carrega os produtos
    carregarProdutos();
});