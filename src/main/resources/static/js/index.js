document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:8080/api';
    const filtroCategoria = document.getElementById('filtro-categoria');

    // Inicializa as funções de carga
    carregarDestaques();
    carregarProdutos();

    // --- LÓGICA DA IMAGEM LATERAL (FIXA NA DIREITA + AJUSTE VERTICAL) ---
    const imagemLateral = document.querySelector('.decoracao-lateral');
    const footer = document.querySelector('footer') || document.getElementById('footer-placeholder');
    const header = document.querySelector('header') || document.getElementById('header-placeholder');

    if (imagemLateral && footer && header) {
        
        // 1. FORÇA A IMAGEM A FICAR COLADA NA DIREITA IMEDIATAMENTE
        // Isso corrige o CSS 'left: 1400px' que poderia estar jogando ela para fora em telas menores
        imagemLateral.style.position = 'fixed';
        imagemLateral.style.right = '0'; 
        imagemLateral.style.left = 'auto'; 
        imagemLateral.style.zIndex = '1';

        const ajustarPosicaoImagem = () => {
            const rectFooter = footer.getBoundingClientRect();
            const rectHeader = header.getBoundingClientRect();
            const alturaTela = window.innerHeight;

            // --- CÁLCULO DO CHÃO (FOOTER) ---
            // Se o footer aparecer, empurra a imagem para cima
            let empurraoFooter = 0;
            if (rectFooter.top < alturaTela) {
                empurraoFooter = alturaTela - rectFooter.top;
            }

            // --- CÁLCULO DO TETO (HEADER) ---
            // Define onde termina o header para a imagem não passar por cima
            const fimDoHeader = Math.max(0, rectHeader.bottom);
            
            // --- CÁLCULO DO ESPAÇO DISPONÍVEL ---
            // Altura total - (Header) - (Footer) - (20px de respiro)
            const espacoDisponivel = alturaTela - empurraoFooter - fimDoHeader - 20;

            // Aplica as regras:
            // 1. Fica presa no chão (ou no topo do footer se ele aparecer)
            imagemLateral.style.bottom = `${empurraoFooter}px`;
            
            // 2. Reseta o topo para automático (para não esticar)
            imagemLateral.style.top = 'auto';

            // 3. Define a altura máxima. A imagem vai encolher se o espaço diminuir,
            // mas nunca vai perder a proporção ou sair da lateral.
            if (espacoDisponivel > 100) {
                imagemLateral.style.maxHeight = `${espacoDisponivel}px`;
                imagemLateral.style.height = 'auto'; // Mantém a proporção original da imagem
                imagemLateral.style.opacity = '1';
                imagemLateral.style.display = 'block';
            } else {
                // Se o espaço for muito pequeno (celular deitado ou header colado no footer), esconde
                imagemLateral.style.opacity = '0';
            }
        };

        window.addEventListener('scroll', ajustarPosicaoImagem);
        window.addEventListener('resize', ajustarPosicaoImagem);
        
        // Chama agora e um pouco depois para garantir que imagens carregaram
        ajustarPosicaoImagem();
        setTimeout(ajustarPosicaoImagem, 500);
    }
    // -----------------------------------------------------

    if (filtroCategoria) {
        filtroCategoria.addEventListener('change', (e) => {
            const categoriaSelecionada = e.target.value;
            carregarProdutos(categoriaSelecionada);
        });
    }

    async function carregarDestaques() {
        const carouselInner = document.querySelector('#destaques-carousel .carousel-inner');
        if (!carouselInner) return;

        try {
            const response = await fetch(`${API_BASE_URL}/destaques`);
            if (!response.ok) throw new Error('API Destaques indisponível');

            const destaques = await response.json();
            const destaquesAtivos = destaques.filter(d => d.ativo === true);

            if (destaquesAtivos.length === 0) throw new Error('Sem destaques');

            carouselInner.innerHTML = destaquesAtivos.map((d, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <a href="${d.link || '#'}" style="display:block; width:100%; height:100%; text-decoration:none;">
                        <img src="${d.fotoUrl || d.caminhoImagem || 'https://t3.ftcdn.net/jpg/09/56/15/94/360_F_956159456_IikGgWagJRUhHPTLcsABoCW31k10FF3G.jpg'}" 
                             class="d-block w-100" alt="${d.titulo}">
                    </a>
                    <div class="carousel-caption d-none d-md-block" style="pointer-events: none;">
                        <h5 style="text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">${d.titulo}</h5>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            carouselInner.innerHTML = `
                <div class="carousel-item active">
                    <img src="https://t3.ftcdn.net/jpg/09/56/15/94/360_F_956159456_IikGgWagJRUhHPTLcsABoCW31k10FF3G.jpg" class="d-block w-100" alt="Banner Padrão">
                </div>`;
        }
    }

    async function carregarProdutos(categoria = '') {
        const gridProdutos = document.querySelector('.grid-produtos');
        if (!gridProdutos) return;

        gridProdutos.innerHTML = '<p style="text-align:center; width:100%;">Carregando vitrine...</p>';

        try {
            let url = `${API_BASE_URL}/produtos`;
            if (categoria) url += `?categoria=${encodeURIComponent(categoria)}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Erro ao buscar produtos');

            const produtos = await response.json();

            if (produtos.length === 0) {
                gridProdutos.innerHTML = '<p style="text-align:center; width:100%;">Nenhum produto encontrado.</p>';
                return;
            }

            gridProdutos.innerHTML = produtos.map(produto => criarCardProduto(produto)).join('');

        } catch (error) {
            console.error(error);
            gridProdutos.innerHTML = '<p>Erro ao carregar produtos. Verifique a conexão.</p>';
        }
    }

    function criarCardProduto(produto) {
        const preco = produto.preco ? produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
        const img = produto.fotoUrl || 'https://via.placeholder.com/300?text=Sem+Foto';
        
        let nomeArtesao = 'Artesão Parceiro';
        let idArtesao = null;

        if (produto.artista) {
            nomeArtesao = produto.artista.nome || nomeArtesao;
            idArtesao = produto.artista.id;
        }

        let htmlArtesao;
        if (idArtesao) {
            htmlArtesao = `<a href="perfil-artesao.html?id=${idArtesao}" class="link-artesao" title="Ver perfil">${nomeArtesao}</a>`;
        } else {
            htmlArtesao = `<span class="texto-artesao">${nomeArtesao}</span>`;
        }

        return `
            <div class="card-produto">
                <a href="produto-detalhe.html?id=${produto.id}" class="link-imagem">
                    <div class="img-container">
                        <img src="${img}" alt="${produto.nome}">
                    </div>
                </a>
                <div class="card-body">
                    <h3 class="card-title">${produto.nome}</h3>
                    <p class="card-artesao">Por: ${htmlArtesao}</p>
                    <p class="card-preco">${preco}</p>
                    <a href="produto-detalhe.html?id=${produto.id}" class="btn-comprar-vitrine">Ver Detalhes</a>
                </div>
            </div>
        `;
    }
});