/*
 * js/index.js (VERSÃO CORRIGIDA)
 *
 * O bug na função 'criarCardProduto' foi corrigido.
 * Agora, ele procura por 'produto.artista.id' e 'produto.artista.nome'.
 */

// A função formatarMoeda continua igual
const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


/**
 * --- FUNÇÃO ATUALIZADA E CORRIGIDA ---
 */
const criarCardProduto = (produto) => {
    
    const imagemSrc = produto.fotoUrl; 
    const urlDetalhe = `produto-detalhe.html?id=${produto.id}`; 
    const produtoId = produto.id;
    
    // --- INÍCIO DA CORREÇÃO ---
    let artesaoHtml;
    
    // CORREÇÃO: Verificamos se o objeto 'produto.artista' existe
    // e se ele tem um 'id' dentro dele.
    if (produto.artista && produto.artista.id) {
        
        // CORREÇÃO: Pegamos o ID de dentro do objeto
        const artistaId = produto.artista.id; 
        
        // CORREÇÃO: Pegamos o NOME de dentro do objeto
        const nomeArtesao = produto.artista.nome || 'Artesão Desconhecido';
        
        // Agora o link será criado corretamente
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
    // --- FIM DA CORREÇÃO ---

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


// O resto do arquivo (carregarProdutos, listener) continua o mesmo
const carregarProdutos = async () => {
    const gridProdutos = document.querySelector('.grid-produtos');
    if (!gridProdutos) return; 
    
    gridProdutos.innerHTML = '<h2>Carregando produtos...</h2>'; 

    try {
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

document.addEventListener('DOMContentLoaded', carregarProdutos);