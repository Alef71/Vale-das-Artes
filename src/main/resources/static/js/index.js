document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:8080/api';
    const filtroCategoria = document.getElementById('filtro-categoria');

    carregarDestaques();
    carregarProdutos();

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
                        <img src="${d.fotoUrl || d.caminhoImagem || 'https://via.placeholder.com/1200x400?text=Artesanato'}" 
                             class="d-block w-100" 
                             alt="${d.titulo}">
                    </a>
                    
                    <div class="carousel-caption d-none d-md-block" style="pointer-events: none;">
                        <h5 style="text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">${d.titulo}</h5>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            carouselInner.innerHTML = `
                <div class="carousel-item active">
                    <img src="https://via.placeholder.com/1200x400/3E2B22/FFFFFF?text=Bem-vindo+ao+Vale+das+Artes" class="d-block w-100" alt="Banner Padrão">
                </div>
            `;
        }
    }

    async function carregarProdutos(categoria = '') {
        const gridProdutos = document.querySelector('.grid-produtos');
        if (!gridProdutos) return;

        gridProdutos.innerHTML = '<p style="text-align:center; width:100%;">Carregando vitrine...</p>';

        try {
            let url = `${API_BASE_URL}/produtos`;
            if (categoria) {
                url += `?categoria=${encodeURIComponent(categoria)}`;
            }

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
                    
                    <p class="card-artesao">
                        Por: ${htmlArtesao}
                    </p>
                    
                    <p class="card-preco">${preco}</p>
                    
                    <a href="produto-detalhe.html?id=${produto.id}" class="btn-comprar-vitrine">
                        Ver Detalhes
                    </a>
                </div>
            </div>
        `;
    }
});