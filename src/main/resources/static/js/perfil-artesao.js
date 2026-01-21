document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:8080/api';
    const params = new URLSearchParams(window.location.search);
    const artistaId = params.get('id');
    const gridProdutos = document.getElementById('grid-produtos');
    const mainContent = document.querySelector('main');
    const contadorEl = document.getElementById('contador-produtos');

    carregarPerfil();

    async function carregarPerfil() {
        if (!artistaId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/artistas/${artistaId}`);
            if (!response.ok) {
                if(mainContent) mainContent.innerHTML = "<h2 style='text-align:center; padding:50px;'>Artesão não encontrado</h2>";
                return;
            }

            const artista = await response.json();
            
            preencherInfoPerfil(artista);

            const todosProdutos = artista.produtos || [];
            const produtosAtivos = todosProdutos.filter(p => p.ativo === true);

            if (contadorEl) contadorEl.textContent = `${produtosAtivos.length} ITENS`;

            if (gridProdutos) {
                if (produtosAtivos.length === 0) {
                    gridProdutos.innerHTML = `<p class="loading-msg">Nenhuma peça disponível no momento.</p>`;
                    return;
                }

                let html = '';
                produtosAtivos.forEach(produto => {
                    html += criarCardProduto(produto); 
                });
                gridProdutos.innerHTML = html;
            }

        } catch (error) {
            console.error("Erro:", error);
            if (gridProdutos) gridProdutos.innerHTML = "<p class='loading-msg'>Erro de conexão.</p>";
        }
    }

    function preencherInfoPerfil(artista) {
        document.getElementById('nome-artesao').textContent = artista.nome || 'Artesão';
        
        const atelieTxt = artista.nomeEmpresa ? `Ateliê ${artista.nomeEmpresa}` : 'Ateliê de Artes';
        document.getElementById('texto-atelie').textContent = atelieTxt;
        document.getElementById('biografia-artesao').textContent = artista.biografia || `Olá! Bem-vindo ao meu espaço criativo.`;

        const imgElement = document.getElementById('img-artesao');
        if (imgElement) {
            imgElement.src = artista.fotoUrl 
                ? `${artista.fotoUrl}?t=${new Date().getTime()}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(artista.nome)}&background=fff&color=3E2B22&size=300`;
        }

        const btnZap = document.getElementById('btn-whatsapp');
        if (btnZap) {
            if (artista.telefone) {
                btnZap.onclick = () => {
                    const num = artista.telefone.replace(/\D/g, '');
                    window.open(`https://wa.me/55${num}`, '_blank');
                };
            } else {
                btnZap.style.display = 'none'; 
            }
        }

        const btnSeguir = document.getElementById('btn-seguir');
        if (btnSeguir) {
            btnSeguir.onclick = () => {
                const icon = btnSeguir.querySelector('i');
                if (icon.classList.contains('far')) {
                    icon.classList.replace('far', 'fas');
                    btnSeguir.style.color = '#e91e63'; 
                    btnSeguir.style.borderColor = '#e91e63';
                } else {
                    icon.classList.replace('fas', 'far');
                    btnSeguir.style.color = '';
                    btnSeguir.style.borderColor = '';
                }
            };
        }
    }

    function criarCardProduto(produto) {
        const capa = produto.fotoUrl || 'https://via.placeholder.com/300?text=Sem+Foto';
        const preco = produto.preco ? produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00';
        const urlDetalhe = `produto-detalhe.html?id=${produto.id}`;

        return `
            <div onclick="window.location.href='${urlDetalhe}'" 
                 style="background: #fff; border-radius: 12px; overflow: hidden; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: transform 0.2s;">
                
                <div style="aspect-ratio: 1/1; overflow: hidden;">
                    <img src="${capa}" alt="${produto.nome}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                
                <div style="padding: 12px;">
                    <p style="font-size: 0.7rem; color: #888; text-transform: uppercase; margin-bottom: 4px;">
                        ${produto.categoria || 'Artesanato'}
                    </p>
                    <h4 style="font-size: 0.95rem; color: #3E2B22; margin-bottom: 8px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${produto.nome}
                    </h4>
                    <span style="font-size: 1rem; font-weight: 700; color: #3E2B22;">
                        R$ ${preco}
                    </span>
                </div>
            </div>
        `;
    }
});