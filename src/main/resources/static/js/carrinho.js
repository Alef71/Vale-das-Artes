/**
 * js/carrinho.js
 * * Script para gerenciar a página do carrinho de compras.
 *
 * (Nota: As constantes 'API_URL' e a função 'apiClient' 
 * já foram declaradas em 'main.js' e estão disponíveis aqui)
 */

// --- ELEMENTOS DO DOM ---
const loadingDiv = document.getElementById('carrinho-loading');
const emptyDiv = document.getElementById('carrinho-vazio');
const cartListDiv = document.getElementById('lista-carrinho');
const orderSummaryAside = document.getElementById('resumo-pedido');
const subtotalSpan = document.getElementById('valor-subtotal');
const totalSpan = document.getElementById('valor-total');
const finalizeButton = document.getElementById('btn-finalizar-compra');
const clearCartButton = document.getElementById('btn-limpar-carrinho');


// --- FUNÇÃO HELPER: Formatar Moeda ---
// (Esta função é específica desta página, então mantemos aqui)
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// --- FUNÇÕES DE RENDERIZAÇÃO ---

/**
 * Renderiza a página inteira com base nos dados do CarrinhoResponseDTO
 * @param {object} carrinhoDTO - O objeto CarrinhoResponseDTO vindo da API
 */
function renderizarPaginaCarrinho(carrinhoDTO) {
    // Esconde o "Carregando"
    if (loadingDiv) loadingDiv.style.display = 'none';

    // Se o DTO for nulo ou não tiver itens, mostra "Carrinho Vazio"
    if (!carrinhoDTO || !carrinhoDTO.itens || carrinhoDTO.itens.length === 0) {
        if (emptyDiv) emptyDiv.style.display = 'block';
        if (cartListDiv) cartListDiv.style.display = 'none';
        if (orderSummaryAside) orderSummaryAside.style.display = 'none';
        return;
    }

    // Se tem itens, mostra a lista e o resumo
    if (emptyDiv) emptyDiv.style.display = 'none';
    if (cartListDiv) cartListDiv.style.display = 'block';
    if (orderSummaryAside) orderSummaryAside.style.display = 'block';

    // 1. Renderiza o Resumo do Pedido
    if (subtotalSpan) subtotalSpan.textContent = formatarMoeda(carrinhoDTO.valorTotal);
    if (totalSpan) totalSpan.textContent = formatarMoeda(carrinhoDTO.valorTotal); // (Total é igual ao subtotal por enquanto)

    // 2. Renderiza a Lista de Itens
    if (cartListDiv) {
        cartListDiv.innerHTML = ''; // Limpa a lista antiga

        carrinhoDTO.itens.forEach(item => {
            // 'item' aqui é o seu CarrinhoItemResponseDTO
            const itemDiv = document.createElement('div');
            itemDiv.className = 'carrinho-item'; // Dê um estilo para essa classe no seu CSS
            
            // Guarda o ID do produto no próprio elemento HTML
            itemDiv.setAttribute('data-produto-id', item.produtoId);

            // Cria o HTML para o item
            itemDiv.innerHTML = `
                <p class="item-nome">${item.nomeProduto}</p>
                <p class="item-preco-unitario">Preço: ${formatarMoeda(item.precoUnitario)}</p>
                <div class="item-quantidade">
                    <span>Quantidade: ${item.quantidade}</span>
                    <button class="btn-diminuir">-</button>
                    <button class="btn-aumentar">+</button>
                    <button class="btn-remover">Remover</button>
                </div>
                <p class="item-subtotal">Subtotal: ${formatarMoeda(item.precoUnitario * item.quantidade)}</p>
            `;
            
            cartListDiv.appendChild(itemDiv);
        });
    }
}


// --- FUNÇÕES DE AÇÃO (Handlers de Evento) ---

/**
 * Carrega o carrinho da API assim que a página abre.
 * Esta é a função principal de inicialização.
 */
async function carregarCarrinho() {
    const carrinhoId = localStorage.getItem('carrinhoId');

    if (!carrinhoId) {
        // Não há carrinho, mostra a tela de "vazio"
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (emptyDiv) emptyDiv.style.display = 'block';
        if (orderSummaryAside) orderSummaryAside.style.display = 'none';
        return;
    }

    try {
        // Busca o CarrinhoResponseDTO
        // (Usa a função 'apiClient' que foi declarada no 'main.js')
        const carrinhoDTO = await apiClient(`/carrinhos/${carrinhoId}`, 'GET');
        // Renderiza a página com os dados
        renderizarPaginaCarrinho(carrinhoDTO);
    } catch (error) {
        console.error("Falha ao carregar carrinho:", error);
        // Se deu erro (ex: 404 Not Found), o carrinho pode ser antigo
        if (error.message.includes('404')) {
            localStorage.removeItem('carrinhoId'); // Limpa o ID inválido
        }
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (emptyDiv) {
            emptyDiv.style.display = 'block';
            emptyDiv.innerHTML = '<p>Erro ao carregar o carrinho. Tente recarregar a página.</p>';
        }
    }
}

/**
 * Ações de clique nos itens (Aumentar, Diminuir, Remover)
 */
async function handleAcoesItens(evento) {
    const target = evento.target; // O elemento exato que foi clicado (ex: o botão '-')
    const carrinhoId = localStorage.getItem('carrinhoId');

    const itemDiv = target.closest('.carrinho-item');
    if (!itemDiv) return; 

    const produtoId = itemDiv.dataset.produtoId;
    let carrinhoAtualizadoDTO = null;

    try {
        if (target.classList.contains('btn-aumentar')) {
            // Aumentar (Adicionar +1)
            const dto = { produtoId: produtoId, quantidade: 1 };
            carrinhoAtualizadoDTO = await apiClient(`/carrinhos/${carrinhoId}/itens`, 'POST', dto);
        
        } else if (target.classList.contains('btn-diminuir')) {
            // Diminuir (Remover 1)
            const dto = { produtoId: produtoId, quantidade: 1 };
            // Passa o DTO como o 'body' da requisição DELETE
            carrinhoAtualizadoDTO = await apiClient(`/carrinhos/${carrinhoId}/itens`, 'DELETE', dto); 
        
        } else if (target.classList.contains('btn-remover')) {
            // Remover (Remover 99999)
            const dto = { produtoId: produtoId, quantidade: 99999 };
            carrinhoAtualizadoDTO = await apiClient(`/carrinhos/${carrinhoId}/itens`, 'DELETE', dto);
        }

        if (carrinhoAtualizadoDTO) {
            renderizarPaginaCarrinho(carrinhoAtualizadoDTO);
        }

    } catch (error) {
        alert('Não foi possível atualizar o item.');
    }
}

/**
 * Limpa o carrinho
 */
async function handleLimparCarrinho() {
    const carrinhoId = localStorage.getItem('carrinhoId');
    if (!carrinhoId) return;

    if (!confirm('Tem certeza que deseja limpar o carrinho?')) {
        return;
    }

    try {
        const carrinhoVazioDTO = await apiClient(`/carrinhos/${carrinhoId}/limpar`, 'DELETE');
        renderizarPaginaCarrinho(carrinhoVazioDTO); 
    } catch (error) {
        alert('Não foi possível limpar o carrinho.');
    }
}

/**
 * Finaliza a compra (Cria um Pedido)
 */
async function handleFinalizarCompra() {
    const carrinhoId = localStorage.getItem('carrinhoId');
    if (!carrinhoId) return;

    if (!confirm('Deseja finalizar a compra e criar o pedido?')) {
        return;
    }

    try {
        // POST /api/pedidos/carrinho/{carrinhoId}
        const pedidoDTOResponse = await apiClient(`/pedidos/carrinho/${carrinhoId}`, 'POST');

        // SUCESSO!
        alert(`Pedido #${pedidoDTOResponse.id} criado com sucesso!`);
        localStorage.removeItem('carrinhoId');
        window.location.href = `pedido-sucesso.html?id=${pedidoDTOResponse.id}`;

    } catch (error) {
        alert('Erro ao finalizar o pedido.');
    }
}


// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Carrega o carrinho imediatamente
    carregarCarrinho();

    // 2. Adiciona os listeners nos botões de ação fixos
    if (clearCartButton) clearCartButton.addEventListener('click', handleLimparCarrinho);
    if (finalizeButton) finalizeButton.addEventListener('click', handleFinalizarCompra);

    // 3. Adiciona o listener PAI para os botões dos itens
    if (cartListDiv) cartListDiv.addEventListener('click', handleAcoesItens);
});