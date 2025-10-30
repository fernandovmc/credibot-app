# Backend Guide: Implementando Filtros + Paginação para Infinite Scroll

## 📋 Status Atual

Ótima notícia: **A API já suporta todos os filtros necessários!** Conforme documentado em `API-DOCS.md` (linhas 109-121), o endpoint `/api/v1/clientes` já implementa:

- Filtros de search, score_min, score_max
- Filtros de tipo_pessoa, classe_risco, ativo
- Paginação com `page` e `per_page`

---

## ✅ Verificação de Implementação

### 1. Confirmar que os Filtros Estão Ativos

Teste os endpoints abaixo para confirmar que estão funcionando:

```bash
# Teste 1: Busca por nome
curl "http://localhost:3000/api/v1/clientes?search=silva&page=1&per_page=25"

# Teste 2: Filtro por score
curl "http://localhost:3000/api/v1/clientes?score_min=700&score_max=900&page=1"

# Teste 3: Filtro por tipo de pessoa
curl "http://localhost:3000/api/v1/clientes?tipo_pessoa=PF&page=1"

# Teste 4: Combinação de filtros
curl "http://localhost:3000/api/v1/clientes?search=joão&score_min=750&classe_risco=Baixo&tipo_pessoa=PF&ativo=true&page=1&per_page=25"
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "nome": "João Silva",
      "cpf_cnpj": "123.456.789-00",
      "score_credito": 750,
      "classe_risco": "Baixo",
      "tipo_pessoa": "PF",
      "ativo": true
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 25,
    "total": 150,
    "total_pages": 6
  },
  "message": "Clientes retrieved successfully"
}
```

---

## 🚀 Otimizações Recomendadas (Opcional)

Se os filtros estão funcionando, considere estas otimizações para melhor performance com infinite scroll:

### 1. **Indexes no Banco de Dados**

Para queries rápidas de filtro, adicione índices:

```sql
-- Índice para busca por nome
CREATE INDEX idx_clientes_nome ON clientes(nome);

-- Índice para filtro de score (range queries)
CREATE INDEX idx_clientes_score_credito ON clientes(score_credito);

-- Índice para tipo de pessoa
CREATE INDEX idx_clientes_tipo_pessoa ON clientes(tipo_pessoa);

-- Índice para classe de risco
CREATE INDEX idx_clientes_classe_risco ON clientes(classe_risco);

-- Índice para status ativo
CREATE INDEX idx_clientes_ativo ON clientes(ativo);

-- Índice composto para queries complexas (mais eficiente)
CREATE INDEX idx_clientes_combined ON clientes(ativo, tipo_pessoa, score_credito);
```

### 2. **Validação de Parâmetros**

Verifique que o backend valida corretamente:

```typescript
// Exemplo: score_min deve ser 0-1000
if (scoreMin < 0 || scoreMin > 1000) {
  return { error: true, message: "score_min deve estar entre 0 e 1000", code: 400 };
}

// Exemplo: tipo_pessoa deve ser PF ou PJ
if (tipoPessoa && !['PF', 'PJ'].includes(tipoPessoa)) {
  return { error: true, message: "tipo_pessoa deve ser PF ou PJ", code: 400 };
}

// Exemplo: page e per_page devem ser positivos
if (page < 1 || perPage < 1 || perPage > 100) {
  return { error: true, message: "Parâmetros de paginação inválidos", code: 400 };
}
```

### 3. **Otimização de Query (SQL)**

Exemplo de query otimizada (Go/SQL):

```sql
SELECT
  id, nome, cpf_cnpj, score_credito, classe_risco, tipo_pessoa, ativo
FROM clientes
WHERE
  1=1
  AND (nome ILIKE $1 OR $1 IS NULL)                          -- search parameter
  AND (score_credito >= $2 OR $2 IS NULL)                    -- score_min
  AND (score_credito <= $3 OR $3 IS NULL)                    -- score_max
  AND (classe_risco = $4 OR $4 IS NULL)                      -- classe_risco
  AND (tipo_pessoa = $5 OR $5 IS NULL)                       -- tipo_pessoa
  AND (ativo = $6 OR $6 IS NULL)                             -- ativo
  AND ativo = true                                            -- sempre filtrar inativos? (opcional)
ORDER BY created_at DESC
LIMIT $7 OFFSET $8
```

### 4. **Paginação com Offset (Método Atual)**

O método atual usa `OFFSET`, que é adequado para infinite scroll:

```
Page 1: LIMIT 25 OFFSET 0   (items 1-25)
Page 2: LIMIT 25 OFFSET 25  (items 26-50)
Page 3: LIMIT 25 OFFSET 50  (items 51-75)
...
```

---

## ⚠️ Considerações Importantes

### 1. **Não mude `per_page` durante Infinite Scroll**

```typescript
// ❌ ERRADO - Mudar durante scroll causa inconsistências
if (page === 1) perPage = 25;
if (page === 2) perPage = 50; // ❌ NUNCA faça isso!

// ✅ CERTO - Manter consistente
const PER_PAGE = 25; // constante
```

### 2. **Filtros Devem ser Persistentes**

Quando mudar filters, resetar paginação:

```typescript
// ✅ CORRETO
useEffect(() => {
  setPage(1);           // resetar página
  setClientes([]);      // limpar lista anterior
  // carregar com novos filtros
}, [searchTerm, scoreRange, typeFilter]);
```

### 3. **Total de Registros é Importante**

Use `total` retornado pela API para:
- Calcular se há mais páginas: `hasMore = page < total_pages`
- Mostrar ao usuário: "Mostrando 1-25 de 150 clientes"

```typescript
const hasMore = pagination.page < pagination.total_pages;
```

### 4. **Performance com Filtros Vazios**

Se usuário limpar todos os filtros, será retornado lista completa (até 100 itens por request):

```typescript
// Teste com todos os filtros vazios
GET /api/v1/clientes?page=1&per_page=25
```

---

## 📊 Resposta da API - Campos Importantes

```json
{
  "success": true,
  "data": [ /* array de clientes */ ],
  "pagination": {
    "page": 1,
    "per_page": 25,
    "total": 150,           // ← Total de registros (todos os filtros)
    "total_pages": 6        // ← Total de páginas (important for hasMore)
  },
  "message": "Clientes retrieved successfully"
}
```

---

## 🔧 Checklist de Verificação

- [ ] Endpoint `/api/v1/clientes` retorna dados corretos
- [ ] Parâmetro `search` funciona (case-insensitive, partial match)
- [ ] Parâmetros `score_min` e `score_max` funcionam
- [ ] Parâmetro `tipo_pessoa` aceita "PF" e "PJ"
- [ ] Parâmetro `classe_risco` filtra corretamente
- [ ] Parâmetro `ativo` funciona como boolean
- [ ] Parâmetro `page` começa em 1
- [ ] Parâmetro `per_page` respeita máximo de 100
- [ ] Response inclui `pagination.total` e `pagination.total_pages`
- [ ] Filtros podem ser combinados
- [ ] Sem filtros, retorna primeiros 25 clientes ordenados por created_at

---

## 🎯 Próximos Passos

1. **Confirmar que API está funcionando** (rodar testes acima)
2. **Adicionar índices no banco** (se aplicável)
3. **Implementar no frontend** (ver `FRONTEND-GUIA.md`)

Se encontrar problemas com a API, verifique:
- Variáveis de ambiente (SUPABASE_URL, SUPABASE_API_KEY)
- Permissões RLS do Supabase
- Logs do servidor Backend
- Swagger UI em `http://localhost:3000/swagger/index.html`

---

## 📚 Referências

- **API-DOCS.md**: Documentação completa da API
- **FILTROS-GUIA.md**: Visão geral do problema e solução
- **FRONTEND-GUIA.md**: Implementação no frontend
