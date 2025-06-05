# iPass Email Auto

Sistema automatizado de resposta a e-mails baseado em regras personalizáveis.

## 🚀 Sobre o Projeto

iPass Email Auto é uma solução MVP (Minimum Viable Product) que automatiza respostas a e-mails com base em regras predefinidas. O sistema utiliza autenticação Google OAuth2 para garantir segurança e facilidade de acesso.

## 🧪 Testes

O projeto utiliza Vitest e Testing Library para testes automatizados. Para executar os testes:

```bash
# Executar todos os testes
npm run test

# Executar testes com interface visual
npm run test:ui

# Executar testes com cobertura
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

## 📝 Changelog

### [1.0.5] - 2024-01-05
#### Implementação de Testes Automatizados
- Configurado ambiente de testes com Vitest e Testing Library
- Implementados testes para o componente de Login
- Implementados testes para o componente PrivateRoute
- Implementados testes para o ErrorBoundary
- Adicionada cobertura de testes com relatórios
- Configurado ambiente de testes com mocks
- Adicionados scripts de teste no package.json

### [1.0.4] - 2024-01-05
#### Melhorias no Tratamento de Erros
- Implementado ErrorBoundary para captura de erros globais
- Adicionado interceptor Axios para tratamento de erros de API
- Melhorado feedback de erros com mensagens específicas
- Implementado tratamento de erros de rede
- Adicionado suporte a diferentes códigos de status HTTP
- Melhorada UX durante erros com feedback visual
- Implementado sistema de notificações toast para erros

### [1.0.3] - 2024-01-05
#### Melhorias na Proteção de Rotas
- Implementado sistema de controle de acesso baseado em roles
- Adicionada verificação de permissões por rota
- Melhorado feedback visual durante verificação de autenticação
- Adicionadas notificações para acesso não autorizado
- Implementada página 404 personalizada
- Melhorada UX durante carregamento de rotas protegidas

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

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router DOM
- Axios
- React Toastify
- JWT Decode
- Vitest
- Testing Library

### Backend
- Node.js
- Express
- TypeScript
- Prisma
- Passport.js
- JWT
- Google OAuth2

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- PostgreSQL
- Conta Google Cloud Platform (para OAuth2)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/LuisCarlos01/iPass-emailauto.git
cd iPass-emailauto
```

2. Instale as dependências do backend:
```bash
cd backend
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Instale as dependências do frontend:
```bash
cd ../frontend
npm install
```

5. Configure as variáveis de ambiente do frontend:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

## 🚀 Executando o Projeto

1. Inicie o backend:
```bash
cd backend
npm run dev
```

2. Em outro terminal, inicie o frontend:
```bash
cd frontend
npm run dev
```

3. Acesse o projeto em `http://localhost:5173`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

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