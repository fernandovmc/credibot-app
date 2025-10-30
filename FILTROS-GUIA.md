# Guia: Implementando Filtros Independentes de Página + Infinite Scroll

## 📋 Problema Atual

Atualmente, os filtros funcionam apenas no **frontend** sobre os dados da página atual:

```
┌─────────────────────────────────────────┐
│ 1. API retorna página 1 (25 clientes)   │
│ 2. Frontend filtra esses 25 clientes    │
│ 3. Resultado: apenas clientes da pág 1  │
└─────────────────────────────────────────┘
```

**Exemplo prático do problema:**
- Total de clientes: 500
- Você busca por "Silva"
- Resultado esperado: ~50 clientes "Silva" em todo o dataset
- Resultado atual: ~2-3 "Silva" apenas na página 1 visualizada

---

## ✅ Solução: Usar Filtros da API + Infinite Scroll

A **API já suporta filtros!** (veja `API-DOCS.md` linhas 109-121)

Fluxo correto com Infinite Scroll:

```
┌──────────────────────────────────────────────────────────┐
│ 1. Usuário scrolleia até o fim da lista                  │
│ 2. Frontend detecta e carrega próxima página             │
│    GET /clientes?search=silva&page=2&per_page=25        │
│ 3. API retorna mais resultados filtrados                │
│ 4. Frontend concatena aos resultados anteriores          │
│ 5. Lista cresce dinamicamente sem paginação buttons     │
└──────────────────────────────────────────────────────────┘
```

---

## 🔧 Filtros Disponíveis na API

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `search` | string | Busca por nome (case-insensitive) | `search=silva` |
| `score_min` | int | Score mínimo (0-1000) | `score_min=700` |
| `score_max` | int | Score máximo (0-1000) | `score_max=900` |
| `classe_risco` | string | Classe de risco | `classe_risco=Baixo` |
| `tipo_pessoa` | string | Tipo: PF ou PJ | `tipo_pessoa=PF` |
| `ativo` | boolean | Status ativo | `ativo=true` |
| `page` | int | Número da página | `page=1` |
| `per_page` | int | Itens por página | `per_page=25` |

---

## 🚀 Arquitetura de Infinite Scroll

### Estado do Componente

```typescript
const [clientes, setClientes] = useState<Cliente[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);
const observerTarget = useRef<HTMLDivElement>(null);
```

### Fluxo de Dados

```
┌─────────────────────────────────────────┐
│ Filtros Mudam                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Reset: page = 1, clientes = []          │
│ Load primeira página                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Usuário scrolleia até o fim             │
│ IntersectionObserver dispara evento     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Se hasMore && !loading:                 │
│ Carregar página seguinte (page + 1)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Concatenar novos clientes aos antigos   │
│ Atualizar totalPages e hasMore          │
└─────────────────────────────────────────┘
```

---

## 📝 Implementação

### Ver `FRONTEND-GUIA.md` para implementação completa

---

## ⚠️ Considerações Importantes

### 1. **Não Mesclar com Paginação Tradicional**
```typescript
// ❌ ERRADO - Não usar botões Anterior/Próxima com infinite scroll
{totalPages > 1 && <PaginationButtons />}

// ✅ CERTO - Apenas infinite scroll
{hasMore && <InfiniteScrollIndicator />}
```

### 2. **Reset ao Mudar Filtros**
```typescript
useEffect(() => {
  // Resetar ao mudar qualquer filtro
  setCurrentPage(1);
  setClientes([]);
  setHasMore(true);
}, [searchTerm, scoreRange, typeFilter]);
```

### 3. **Evitar Requisições Duplicadas**
```typescript
// ✅ Usar flag loading
if (loading || !hasMore) return;

// ✅ Usar useCallback para memoizar função
const loadMore = useCallback(() => {
  // carregar
}, [currentPage, filtros]);
```

---

## 📊 Performance Esperada

| Métrica | Com Paginação | Com Infinite Scroll |
|---------|---------------|-------------------|
| Requisições iniciais | 1 | 1 |
| Requisições para página 5 | 5 | Depende de scroll |
| UX | Clique manual | Automático |
| Feedback visual | Números | Spinner |

---

## 📚 Documentos Relacionados

### 🎯 Por Onde Começar?

1. **Leia este documento** (`FILTROS-GUIA.md`) - Entenda o problema
2. **Leia `BACKEND-GUIA.md`** - Verifique que a API está pronta
3. **Siga `FRONTEND-GUIA.md`** - Implemente infinite scroll
4. **Consulte `API-DOCS.md`** - Referência completa de endpoints

### 📖 Descrição dos Guias

- **FILTROS-GUIA.md** (este documento): Visão geral do problema, solução, e arquitetura de infinite scroll
- **BACKEND-GUIA.md**: Verificação se API tem filtros funcionando + otimizações recomendadas (indexação, validação)
- **FRONTEND-GUIA.md**: Passo-a-passo completo para implementar infinite scroll em `src/app/clientes/page.tsx`
- **API-DOCS.md**: Documentação oficial de todos os endpoints e parâmetros

---

## 🎯 Resultado Final

**Antes:**
```
Página 1 → Clique "Próxima" → Página 2
Filtros desapareciam ao navegar
Paginação botões feios
```

**Depois:**
```
Scroll → Carrega automaticamente
Filtros persistem entre scrolls
Experiência moderna e fluida ✅
```
