// ==========================================
// Funções Utilitárias (Formatadores)
// ==========================================
const formatarMoeda = (valor) => {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// ==========================================
// Funções de Preenchimento da Tela
// ==========================================
const preencherDetalhesProduto = (produto) => {
    // 1. Imagem Principal
    const imgElement = document.getElementById('img-produto');
    imgElement.src = produto.fotoUrl || 'https://via.placeholder.com/400?text=Sem+Foto';
    imgElement.alt = `Imagem de ${produto.nome}`;

    // 2. Informações Textuais
    document.getElementById('nome-produto').textContent = produto.nome;
    document.getElementById('descricao-produto').textContent = produto.descricao || 'Este produto não possui descrição detalhada.';
    document.getElementById('preco-produto').textContent = formatarMoeda(produto.preco);
    
    // Atualiza o título da aba do navegador
    document.title = `${produto.nome} - Vale das Artes`;

    // 3. Link do Artesão (Verifica se o produto tem um artesão vinculado)
    const linkArtesao = document.getElementById('link-artesao');
    if (produto.artesao) {
        linkArtesao.textContent = produto.artesao.nome || 'Artesão Parceiro';
        linkArtesao.href = `perfil-artesao.html?id=${produto.artesao.id}`;
    } else {
        linkArtesao.textContent = 'Vale das Artes';
        linkArtesao.removeAttribute('href'); // Remove o link se não tiver artesão
        linkArtesao.style.textDecoration = 'none';
        linkArtesao.style.color = '#555';
    }

    // 4. Configura o botão de "Adicionar ao Carrinho"
    const btnCarrinho = document.getElementById('btn-add-carrinho');
    // Removemos eventos anteriores para não duplicar se a função rodar 2x
    btnCarrinho.replaceWith(btnCarrinho.cloneNode(true)); 
    document.getElementById('btn-add-carrinho').addEventListener('click', () => adicionarAoCarrinho(produto));
};

// ==========================================
// Lógica do Carrinho (LocalStorage)
// ==========================================
const adicionarAoCarrinho = (produto) => {
    const quantidadeInput = document.getElementById('quantidade');
    const quantidade = parseInt(quantidadeInput.value) || 1;

    if (quantidade < 1) {
        alert("A quantidade deve ser pelo menos 1.");
        return;
    }

    const itemCarrinho = {
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        fotoUrl: produto.fotoUrl,
        quantidade: quantidade,
        artesaoNome: produto.artesao ? produto.artesao.nome : 'Vale das Artes'
    };

    // Recupera carrinho existente ou cria novo array
    let carrinho = JSON.parse(localStorage.getItem('carrinho_vale_artes')) || [];

    // Verifica se já existe para somar quantidade
    const indexExistente = carrinho.findIndex(item => item.id === produto.id);

    if (indexExistente >= 0) {
        carrinho[indexExistente].quantidade += quantidade;
    } else {
        carrinho.push(itemCarrinho);
    }

    // Salva no navegador
    localStorage.setItem('carrinho_vale_artes', JSON.stringify(carrinho));

    alert(`Sucesso! ${quantidade} unidade(s) de "${produto.nome}" adicionada(s) ao carrinho.`);
};

// ==========================================
// Função Principal (Async)
// ==========================================
const carregarProduto = async () => {
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');
    const mainContent = document.querySelector('main');
    const secaoDetalhe = document.getElementById('detalhe-produto');

    // Validação inicial do ID
    if (!produtoId) {
        mainContent.innerHTML = `
            <div style="text-align:center; padding: 4rem;">
                <h1>Produto não especificado</h1>
                <p>O link acessado parece estar incompleto.</p>
                <a href="index.html" class="btn-comprar" style="display:inline-block; margin-top:1rem; width:auto;">Voltar ao Início</a>
            </div>
        `;
        return;
    }

    try {
        // Feedback de carregamento (Opcional: pode criar um spinner)
        document.getElementById('nome-produto').textContent = "Carregando detalhes...";

        // Chamada à API
        const response = await fetch(`/api/produtos/${produtoId}`);

        // Tratamento de Erro 404 (Não Encontrado)
        if (response.status === 404) {
            mainContent.innerHTML = `
                <div style="text-align:center; padding: 4rem;">
                    <h1>Produto não encontrado</h1>
                    <p>O produto com ID <strong>${produtoId}</strong> não existe ou foi removido.</p>
                    <a href="index.html" class="btn-comprar" style="display:inline-block; margin-top:1rem; width:auto;">Ver outros produtos</a>
                </div>
            `;
            return;
        }

        // Tratamento de outros erros de servidor
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const produto = await response.json();

        // Preenche a tela com sucesso
        preencherDetalhesProduto(produto);

    } catch (error) {
        console.error('Falha ao carregar produto:', error);
        mainContent.innerHTML = `
            <div style="text-align:center; padding: 4rem;">
                <h1>Erro de Conexão</h1>
                <p>Não foi possível carregar os dados do produto no momento.</p>
                <p style="color:#777; font-size:0.9rem;">Detalhe técnico: ${error.message}</p>
                <button onclick="window.location.reload()" class="btn-comprar" style="display:inline-block; margin-top:1rem; width:auto; cursor:pointer;">Tentar Novamente</button>
            </div>
        `;
    }
};

// ==========================================
// Inicialização
// ==========================================
document.addEventListener('DOMContentLoaded', carregarProduto);