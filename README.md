# iPass Email Auto

Sistema de automação de respostas de e-mail com integração ao Gmail.

## 📝 Changelog

### [1.0.8] - 2024-01-07
#### Melhorias na Autenticação e Rotas
- Implementado callback de autenticação OAuth2
- Melhorado sistema de rotas com proteção
- Atualizado contexto de autenticação
- Corrigido página de NotFound
- Atualizado dependências do projeto
- Melhorado feedback visual no login

### [1.0.7] - 2024-01-06
#### Implementação do Sistema de Automação de E-mails
- Implementado sistema de regras de automação
- Adicionado processador de e-mails em tempo real
- Implementado monitoramento automático da caixa de entrada
- Adicionado sistema de logs detalhados
- Melhorada integração com Gmail API
- Implementada gestão de tokens OAuth2
- Adicionado rate limiting para proteção da API

### [1.0.6] - 2024-01-05
#### Atualização da Documentação
- Adicionadas instruções de teste
- Melhorado README.md
- Documentada estrutura do projeto
- Atualizadas instruções de instalação

### [1.0.5] - 2024-01-05
#### Implementação de Testes Automatizados
- Configurado ambiente com Vitest e Testing Library
- Implementados testes para o componente de Login
- Implementados testes para o componente PrivateRoute
- Implementados testes para o ErrorBoundary
- Adicionada cobertura de testes
- Configurados mocks para testes

### [1.0.4] - 2024-01-05
#### Melhorias no Tratamento de Erros
- Implementado ErrorBoundary para captura de erros globais
- Adicionado interceptor Axios para tratamento de erros de API
- Melhorado feedback de erros com mensagens específicas
- Implementado tratamento de erros de rede

### [1.0.3] - 2024-01-05
#### Melhorias na Proteção de Rotas
- Implementado controle de acesso baseado em roles
- Adicionada verificação de permissões
- Criada página 404 personalizada
- Melhorado feedback durante carregamento

### [1.0.2] - 2024-01-05
#### Melhorias na Persistência de Login
- Adicionada validação de token JWT
- Implementada verificação de expiração
- Criada rota de validação de sessão
- Melhorado tratamento de sessões inválidas

### [1.0.1] - 2024-01-05
#### Melhorias na Autenticação
- Implementado feedback visual no processo de login
- Adicionados indicadores de carregamento
- Melhorado tratamento de erros
- Implementadas notificações toast
- Adicionado ícone do Google no botão de login

## Funcionalidades

### Autenticação
- Login com Google OAuth2
- Persistência de sessão com JWT
- Proteção de rotas baseada em roles

### Regras de Automação
- Criação e gerenciamento de regras personalizadas
- Condições flexíveis (remetente, destinatário, assunto, corpo)
- Múltiplas ações por regra (responder, encaminhar, arquivar, rotular)
- Priorização de regras
- Ativação/desativação de regras

### Processamento de E-mails
- Monitoramento automático da caixa de entrada
- Processamento em tempo real de novos e-mails
- Execução de ações baseadas em regras
- Log detalhado de todas as operações

## Tecnologias

### Backend
- Node.js com Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Google Gmail API
- JWT para autenticação
- Zod para validação
- Rate Limiting
- Morgan para logs

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Query
- React Router
- React Hook Form
- Zod para validação

## Configuração

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/iPass-emailauto.git
cd iPass-emailauto
```

2. Instale as dependências
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Configure as variáveis de ambiente
```bash
# Backend
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Frontend
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrações do banco de dados
```bash
cd backend
npx prisma migrate dev
```

5. Inicie os servidores
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Uso

1. Faça login com sua conta Google
2. Configure suas regras de automação:
   - Defina condições de correspondência
   - Configure ações automáticas
   - Estabeleça prioridades
3. Inicie o monitoramento
4. Acompanhe os logs de processamento

## Estrutura do Projeto

```
.
├── backend/
│   ├── prisma/
│   │   └── schema.prisma    # Modelos do banco de dados
│   ├── src/
│   │   ├── controllers/     # Controladores da API
│   │   ├── services/        # Lógica de negócio
│   │   ├── routes/          # Rotas da API
│   │   └── middlewares/     # Middlewares
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Componentes React
    │   ├── contexts/        # Contextos React
    │   ├── hooks/           # Hooks personalizados
    │   ├── pages/           # Páginas da aplicação
    │   └── services/        # Serviços de API
    └── package.json
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'feat: adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Autor

Seu Nome - [@seu-usuario](https://github.com/seu-usuario)

## Agradecimentos

- Google Gmail API
- Prisma
- React
- Express
- E todas as outras bibliotecas utilizadas 