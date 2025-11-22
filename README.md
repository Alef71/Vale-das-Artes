
# 🎨 Vale das Artes

Bem-vindo ao README do projeto Vale das Artes. Este guia é destinado a desenvolvedores que precisam configurar o ambiente de desenvolvimento local para começar a contribuir com o projeto.

O "Vale das Artes" é um projeto de marketplace focado em conectar artesãos locais (inicialmente do Vale do Jequitinhonha) diretamente com consumidores, valorizando a cultura e a autonomia local.

## 🛠️ Tecnologias Utilizadas

  * **Backend:** Java 17, Spring Boot 3.3.1, Spring Security (JWT)
  * **Banco de Dados:** PostgreSQL
  * **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS)
  * **Ferramentas:** Maven, Git, Docker, Swagger (Documentação da API)

## 📦 Pré-requisitos

Antes de começar, garanta que você tenha as seguintes ferramentas instaladas:

  * **Java 17 (JDK)**
  * **Maven** (geralmente já vem com a sua IDE)
  * **Docker Desktop** (Essencial para rodar o banco de dados facilmente)
  * Sua IDE preferida (VS Code, IntelliJ, Eclipse)
  * **Git**

-----

## 🚀 Como Rodar o Projeto (Setup Local)

Para rodar o projeto, você precisa de duas partes: o **Banco de Dados (PostgreSQL)** e o **Backend (Spring Boot)**.

### 1\. Clonar o Repositório

```bash
# Clone o projeto para a sua máquina
git clone https://github.com/Alef71/Vale-das-Artes.git

# Entre na pasta do projeto
cd vale-das-artes
```

### 2\. 🐳 Rodar o Banco de Dados (com Docker)

Nós usamos o Docker para subir o banco de dados PostgreSQL, pois ele garante que todos os desenvolvedores usem a mesma versão e as mesmas senhas (que já estão no `application.properties`).

1.  Verifique se você tem o arquivo `docker-compose.yml` na raiz do projeto.
2.  Abra seu terminal na raiz do projeto.
3.  Execute o seguinte comando para ligar o banco de dados em segundo plano:

<!-- end list -->

```bash
docker-compose up -d
```

O banco de dados `valedasartesdb` estará rodando na porta `localhost:5434`.

### 3\. ☕ Rodar o Backend (Spring Boot)

1.  Abra a pasta do projeto na sua IDE (IntelliJ, VS Code, etc.).
2.  Baixe todas as dependências do projeto rodando o comando `mvn install`.
3.  Aguarde o Maven baixar todas as dependências do `pom.xml`.
4.  Encontre e rode a classe principal: `src/main/java/br/com/valedasartes/ValeDasArtesApplication.java`.

Seu servidor backend estará rodando\!

-----

## 🌐 Acessando a Aplicação

Depois de ligar o Docker e o Spring Boot, tudo estará acessível:

  * **Site (Frontend):**
    `http://localhost:8080/`

  * **API (Backend):**
    `http://localhost:8080/api/`

  * **📄 Documentação da API (Swagger):**
    Para ver todos os endpoints (URLs) do backend, testá-los e ver os DTOs necessários, acesse o Swagger:
    `http://localhost:8080/swagger-ui/index.html`

## 📋 Organização de Tarefas (CSS)

Toda a divisão de tarefas do frontend e do CSS está sendo gerenciada pelo quadro **Kanban** do projeto no GitHub.

1.  Acesse a aba **`Projetos`** (Projects) no repositório.
2.  Veja as tarefas na coluna **"Todo" (A Fazer)**.
3.  Quando começar a trabalhar em uma, mova o cartão para **"In Progress" (Em Andamento)**.
