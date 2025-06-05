# iPass Email Auto

Sistema automatizado de resposta a e-mails baseado em regras personalizáveis.

## 🚀 Sobre o Projeto

iPass Email Auto é uma solução MVP (Minimum Viable Product) que automatiza respostas a e-mails com base em regras predefinidas. O sistema utiliza autenticação Google OAuth2 para garantir segurança e facilidade de acesso.

## 📝 Changelog

### [1.0.2] - 2024-01-05
#### Melhorias na Persistência de Login
- Adicionada validação de token JWT
- Implementada verificação de expiração do token
- Adicionada rota de validação de sessão no backend
- Melhorado tratamento de sessões inválidas
- Adicionadas notificações para problemas de autenticação
- Implementada lógica de refresh automático da sessão

### [1.0.1] - 2024-01-05
#### Melhorias na Autenticação
- Adicionado feedback visual durante o processo de login
- Implementado indicadores de carregamento nos botões
- Melhorado tratamento de erros com mensagens mais descritivas
- Adicionadas notificações toast para feedback do usuário
- Desabilitado campos de entrada durante o processo de autenticação
- Adicionado ícone do Google no botão de login social

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js
- Express
- TypeScript
- Prisma (ORM)
- Passport.js (Autenticação Google)
- JWT (Tokens)

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Query
- React Router DOM
- Axios

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- PostgreSQL
- Conta Google Cloud Platform (para OAuth2)

## 🔧 Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/iPass-emailauto.git
cd iPass-emailauto
```

2. Instale as dependências do backend
```bash
cd backend
npm install
```

3. Configure as variáveis de ambiente do backend
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrações do banco de dados
```bash
npx prisma migrate dev
```

5. Instale as dependências do frontend
```bash
cd ../frontend
npm install
```

6. Configure as variáveis de ambiente do frontend
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

## 🚀 Executando o Projeto

1. Inicie o backend
```bash
cd backend
npm run dev
```

2. Inicie o frontend
```bash
cd frontend
npm run dev
```

## 🔐 Configuração do Google OAuth2

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Configure as credenciais OAuth2
4. Adicione as URLs de redirecionamento:
   - http://localhost:3333/api/auth/google/callback (desenvolvimento)
   - https://seu-dominio.com/api/auth/google/callback (produção)

## 📦 Estrutura do Projeto

```
iPass-emailauto/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── services/
│   └── prisma/
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   └── services/
    └── public/
```

## 🔄 Versão

- Versão atual: 1.0.0 (MVP)

## 👥 Autores

* **Seu Nome** - *Trabalho Inicial* - [seu-usuario](https://github.com/seu-usuario)

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes 