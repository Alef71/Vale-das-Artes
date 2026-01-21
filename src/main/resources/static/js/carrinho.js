document.addEventListener('DOMContentLoaded', () => {
    
    
    const listaCarrinho = document.getElementById('lista-carrinho');
    const divVazio = document.getElementById('carrinho-vazio');
    const divConteudo = document.getElementById('conteudo-carrinho');
    const divLoading = document.getElementById('carrinho-loading');
    
    const spanTotal = document.getElementById('valor-total');
    const spanSubtotal = document.getElementById('valor-subtotal');
    const btnFinalizar = document.getElementById('btn-finalizar-compra');
    const btnLimpar = document.getElementById('btn-limpar-carrinho');
    const inputNome = document.getElementById('nome-cliente');
    const inputTelefone = document.getElementById('telefone-cliente');
    const inputRua = document.getElementById('rua');
    const inputNumero = document.getElementById('numero');
    const inputBairro = document.getElementById('bairro');
    const inputCidade = document.getElementById('cidade');
    
    
    renderizarCarrinho();

    
    function renderizarCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho_vale_artes')) || [];
        
        if(divLoading) divLoading.style.display = 'none';

        if (carrinho.length === 0) {
            if (divConteudo) divConteudo.style.display = 'none';
            if (divVazio) divVazio.style.display = 'block';
            return;
        }

        if (divVazio) divVazio.style.display = 'none';
        if (divConteudo) divConteudo.style.display = 'grid'; 
        
        listaCarrinho.innerHTML = ''; 

        let valorTotal = 0;

        carrinho.forEach((item, index) => {
            const subtotal = item.preco * item.quantidade;
            valorTotal += subtotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'carrinho-item';
            
            itemDiv.innerHTML = `
                <div class="item-info">
                    <img src="${item.fotoUrl || 'https://via.placeholder.com/80'}" alt="${item.nome}">
                    <div class="item-detalhes">
                        <h4>${item.nome}</h4>
                        <small>Artesão: ${item.artesao || 'Vale das Artes'}</small>
                        <p style="margin-top:5px; font-weight:bold;">${formatarMoeda(item.preco)}</p>
                    </div>
                </div>
                
                <div class="item-controles">
                    <div style="display:flex; align-items:center; gap:5px;">
                        <button onclick="alterarQuantidade(${index}, -1)" class="btn-qtd">-</button>
                        <span style="font-weight:600; min-width:20px; text-align:center;">${item.quantidade}</span>
                        <button onclick="alterarQuantidade(${index}, 1)" class="btn-qtd">+</button>
                    </div>
                    
                    <div style="text-align:right; margin-left:15px;">
                        <p style="font-weight:bold; color:var(--cor-secundaria);">${formatarMoeda(subtotal)}</p>
                        <button onclick="removerItem(${index})" class="btn-remover">Remover</button>
                    </div>
                </div>
            `;
            listaCarrinho.appendChild(itemDiv);
        });

        atualizarTotais(valorTotal);
    }

    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function atualizarTotais(valor) {
        if (spanTotal) spanTotal.textContent = formatarMoeda(valor);
        if (spanSubtotal) spanSubtotal.textContent = formatarMoeda(valor);
    }

    
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            
            
            if (!inputNome.value || !inputTelefone.value || !inputRua.value || !inputNumero.value || !inputBairro.value || !inputCidade.value) {
                alert("Por favor, preencha todos os dados de entrega.");
                return;
            }

            const carrinho = JSON.parse(localStorage.getItem('carrinho_vale_artes')) || [];
            if (carrinho.length === 0) return;
            const numeroArtesao = carrinho[0].whatsapp; 

            if (!numeroArtesao) {
                alert("Erro: O número de WhatsApp do artesão não foi encontrado nos dados do produto.");
                return;
            }

            const temMixDeArtesaos = carrinho.some(item => item.whatsapp !== numeroArtesao);
            
            if (temMixDeArtesaos) {
                alert("Seu carrinho contém produtos de artesãos diferentes!\n\nPor favor, finalize a compra de um artesão por vez para enviar a mensagem ao número correto.");
                return;
            }

    
            let mensagem = `*Olá! Novo pedido pelo site Vale das Artes:*\n\n`;
            
            let totalPedido = 0;
            carrinho.forEach(item => {
                const subtotal = item.preco * item.quantidade;
                totalPedido += subtotal;
                mensagem += `📦 ${item.quantidade}x *${item.nome}*\n`;
                mensagem += `   (Artesão: ${item.artesao}) - ${formatarMoeda(subtotal)}\n`;
            });

            mensagem += `\n💰 *Valor Total: ${formatarMoeda(totalPedido)}*\n`;
            
            mensagem += `\n------------------------------\n`;
            mensagem += `📍 *Dados do Cliente:*\n`;
            mensagem += `*Nome:* ${inputNome.value}\n`;
            mensagem += `*Contato:* ${inputTelefone.value}\n`;
            mensagem += `*Endereço:* ${inputRua.value}, Nº ${inputNumero.value}\n`;
            mensagem += `*Bairro:* ${inputBairro.value} - ${inputCidade.value}\n`;
            mensagem += `------------------------------\n`;
            mensagem += `Aguardo confirmação!`;

            const numeroLimpo = numeroArtesao.toString().replace(/\D/g, ''); 
            const linkWhatsapp = `https://wa.me/${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
            
            window.open(linkWhatsapp, '_blank');
        });
    }

    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            if (confirm("Deseja esvaziar todo o carrinho?")) {
                localStorage.removeItem('carrinho_vale_artes');
                renderizarCarrinho();
            }
        });
    }

    window.alterarQuantidade = function(index, delta) {
        let carrinho = JSON.parse(localStorage.getItem('carrinho_vale_artes')) || [];
        carrinho[index].quantidade += delta;
        if (carrinho[index].quantidade <= 0) {
            if (confirm("Remover este item?")) carrinho.splice(index, 1);
            else carrinho[index].quantidade = 1;
        }
        localStorage.setItem('carrinho_vale_artes', JSON.stringify(carrinho));
        renderizarCarrinho();
    };

    window.removerItem = function(index) {
        if(!confirm("Tem certeza que deseja remover?")) return;
        let carrinho = JSON.parse(localStorage.getItem('carrinho_vale_artes')) || [];
        carrinho.splice(index, 1);
        localStorage.setItem('carrinho_vale_artes', JSON.stringify(carrinho));
        renderizarCarrinho();
    };
});