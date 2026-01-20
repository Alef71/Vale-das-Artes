/*
 * js/perfil-artesao.js
 * (VERSÃO ATUALIZADA - Exibição pública)
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Formata valor para Real (R$)
const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Gera o HTML de um único card de produto
const criarCardProduto = (produto, nomeArtesao) => {
    // Foto do produto ou placeholder
    const imagemSrc = produto.fotoUrl || 'https://via.placeholder.com/300?text=Sem+Foto';
    const urlDetalhe = `produto-detalhe.html?id=${produto.id}`; 
    const nomeArtesaoExibido = nomeArtesao || 'Artesão';

    return `
        <div class="card-produto">
            <a href="${urlDetalhe}">
                <img 
                    src="${imagemSrc}" 
                    alt="Produto: ${produto.nome}" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='https://via.placeholder.com/300?text=Sem+Foto';"
                >
            </a>
            <div class="card-body">
                <h3 class="card-title">${produto.nome}</h3>
                <p class="card-artesao">Por: ${nomeArtesaoExibido}</p>
                <p class="card-preco">${formatarMoeda(produto.preco)}</p>
                <a href="${urlDetalhe}" class="btn-comprar">Ver Detalhes</a>
            </div>
        </div>
    `;
};

// Preenche os dados do topo da página (Foto, Nome, Bio)
const preencherInfoPerfil = (artista) => {
    
    // Nome e Ateliê
    document.getElementById('nome-artesao').textContent = artista.nome || 'Artesão';
    document.getElementById('nome-atelie').textContent = artista.nomeEmpresa || 'Ateliê do Artesão';
    
    // Biografia com fallback
    const biografiaConteudo = artista.biografia 
        ? artista.biografia 
        : `Olá! Sou ${artista.nome}, artesão no Vale das Artes. Confira meus produtos abaixo.`; 
        
    document.getElementById('biografia-artesao').textContent = biografiaConteudo;

    // Título da seção de produtos
    const tituloSecao = document.querySelector('#produtos-do-artesao h2');
    if(tituloSecao) tituloSecao.textContent = `Peças criadas por ${artista.nome || 'este artesão'}`;
    
    // Foto do Perfil
    const imgElement = document.getElementById('img-artesao');
    if (imgElement) {
        if (artista.fotoUrl) {
            // Adiciona timestamp para evitar cache antigo
            imgElement.src = `${artista.fotoUrl}?t=${new Date().getTime()}`;
        } else {
            // Gera avatar com iniciais se não tiver foto
            imgElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artista.nome || 'A')}&background=ddd&color=333&size=200`;
        }
    }
};

// Função Principal
const carregarPerfil = async () => {
    const params = new URLSearchParams(window.location.search);
    const artistaId = params.get('id'); 
    
    const gridProdutos = document.querySelector('.grid-produtos');
    const mainContent = document.querySelector('main');

    // Validação inicial
    if (!artistaId) {
        mainContent.innerHTML = '<div style="text-align:center; padding:50px;"><h2>Erro: Link inválido. Falta o ID do artesão.</h2></div>';
        return;
    }

    // Estado de carregamento
    gridProdutos.innerHTML = '<p style="text-align:center; color:#666;">Carregando vitrine...</p>';

    try {
        console.log(`Buscando dados do artesão ID: ${artistaId}...`);
        
        // Requisição ao Backend
        const response = await fetch(`${API_BASE_URL}/artistas/${artistaId}`);

        if (response.status === 404) {
             mainContent.innerHTML = `<div style="text-align:center; padding:50px;"><h2>Ops! Artesão não encontrado.</h2><p>O link pode estar quebrado ou o usuário não existe mais.</p></div>`;
             return;
        }
        if (!response.ok) {
            throw new Error(`Erro API: ${response.status}`);
        }

        const artista = await response.json();

        // 1. Preenche o cabeçalho do perfil
        preencherInfoPerfil(artista);

        // 2. Processa os produtos
        // Assume que a API retorna os produtos dentro do objeto artista (artista.produtos)
        // Se a API retornar produtos em endpoint separado, avise para ajustarmos.
        const todosProdutos = artista.produtos || []; 
        
        // FILTRO IMPORTANTÍSSIMO: Mostrar apenas produtos ATIVOS
        const produtosAtivos = todosProdutos.filter(p => p.ativo === true);

        if (produtosAtivos.length === 0) {
            gridProdutos.innerHTML = '<p class="aviso" style="grid-column: 1/-1; text-align: center; padding: 20px; background: #f9f9f9;">Este artesão ainda não possui produtos ativos à venda no momento.</p>';
            return;
        }

        // 3. Gera os cards
        const cardsHTML = produtosAtivos.map(produto => criarCardProduto(produto, artista.nome)).join('');
        gridProdutos.innerHTML = cardsHTML;

    } catch (error) {
        console.error('Falha ao carregar perfil:', error);
        mainContent.innerHTML = `
            <div style="text-align:center; padding:50px; color: #d35400;">
                <h2>Erro de Conexão</h2>
                <p>Não foi possível carregar o perfil. Verifique se o servidor está rodando.</p>
            </div>
        `;
    }
};

// Inicia quando a tela carrega
document.addEventListener('DOMContentLoaded', carregarPerfil);