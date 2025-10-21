# Credibot - Sistema de Análise de Crédito

Plataforma web moderna para análise de crédito e gestão de clientes, desenvolvida com Next.js 15, React 19, TypeScript e shadcn/ui.

## Funcionalidades

- **Dashboard**: Visão geral com métricas e indicadores principais
- **Gestão de Clientes**:
  - Listagem paginada de clientes
  - Visualização detalhada com gráficos e métricas
  - Classificação por score de crédito e classe de risco
- **Chat IA**: Interface conversacional para consultas inteligentes sobre clientes e análises de crédito
- **Tema Dark**: Interface moderna com tema escuro

## Tecnologias

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19
- **Estilização**: Tailwind CSS 4 + shadcn/ui
- **Linguagem**: TypeScript
- **Gráficos**: Recharts
- **Ícones**: Lucide React

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e configure a URL da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Para produção, use a URL da API em produção.

### 3. Executar em desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:5000](http://localhost:5000)

**Nota:** O frontend roda na porta 5000, enquanto a API backend deve rodar na porta 3000.

### 4. Build para produção

```bash
npm run build
npm start
```

O servidor de produção também rodará na porta 5000.

## Estrutura do Projeto

```
credibot-app/
├── src/
│   ├── app/                 # Páginas Next.js (App Router)
│   │   ├── page.tsx        # Dashboard
│   │   ├── clientes/       # Listagem de clientes
│   │   │   └── [id]/       # Detalhes do cliente
│   │   └── chat/           # Chat IA
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes shadcn/ui
│   │   └── sidebar.tsx     # Sidebar de navegação
│   ├── services/            # Serviços de API
│   │   └── api.ts          # Cliente de API
│   ├── types/               # Definições TypeScript
│   │   └── index.ts        # Tipos e interfaces
│   └── lib/                 # Utilitários
│       └── utils.ts        # Funções auxiliares
├── public/                  # Arquivos estáticos
└── API-DOCS.md             # Documentação da API
```

## Recursos da Interface

### Dashboard
- Cards com métricas principais
- Visão geral do sistema
- Links rápidos para funcionalidades

### Clientes
- Listagem em cards com paginação
- Busca e filtros
- Indicadores visuais de score e risco
- Detalhes completos com gráficos:
  - Evolução do score (gráfico de barras)
  - Distribuição do score (gráfico de pizza)
  - Informações detalhadas do cliente

### Chat IA
- Interface similar ao Claude.ai
- Consultas em linguagem natural
- Respostas inteligentes sobre clientes e scores
- Histórico de conversas

## API

A aplicação consome a API Credibot. Consulte [API-DOCS.md](./API-DOCS.md) para documentação completa dos endpoints.

### Principais Endpoints Utilizados

- `GET /api/v1/clientes` - Lista clientes com paginação
- `GET /api/v1/cliente/:id` - Detalhes de um cliente
- `POST /api/v1/smart-chat` - Chat inteligente com IA

## Personalização

### Temas

O tema dark está configurado por padrão. Para personalizar as cores, edite o arquivo [src/app/globals.css](src/app/globals.css).

### Componentes shadcn/ui

Os componentes do shadcn/ui estão em [src/components/ui/](src/components/ui/). Você pode adicionar novos componentes usando:

```bash
npx shadcn@latest add [component-name]
```

## Licença

ISC
