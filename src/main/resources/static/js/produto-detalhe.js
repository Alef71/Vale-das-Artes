document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:8080/api';
    
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');

    if (!produtoId) {
        console.error('ID do produto não encontrado na URL');
        document.querySelector('main').innerHTML = `
            <div style="text-align:center; margin-top:50px;">
                <h2>Produto não especificado.</h2>
                <a href="index.html" class="btn-voltar">Ir para Início</a>
            </div>`;
        return;
    }

    carregarProduto();
    carregarAvaliacoes();

    const formAvaliacao = document.getElementById('form-avaliacao');
    if (formAvaliacao) {
        formAvaliacao.addEventListener('submit', enviarAvaliacao);
    }

    async function carregarProduto() {
        try {
            const response = await fetch(`${API_BASE_URL}/produtos/${produtoId}`);
            if (!response.ok) throw new Error('Erro ao buscar produto');
            
            const produto = await response.json();
            let telefoneResgatado = null;

            if (produto.telefone) telefoneResgatado = produto.telefone;
            else if (produto.artista && produto.artista.telefone) telefoneResgatado = produto.artista.telefone;
            
            if (!telefoneResgatado && (produto.artista || produto.artesaoId)) {
                try {
                    const idArtista = produto.artista ? produto.artista.id : produto.artesaoId;
                    const resArtista = await fetch(`${API_BASE_URL}/artistas/${idArtista}`);
                    if (resArtista.ok) {
                        const dadosArtista = await resArtista.json();
                        telefoneResgatado = dadosArtista.telefone; 
                    }
                } catch (err) { console.error(err); }
            }

            produto.telefone_final = telefoneResgatado;
            
            const elNome = document.getElementById('nome-produto');
            const elDesc = document.getElementById('descricao-produto');
            const elPreco = document.getElementById('preco-produto');
            const elImg = document.getElementById('img-produto');

            if (elNome) elNome.textContent = produto.nome;
            if (elDesc) elDesc.textContent = produto.descricao;
            
            if (elPreco) {
                elPreco.textContent = produto.preco 
                    ? produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                    : 'R$ 0,00';
            }

            if (elImg) {
                elImg.src = produto.fotoUrl || 'https://via.placeholder.com/400?text=Sem+Foto';
            }

            const linkArtesao = document.getElementById('link-artesao');
            if (linkArtesao) {
                let nomeArtesao = 'Artesão Parceiro';
                let idArtesao = null;
                if (produto.artista) {
                    nomeArtesao = produto.artista.nome;
                    idArtesao = produto.artista.id;
                } else if (produto.artesaoNome) {
                    nomeArtesao = produto.artesaoNome;
                    idArtesao = produto.artesaoId;
                }
                linkArtesao.textContent = nomeArtesao;
                if (idArtesao) linkArtesao.href = `perfil-artesao.html?id=${idArtesao}`;
            }
            
            const btnAdd = document.getElementById('btn-add-carrinho');
            if (btnAdd) {
                const novoBtn = btnAdd.cloneNode(true);
                btnAdd.parentNode.replaceChild(novoBtn, btnAdd);
                novoBtn.addEventListener('click', () => adicionarAoCarrinho(produto));
            }

        } catch (error) {
            console.error(error);
            document.querySelector('main').innerHTML = `<h2 style="text-align:center; margin-top:50px; color:red;">Produto não encontrado</h2>`;
        }
    }

    function adicionarAoCarrinho(produto) {
        const qtdInput = document.getElementById('quantidade');
        const quantidade = parseInt(qtdInput ? qtdInput.value : 1) || 1;

        if (quantidade < 1) {
            alert("Selecione pelo menos 1 unidade.");
            return;
        }

        let rawPhone = produto.telefone_final || "5533999999999"; 
        rawPhone = rawPhone.toString().replace(/\D/g, ''); 
        if (!rawPhone.startsWith('55') && rawPhone.length >= 10) {
            rawPhone = '55' + rawPhone; 
        }

        const nomeArtesao = produto.artista ? produto.artista.nome : (produto.artesaoNome || 'Vale das Artes');

        const item = {
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            fotoUrl: produto.fotoUrl,
            quantidade: quantidade,
            artesao: nomeArtesao,
            whatsapp: rawPhone 
        };

        let carrinho = JSON.parse(localStorage.getItem('carrinho_vale_artes')) || [];
        const index = carrinho.findIndex(i => i.id === item.id);
        if (index >= 0) {
            carrinho[index].quantidade += quantidade;
            carrinho[index].whatsapp = item.whatsapp; 
        } else {
            carrinho.push(item);
        }
        localStorage.setItem('carrinho_vale_artes', JSON.stringify(carrinho));
        
        exibirModalDecisao();
    }

    function exibirModalDecisao() {
        const modalExistente = document.getElementById('modal-carrinho-decisao');
        if (modalExistente) modalExistente.remove();

        const modalHTML = `
            <div id="modal-carrinho-decisao" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.7); z-index: 9999;
                display: flex; justify-content: center; align-items: center;
                animation: fadeIn 0.3s ease;">
                
                <div style="
                    background: #2C241B; /* MARROM ESCURO */
                    padding: 30px; 
                    border-radius: 12px;
                    border: 1px solid #3b3026;
                    width: 90%; max-width: 400px; text-align: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                    
                    <div style="font-size: 3rem; color: #EAE4D8; margin-bottom: 15px;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    
                    <h3 style="color: #E8DCCA; margin-bottom: 10px; font-weight: 600;">Produto Adicionado!</h3>
                    <p style="color: #E8DCCA; margin-bottom: 25px; opacity: 0.9;">O item já está no seu carrinho.</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button id="btn-modal-carrinho" style="
                            background: #EAE4D8; color: white; border: none; padding: 12px;
                            border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1rem;
                            transition: transform 0.2s;">
                            Ir para o Carrinho
                        </button>
                        
                        <button id="btn-modal-continuar" style="
                            background: transparent; 
                            color: #E8DCCA; /* Texto Bege */
                            border: 1px solid #E8DCCA; /* Borda Bege */
                            padding: 12px;
                            border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1rem;
                            transition: background 0.2s;">
                            Continuar Comprando
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const btnCarrinho = document.getElementById('btn-modal-carrinho');
        const btnContinuar = document.getElementById('btn-modal-continuar');

        btnContinuar.onmouseover = () => { 
            btnContinuar.style.background = '#3b3026'; 
        };
        btnContinuar.onmouseout = () => { 
            btnContinuar.style.background = 'transparent'; 
        };

        btnCarrinho.onclick = () => window.location.href = 'carrinho.html';
        btnContinuar.onclick = () => window.location.href = 'index.html';

        document.getElementById('modal-carrinho-decisao').onclick = (e) => {
            if (e.target.id === 'modal-carrinho-decisao') {
                window.location.href = 'index.html';
            }
        };
    }
    
    async function carregarAvaliacoes() {
        const lista = document.getElementById('lista-avaliacoes');
        if(!lista) return;
        lista.innerHTML = '<p>Carregando avaliações...</p>';

        try {
            const res = await fetch(`${API_BASE_URL}/avaliacoes/produto/${produtoId}?t=${new Date().getTime()}`);
            if(!res.ok) throw new Error('Falha');
            
            const avaliacoes = await res.json();
            
            if (!avaliacoes || avaliacoes.length === 0) {
                lista.innerHTML = '<p class="msg-vazia">Seja o primeiro a avaliar!</p>';
                return;
            }

            lista.innerHTML = avaliacoes.map(a => `
                <div class="avaliacao-item">
                    <div class="avaliacao-header">
                        <span class="avaliacao-nome">${a.nomeCliente || 'Anônimo'}</span> 
                        <span class="avaliacao-nota">${'★'.repeat(a.nota)}</span>
                    </div>
                    <p class="avaliacao-texto">${a.comentario}</p>
                </div>
            `).join('');

        } catch (error) {
            lista.innerHTML = '<p>Erro ao carregar avaliações.</p>';
        }
    }

    async function enviarAvaliacao(e) {
        e.preventDefault();
        
        const token = localStorage.getItem('userToken');
        const userId = localStorage.getItem('userId');
        const nomeUsuarioLogado = localStorage.getItem('userName'); 

        console.log("Tentando enviar avaliação como:", nomeUsuarioLogado); 

        if (!token || !userId) {
            alert("Faça login para avaliar.");
            window.location.href = 'login.html'; 
            return;
        }

        const notaInput = document.getElementById('nota-avaliacao');
        const comentarioInput = document.getElementById('comentario-avaliacao');
        
        const dto = {
            nota: parseFloat(notaInput.value),
            comentario: comentarioInput.value,
            produtoId: parseInt(produtoId),
            clienteId: parseInt(userId),
            nomeCliente: nomeUsuarioLogado 
        };

        try {
            const res = await fetch(`${API_BASE_URL}/avaliacoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(dto)
            });

            if (res.ok) {
                alert("Avaliação enviada!");
                comentarioInput.value = '';
                carregarAvaliacoes(); 
            } else {
                const erroData = await res.json().catch(() => ({}));
                alert("Erro ao enviar avaliação: " + (erroData.message || "Tente novamente"));
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        }
    }
});