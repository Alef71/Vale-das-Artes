# Vale das Artes - API

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

Um projeto de e-commerce social dedicado a dar visibilidade, gerar renda e empoderar os artesãos do Vale do Jequitinhonha. A plataforma cria uma ponte digital entre a riqueza cultural da região e o consumidor final, valorizando histórias e preservando saberes tradicionais.

---

### 🌟 Visão do Projeto

Em cada peça de artesanato feita à mão pulsa uma história. O artesanato é muito mais do que bonito: é um elo vivo com as nossas raízes. Com isso, queremos alavancar a região do Vale do Jequitinhonha, conhecida como o "O vale da miséria", e mostrar que somos ricos em tradição e cultura.

Os objetivos específicos são:
* **Contar as histórias dos artesãos:** Dar visibilidade à trajetória, às técnicas e à inspiração por trás de cada artesão e sua obra.
* **Promover a educação e o turismo cultural:** Servir como um portal de informações sobre a cultura local.
* **Gerar renda e empoderamento:** Criar um novo canal de vendas para os artesãos, contribuindo para sua autonomia financeira.
* **Preservar técnicas e saberes tradicionais:** Documentar e divulgar o processo de criação.

Como defendia Paulo Freire, "a inclusão acontece quando se aprende com as diferenças e não com as igualdades". Essa é a ideia.

---

### ✨ Funcionalidades Implementadas

* **API REST Completa** com operações CRUD para todas as entidades principais.
* **Gestão de Entidades:** Produtos, Artistas, Clientes e Administradores.
* **Fluxo de Compra:** Lógica completa de Carrinho de Compras e finalização de Pedidos.
* **Sistema Financeiro:** Cálculo automático de comissão (10%) e valor de repasse para o artesão a cada venda.
* **Relatórios:** Endpoint para gerar relatórios financeiros detalhados por artesão.
* **Autenticação e Segurança:** Sistema de login seguro com JWT (JSON Web Token).
* **Validação de Dados:** Regras de validação em todos os endpoints de criação e atualização para garantir a integridade dos dados.
* **Tratamento de Erros Global:** Respostas de erro padronizadas e amigáveis.
* **Documentação Interativa:** Geração automática de documentação da API com Swagger (SpringDoc OpenAPI).

---

### 🛠️ Tecnologias Utilizadas

* **Linguagem:** Java 17 (LTS)
* **Framework:** Spring Boot 3.3.1
* **Acesso a Dados:** Spring Data JPA / Hibernate
* **Segurança:** Spring Security com autenticação JWT
* **Base de Dados:** PostgreSQL
* **Ambiente de Desenvolvimento:** Docker e Docker Compose
* **Gestão do Projeto:** Maven
* **Documentação:** SpringDoc OpenAPI (Swagger)

---

### 🚀 Como Executar o Projeto Localmente

Siga os passos abaixo para ter a API a funcionar na sua máquina.

#### Pré-requisitos
* [Java 17 (ou superior)](https://www.oracle.com/java/technologies/downloads/#java17)
* [Maven 3.8 (ou superior)](https://maven.apache.org/download.cgi)
* [Docker](https://www.docker.com/products/docker-desktop/) e [Docker Compose](https://docs.docker.com/compose/install/)

---

#### Passos
Inicie a Base de Dados com Docker:
No terminal, na raiz do projeto, execute o comando para iniciar o contêiner do PostgreSQL em segundo plano.

Bash

docker-compose up -d
Execute a Aplicação Spring Boot:
Ainda no terminal, execute o comando Maven para iniciar a API.

Bash

mvn spring-boot:run
Aguarde até ver no log a mensagem Started ValeDasArtesApplication.... 

A sua API estará a funcionar em http://localhost:8080.

---

📚 Documentação da API (Swagger)
Com a aplicação em execução, pode aceder à documentação interativa da API no seu navegador:

http://localhost:8080/swagger-ui.html

Lá, você pode visualizar todos os endpoints, os modelos de dados e testar a API diretamente pelo navegador.

👤 Autor
Alef Amaral - GitHub

📄 Licença
Este projeto está licenciado sob a Licença MIT.
