
const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


const criarCardProduto = (produto, nomeArtesao) => {
    const imagemSrc = produto.fotoUrl || 'https://via.placeholder.com/200?text=Sem+Foto';
    const urlDetalhe = `produto-detalhe.html?id=${produto.id}`; 
    const nomeArtesaoExibido = nomeArtesao || 'Artesão Desconhecido';
    
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
                <p class="card-artesao">Artesão: ${nomeArtesaoExibido}</p>
                <p class="card-preco">${formatarMoeda(produto.preco)}</p>
                <a href="${urlDetalhe}" class="btn-comprar">Ver Detalhes</a>
            </div>
        </div>
    `;
};


const preencherInfoPerfil = (artista) => {
    
    document.getElementById('nome-artesao').textContent = artista.nome || 'Artesão';
    document.getElementById('nome-atelie').textContent = artista.nomeEmpresa || 'Sem Ateliê Registrado';
    
    
    const biografiaConteudo = artista.biografia 
        ? artista.biografia 
        : 'Este artesão ainda não forneceu uma biografia.'; 
        
    document.getElementById('biografia-artesao').textContent = biografiaConteudo;

    
    document.querySelector('#produtos-do-artesao h2').textContent = `Produtos de ${artista.nome || 'Artesão'}`;
    
   
    if (artista.fotoUrl) { 
         document.getElementById('img-artesao').src = artista.fotoUrl;
    }
};



const carregarPerfil = async () => {
    const params = new URLSearchParams(window.location.search);
    const artistaId = params.get('id'); 
    const gridProdutos = document.querySelector('.grid-produtos');
    const mainContent = document.querySelector('main');

    if (!artistaId) {
        mainContent.innerHTML = '<h1>Erro: ID do artesão não encontrado na URL.</h1>';
        return;
    }

    gridProdutos.innerHTML = '<h2>Carregando produtos...</h2>';

    try {
        
        const response = await fetch(`/api/artistas/${artistaId}`);

        if (response.status === 404) {
             mainContent.innerHTML = `<h1>Artesão com ID ${artistaId} não encontrado.</h1>`;
             return;
        }
        if (!response.ok) {
            throw new Error(`Erro ao buscar perfil: ${response.status}`);
        }

        const artista = await response.json();

        
        preencherInfoPerfil(artista);

        
        const produtos = artista.produtos || []; 

        if (produtos.length === 0) {
            gridProdutos.innerHTML = '<p class="aviso">Nenhum produto ativo encontrado para este artesão.</p>';
            return;
        }

        
        const cardsHTML = produtos.map(produto => criarCardProduto(produto, artista.nome)).join('');
        gridProdutos.innerHTML = cardsHTML;

    } catch (error) {
        console.error('Falha ao carregar perfil:', error);
        mainContent.innerHTML = `
            <h1>Erro de Conexão</h1>
            <p>Não foi possível carregar os dados do artesão. Tente novamente mais tarde.</p>
        `;
    }
};


document.addEventListener('DOMContentLoaded', carregarPerfil);