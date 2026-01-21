document.addEventListener("DOMContentLoaded", function() {
    
    const API_BASE_URL = "http://localhost:8080";
    const form = document.getElementById("form-nova-senha");
    const statusMsg = document.getElementById("status-msg");

    // 1. Captura o TOKEN da URL (ex: ?token=abc-123)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Se não tiver token, nem deixa tentar
    if (!token) {
        statusMsg.style.color = "red";
        statusMsg.innerText = "Erro: Link inválido ou expirado. Solicite novamente.";
        form.querySelector("button").disabled = true;
        form.querySelector("input").disabled = true;
    }

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const novaSenha = document.getElementById("nova-senha").value;
        const confirmaSenha = document.getElementById("confirma-senha").value;
        const btn = form.querySelector("button");

        // Validação básica
        if (novaSenha.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (novaSenha !== confirmaSenha) {
            alert("As senhas não coincidem.");
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        statusMsg.innerText = "";

        try {
            // Envia para o Backend: O Token (quem é) e a Senha (o que mudar)
            const response = await fetch(`${API_BASE_URL}/api/auth/salvar-nova-senha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    novaSenha: novaSenha
                })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Erro ao salvar senha");
            }

            // Sucesso
            statusMsg.style.color = "#4CAF50"; // Verde
            statusMsg.innerText = "Senha alterada com sucesso! Redirecionando...";
            
            setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);

        } catch (error) {
            console.error(error);
            statusMsg.style.color = "red";
            statusMsg.innerText = "Erro: " + error.message;
            btn.disabled = false;
            btn.innerHTML = 'Salvar Nova Senha';
        }
    });
});