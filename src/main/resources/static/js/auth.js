document.addEventListener("DOMContentLoaded", function() {

    const API_BASE_URL = "http://localhost:8080"; 

    const viewLogin = document.getElementById("view-login");
    const viewSelection = document.getElementById("view-selection");
    const viewCadastro = document.getElementById("view-cadastro");
    const viewRecuperar = document.getElementById("view-recuperar");
    
    const btnIrCadastro = document.getElementById("btn-ir-cadastro");
    const btnVoltarLoginSel = document.getElementById("btn-voltar-login-sel");
    const btnVoltarSelecao = document.getElementById("btn-voltar-selecao");
    const btnEsqueciSenha = document.getElementById("btn-esqueci-senha");
    const btnVoltarLoginRec = document.getElementById("btn-voltar-login-rec");
    
    const formLogin = document.getElementById("form-login");
    const formCadastro = document.getElementById("form-cadastro");
    const formRecuperar = document.getElementById("form-recuperar");
    
    const radioCliente = document.getElementById("radio-cliente"); 
    const radioArtesao = document.getElementById("radio-artesao"); 
    const extraArtesao = document.getElementById("extra-artesao"); 
    const tituloCadastro = document.getElementById("titulo-cadastro");

    let tokenRecuperacaoTemp = null;

    if(viewSelection) viewSelection.style.display = 'none';
    if(viewCadastro) viewCadastro.style.display = 'none';
    if(viewRecuperar) viewRecuperar.style.display = 'none';

    function showView(viewId) {
        [viewLogin, viewSelection, viewCadastro, viewRecuperar].forEach(v => {
            if(v) {
                v.classList.remove('active');
                v.style.display = 'none';
            }
        });
        const target = document.getElementById(viewId);
        if(target) {
            target.style.display = 'flex';
            setTimeout(() => target.classList.add('active'), 10);
        }
        
        if (viewId !== 'view-recuperar') {
            resetRecuperacaoForm();
        }
    }

    function resetRecuperacaoForm() {
        if (!formRecuperar) return;
        tokenRecuperacaoTemp = null;
        formRecuperar.reset();
        
        const senhaInput = document.getElementById("nova-senha-recuperacao");
        if (senhaInput) {
             formRecuperar.innerHTML = `
                <h2>Recuperar Senha</h2>
                <p>Informe CPF e WhatsApp para confirmar sua identidade.</p>
                <div class="input-group">
                    <label>Seu CPF</label>
                    <input type="text" id="recuperar-cpf" placeholder="000.000.000-00" required>
                </div>
                <div class="input-group">
                    <label>Seu WhatsApp</label>
                    <input type="text" id="recuperar-telefone" placeholder="(00) 00000-0000" required>
                </div>
                <button type="submit" class="btn-primary">Verificar Dados</button>
             `;
        }
    }

    if(btnIrCadastro) btnIrCadastro.addEventListener('click', (e) => { e.preventDefault(); showView('view-selection'); });
    if(btnVoltarLoginSel) btnVoltarLoginSel.addEventListener('click', (e) => { e.preventDefault(); showView('view-login'); });
    if(btnVoltarSelecao) btnVoltarSelecao.addEventListener('click', (e) => { e.preventDefault(); showView('view-selection'); });
    
    if(btnEsqueciSenha) btnEsqueciSenha.addEventListener('click', (e) => { e.preventDefault(); showView('view-recuperar'); });
    if(btnVoltarLoginRec) btnVoltarLoginRec.addEventListener('click', (e) => { e.preventDefault(); showView('view-login'); });

    document.addEventListener('roleSelected', (e) => {
        const role = e.detail; 
        if (role === 'cliente') {
            if(radioCliente) radioCliente.checked = true;
            if(extraArtesao) extraArtesao.style.display = 'none';
            if(tituloCadastro) tituloCadastro.innerText = "Cadastro de Cliente";
        } else {
            if(radioArtesao) radioArtesao.checked = true;
            if(extraArtesao) extraArtesao.style.display = 'block';
            if(tituloCadastro) tituloCadastro.innerText = "Cadastro de Artesão";
        }
        showView('view-cadastro');
    });

    async function apiFetch(endpoint, method = 'POST', body = null) {
        const token = localStorage.getItem('userToken');
        const headers = { 'Content-Type': 'application/json' };
    
        const config = { method: method, headers: headers };
        if (body) config.body = JSON.stringify(body);
    
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, config);
    
        if (!response.ok) {
            const text = await response.text();
            try {
                const jsonError = JSON.parse(text);
                throw new Error(jsonError.mensagem || jsonError.error || text);
            } catch(e) {
                throw new Error(text || `Erro ${response.status}`);
            }
        }
        if (response.status === 204) return null;
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    }

    if (formLogin) {
        formLogin.addEventListener("submit", async function(event) {
            event.preventDefault(); 
            const email = document.getElementById("login-email").value;
            const senha = document.getElementById("login-senha").value;
            const btn = formLogin.querySelector("button");
            const btnTextOriginal = btn.innerText;

            try {
                btn.disabled = true;
                btn.innerText = "Entrando...";

                const data = await apiFetch('/api/auth/login', 'POST', { email, senha });
                
                localStorage.setItem('userToken', data.token); 
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userId', data.userId);
                
                let fotoFinal = data.fotoUrl;
                let nomeFinal = data.nome;

                if (nomeFinal) localStorage.setItem('userName', nomeFinal);
                if (fotoFinal) localStorage.setItem('userPhoto', fotoFinal);
                
                if (data.role === 'ROLE_CLIENTE') {
                    window.location.href = 'dashboard-cliente.html';
                } else if (data.role === 'ROLE_ARTISTA') {
                    window.location.href = 'dashboard-artesao.html';
                } else {
                    window.location.href = 'dashboard-admin.html';
                }

            } catch (error) {
                alert("Erro ao entrar: " + error.message);
                btn.disabled = false;
                btn.innerText = btnTextOriginal;
            }
        });
    }

    if (formCadastro) {
        formCadastro.addEventListener("submit", async function(event) {
            event.preventDefault();
            const formData = new FormData(formCadastro);
            const dados = Object.fromEntries(formData.entries());
            const btn = formCadastro.querySelector("button[type='submit']");
            
            if (!dados.tipoConta) dados.tipoConta = radioCliente.checked ? 'cliente' : 'artesao';

            const telefoneParaEndereco = dados.telefoneEndereco && dados.telefoneEndereco.trim() !== "" 
                ? dados.telefoneEndereco 
                : dados.telefone;

            const payload = {
                nome: dados.nome,
                cpf: dados.cpf,
                telefone: dados.telefone,
                credencial: { email: dados.email, senha: dados.senha },
                endereco: {
                    logradouro: dados.logradouro,
                    numero: parseInt(dados.numero) || 0,
                    bairro: dados.bairro,
                    cidade: dados.cidade,
                    estado: dados.estado,
                    cep: dados.cep,
                    complemento: dados.complemento || "",
                    telefone: telefoneParaEndereco
                }
            };
            
            if (dados.tipoConta === 'artesao') {
                payload.nomeEmpresa = dados.nomeEmpresa;
                payload.cnpj = dados.cnpj;
            }
            const endpoint = dados.tipoConta === 'cliente' ? '/api/clientes' : '/api/artistas';

            try {
                btn.disabled = true;
                btn.innerText = "Cadastrando...";
                await apiFetch(endpoint, 'POST', payload);
                alert("Cadastro realizado! Faça login.");
                formCadastro.reset();
                showView('view-login'); 
            } catch (error) {
                alert(`Erro no cadastro: ${error.message}`);
            } finally {
                btn.disabled = false;
                btn.innerText = "Finalizar Cadastro";
            }
        });
    }

    if (formRecuperar) {
        formRecuperar.addEventListener("submit", async function(event) {
            event.preventDefault();
            const btn = formRecuperar.querySelector("button");
            
            if (tokenRecuperacaoTemp) {
                const novaSenha = document.getElementById("nova-senha-recuperacao").value;
                
                if (!novaSenha || novaSenha.length < 3) {
                    alert("A senha deve ter pelo menos 3 caracteres.");
                    return;
                }

                try {
                    btn.innerText = "Salvando...";
                    btn.disabled = true;

                    await apiFetch('/api/auth/salvar-nova-senha', 'POST', {
                        token: tokenRecuperacaoTemp,
                        novaSenha: novaSenha
                    });

                    alert("Sucesso! Senha alterada. Faça login com a nova senha.");
                    showView('view-login');
                    resetRecuperacaoForm();

                } catch (err) {
                    alert(err.message);
                } finally {
                    btn.disabled = false;
                    btn.innerText = "Salvar Senha";
                }
                return;
            }

            const cpfInput = document.getElementById("recuperar-cpf");
            const telInput = document.getElementById("recuperar-telefone");
            
            if (!cpfInput || !telInput) return;

            const cpf = cpfInput.value;
            const telefone = telInput.value;

            if (!cpf || !telefone) {
                alert("Preencha todos os campos.");
                return;
            }

            try {
                btn.disabled = true;
                btn.innerText = "Verificando...";

                const data = await apiFetch('/api/auth/esqueci-senha', 'POST', { 
                    cpf: cpf, 
                    telefone: telefone 
                });

                tokenRecuperacaoTemp = data.token;
                
                alert(data.mensagem || "Dados confirmados! Defina a nova senha.");

                formRecuperar.innerHTML = `
                    <h2>Definir Nova Senha</h2>
                    <p>Identidade confirmada. Digite sua nova senha abaixo.</p>
                    <div class="input-group">
                        <label>Nova Senha</label>
                        <input type="password" id="nova-senha-recuperacao" placeholder="Mínimo 6 caracteres" required>
                    </div>
                    <button type="submit" class="btn-primary" style="background-color: #2ecc71;">Salvar Nova Senha</button>
                `;

            } catch (error) {
                alert("Erro: " + error.message);
                btn.innerText = "Verificar Dados";
            } finally {
                btn.disabled = false;
            }
        });
    }
});