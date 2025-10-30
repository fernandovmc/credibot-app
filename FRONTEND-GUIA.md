# Frontend Guide: Implementando Infinite Scroll + Lazy Loading

## 📋 Visão Geral

Este guia explica como refatorar `src/app/clientes/page.tsx` para usar **infinite scroll** em vez de paginação tradicional, com **lazy loading** de clientes conforme o usuário scrolleia.

---

## 🎯 Resultado Final

**Antes:**
```
┌──────────────────────────┐
│ Página 1 (25 clientes)   │
│ [Anterior] [Próxima]     │ ← Botões de paginação
└──────────────────────────┘
```

**Depois:**
```
┌──────────────────────────┐
│ Cliente 1                │
│ Cliente 2                │
│ ...                      │
│ Cliente 25               │
│ [Loading Spinner] ← Detecta quando scrolleia até aqui
│ Cliente 26               │
│ Cliente 27               │
│ ...
```

---

## 🚀 Passo 1: Atualizar o Serviço de API

### Arquivo: `src/services/api.ts`

Adicione uma função que aceite filtros e retorne clientes com paginação:

```typescript
export interface FilterParams {
  search?: string;
  scoreMin?: number;
  scoreMax?: number;
  classeRisco?: string;
  tipoPessoa?: "PF" | "PJ" | "all";
  ativo?: boolean;
  page?: number;
  perPage?: number;
}

export async function getClientes(filters: FilterParams = {}) {
  const params = new URLSearchParams();

  // Paginação
  params.append("page", String(filters.page || 1));
  params.append("per_page", String(filters.perPage || 25));

  // Filtros (apenas se fornecidos)
  if (filters.search) params.append("search", filters.search);
  if (filters.scoreMin !== undefined) params.append("score_min", String(filters.scoreMin));
  if (filters.scoreMax !== undefined) params.append("score_max", String(filters.scoreMax));
  if (filters.classeRisco) params.append("classe_risco", filters.classeRisco);
  if (filters.tipoPessoa && filters.tipoPessoa !== "all") {
    params.append("tipo_pessoa", filters.tipoPessoa);
  }
  if (filters.ativo !== undefined) params.append("ativo", String(filters.ativo));

  const response = await fetch(
    `${API_BASE_URL}/clientes?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch clientes");
  }

  return response.json();
}
```

---

## 🚀 Passo 2: Refatorar Estado do Componente

### Arquivo: `src/app/clientes/page.tsx`

**Substitua o estado antigo** por este novo estado de infinite scroll:

```typescript
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getClientes, FilterParams } from "@/services/api";

export default function ClientesPage() {
  // ============ ESTADO DE CLIENTES E PAGINAÇÃO ============
  const [clientes, setClientes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // ============ ESTADO DE FILTROS ============
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreRange, setScoreRange] = useState([0, 1000]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  // ============ REFS PARA INFINITE SCROLL ============
  const observerTarget = useRef<HTMLDivElement>(null);

  // ... resto do código
}
```

---

## 🚀 Passo 3: Implementar Infinite Scroll com IntersectionObserver

Adicione este effect **após** o estado do componente:

```typescript
// Effect: Setup IntersectionObserver para infinite scroll
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;

      // Detectou que usuário scrolleou até o final
      if (entry.isIntersecting && hasMore && !loading) {
        setCurrentPage((prev) => prev + 1);
      }
    },
    { threshold: 0.1 } // Dispara quando 10% do elemento está visível
  );

  if (observerTarget.current) {
    observer.observe(observerTarget.current);
  }

  return () => observer.disconnect();
}, [hasMore, loading]);
```

---

## 🚀 Passo 4: Effect para Carregar Próxima Página

Adicione este effect que executa quando `currentPage` muda:

```typescript
// Effect: Carregar clientes quando página muda
useEffect(() => {
  const loadMore = async () => {
    try {
      setLoading(true);

      const response = await getClientes({
        search: searchTerm || undefined,
        scoreMin: scoreRange[0] > 0 ? scoreRange[0] : undefined,
        scoreMax: scoreRange[1] < 1000 ? scoreRange[1] : undefined,
        tipoPessoa: typeFilter !== "all" ? (typeFilter as "PF" | "PJ") : undefined,
        page: currentPage,
        perPage: 25,
      });

      const { data, pagination } = response;

      // Concatenar novos clientes aos existentes (não substituir!)
      setClientes((prev) => [...prev, ...data]);

      // Atualizar informações de paginação
      setTotalPages(pagination.total_pages);
      setHasMore(currentPage < pagination.total_pages);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  loadMore();
}, [currentPage, searchTerm, scoreRange, typeFilter]);
```

---

## 🚀 Passo 5: Effect para Reset ao Mudar Filtros

Adicione este effect que **reseta a lista** quando filtros mudam:

```typescript
// Effect: Reset quando filtros mudam
useEffect(() => {
  setCurrentPage(1);
  setClientes([]);
  setHasMore(true);
}, [searchTerm, scoreRange, typeFilter]);
```

---

## 🚀 Passo 6: Remover Paginação de Botões

**Localize e remova** qualquer renderização de botões de paginação:

```typescript
// ❌ REMOVA ISTO:
{totalPages > 1 && (
  <div className="flex justify-center gap-4 mt-8">
    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
      Anterior
    </button>
    <span>Página {currentPage} de {totalPages}</span>
    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
      Próxima
    </button>
  </div>
)}
```

---

## 🚀 Passo 7: Adicionar Loading Indicator no Final

Substitua os botões de paginação por um **loading indicator** que aparece quando há mais dados:

```typescript
{/* Loading Indicator - Infinite Scroll */}
{hasMore && (
  <div
    ref={observerTarget}
    className="flex justify-center items-center py-12"
  >
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
      </div>
      <p className="text-sm text-muted-foreground">Carregando mais clientes...</p>
    </div>
  </div>
)}

{/* Mensagem quando não há mais dados */}
{!hasMore && clientes.length > 0 && (
  <div className="text-center py-8">
    <p className="text-sm text-muted-foreground">
      Você chegou ao final. Total de {clientes.length} clientes.
    </p>
  </div>
)}

{/* Estado vazio */}
{clientes.length === 0 && !loading && (
  <div className="text-center py-12">
    <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
  </div>
)}
```

---

## 📝 Estrutura Completa da Renderização

```typescript
export default function ClientesPage() {
  // ... Estado e Effects (veja passos anteriores)

  return (
    <div className="flex gap-6 px-6 py-8">
      {/* Sidebar de Filtros */}
      <div className="w-80 border-r border-border pr-6">
        {/* Search */}
        <div className="mb-6">
          {/* Implementação existente */}
        </div>

        {/* Range Slider */}
        <div className="mb-6">
          {/* Implementação existente */}
        </div>

        {/* Type Filter */}
        <div className="mb-6">
          {/* Implementação existente */}
        </div>

        {/* Sort Order */}
        <div>
          {/* Implementação existente */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes.map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))}
        </div>

        {/* Loading e fim da lista */}
        {hasMore && <LoadingIndicator ref={observerTarget} />}
        {!hasMore && clientes.length > 0 && <EndMessage />}
        {clientes.length === 0 && !loading && <EmptyState />}
      </div>
    </div>
  );
}
```

---

## 🔍 Fluxo de Dados Visual

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuário abre página                                  │
│    → currentPage = 1, clientes = []                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Effect loadMore executa (currentPage = 1)            │
│    → Busca GET /clientes?page=1&per_page=25            │
│    → setClientes([...data]) = [Cliente1...25]          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Usuário scrolleia até o final                        │
│    → IntersectionObserver detecta                       │
│    → setCurrentPage(2)                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Effect loadMore executa (currentPage = 2)            │
│    → Busca GET /clientes?page=2&per_page=25            │
│    → setClientes([...anterior, ...novosData])          │
│    → Agora tem Cliente1...50                            │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ Erros Comuns e Como Evitar

### 1. ❌ Substituir Array em Vez de Concatenar

```typescript
// ERRADO - Substitui lista anterior
setClientes(data);

// CORRETO - Concatena
setClientes((prev) => [...prev, ...data]);
```

### 2. ❌ Não Resetar ao Mudar Filtros

```typescript
// ERRADO - Muda filtro mas lista continua a pagina 2
const handleSearch = (term) => {
  setSearchTerm(term);
  // Esqueceu de resetar página!
};

// CORRETO
useEffect(() => {
  setCurrentPage(1);      // ← Reset obrigatório
  setClientes([]);        // ← Limpar lista
  setHasMore(true);       // ← Resetar hasMore
}, [searchTerm, scoreRange, typeFilter]);
```

### 3. ❌ IntersectionObserver Infinito

```typescript
// ERRADO - Carrega infinitamente sem parar
useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setCurrentPage((prev) => prev + 1); // ← Sempre incrementa!
    }
  });
  // Sem dependência de [hasMore, loading]
}, []);

// CORRETO - Para quando hasMore = false
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) { // ← Verifica hasMore
        setCurrentPage((prev) => prev + 1);
      }
    }
  );
}, [hasMore, loading]); // ← Dependências corretas
```

### 4. ❌ Sem Loading Flag

```typescript
// ERRADO - Faz requisição duplicada se usuário scrolleia rápido
if (currentPage > totalPages) return;
setClientes((prev) => [...prev, ...data]); // ← Pode executar 2x

// CORRETO - Flag previne requisições duplicadas
if (loading || !hasMore) return;
setLoading(true);
// ... depois setLoading(false)
```

---

## 📊 Checklist de Implementação

- [ ] Atualizado `src/services/api.ts` com função `getClientes(filters)`
- [ ] Estado de infinite scroll implementado (currentPage, totalPages, hasMore, loading)
- [ ] Effects implementados:
  - [ ] Effect para IntersectionObserver
  - [ ] Effect para carregar quando currentPage muda
  - [ ] Effect para reset quando filtros mudam
- [ ] Removed pagination buttons
- [ ] Loading indicator adicionado no final da lista
- [ ] End message adicionado quando `!hasMore`
- [ ] Empty state para quando `clientes.length === 0`
- [ ] Testado scroll até o final carrega mais clientes
- [ ] Testado mudar filtros reseta lista
- [ ] Testado não há requisições duplicadas

---

## 🧪 Testes Manual

### Teste 1: Infinite Scroll Carrega

1. Abrir página `/clientes`
2. Verificar que 25 clientes carregam
3. Scrollar até o final
4. **Esperado:** Mais 25 clientes carregam automaticamente
5. Total deve ser 50 clientes

### Teste 2: Mudança de Filtro Reseta

1. Scrollar até página 3 (75 clientes carregados)
2. Digitar um termo de busca (ex: "Silva")
3. **Esperado:** Lista reseta para 25 clientes apenas
4. Scrollar até final, mais 25 de "Silva" carregam

### Teste 3: Sem Requisições Duplicadas

1. Abrir DevTools → Network
2. Scrollar rápido até o final múltiplas vezes
3. **Esperado:** Apenas 1 requisição por página (não duplicadas)

### Teste 4: Fim da Lista

1. Scrollar até o final
2. **Esperado:** Mensagem "Você chegou ao final"
3. Loading spinner desaparece

---

## 🎨 CSS/Tailwind Adicional (se necessário)

Para o loading spinner com bounce animation:

```css
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(-10px);
    opacity: 0.7;
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
```

(Tailwind já inclui `animate-bounce`, não precisa adicionar)

---

## 📚 Referências

- **API-DOCS.md**: Documentação completa da API `/clientes`
- **FILTROS-GUIA.md**: Visão geral do problema
- **BACKEND-GUIA.md**: Verificação do backend
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Infinite Scroll Pattern](https://www.smashingmagazine.com/2013/05/infinite-scrolling-lets-get-to-the-bottom-of-this/)

---

## 🚀 Próximos Passos

1. Implementar os passos acima em `src/app/clientes/page.tsx`
2. Testar com o backend (ver `BACKEND-GUIA.md`)
3. Otimizar com lazy loading de imagens (se aplicável)
4. Adicionar cache (opcional, ver `API-DOCS.md` recomendações)
