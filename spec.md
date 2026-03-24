# AntiFraudApp — Sincronização e Dados Reais

## Current State

- `FraudHeatmap.tsx` mostra estatísticas completamente hardcoded: `REGIONAL_STATS = { global: '7.8M', PT: '847k', BR: '2.1M', EU: '4.7M' }` e `PERIOD_COUNTS = { '24h': '12.847', '7d': '87.234', '30d': '234.567', historical: '7.8M' }`. Estes números nunca mudam e não refletem nada real.
- O modal de reporte em `FraudRadarPage.tsx` tem apenas um campo de texto livre (motivo). Faltam campos: tipo de fraude (select) e valor a reportar (texto, ex: número de telefone, email, link).
- O submit do modal usa target=`global` hardcoded e não leva coordenadas reais do utilizador.
- `news.ts` filtra notícias das últimas 24h antes de guardar em cache. Se a GNews API retornar artigos fora dessa janela, cai nos fallbacks estáticos. A cache tem TTL de 1 minuto mas a chave é sempre a mesma (sem bust).
- `FraudDataContext` faz polling a 5s ao canister e partilha dados com todas as páginas — funciona bem.
- O mapa `FraudHeatmap` mostra `generateFraudData()` que produz ~13.518 pontos a partir de `CITY_DATA` com densidades. Os contadores de período e região devem ser calculados a partir DESTES dados, não inventados.

## Requested Changes (Diff)

### Add
- `FraudHeatmap.tsx`: computar `REGIONAL_STATS` e `PERIOD_COUNTS` dinamicamente a partir de `generateFraudData()` agrupado por `countryCode` e `period`.
- `FraudHeatmap.tsx`: linha de fonte/atribuição sob os cards de estatísticas: "Fonte: AbuseIPDB · OTX AlienVault · Comunidade"
- `FraudRadarPage.tsx` modal: campo `Tipo` (Select com opções: Telefone, Email, Link, URL Suspeito, IBAN, Cripto, Mensagem, Outro) + campo `Número / Valor a reportar` (Input text).
- `news.ts`: bust de cache — mudar `CACHE_KEY` para `antifraud_news_cache_v2` para forçar fetch fresco.

### Modify
- `FraudHeatmap.tsx`: remover `const REGIONAL_STATS = { ... }` e `const PERIOD_COUNTS = { ... }` hardcoded. Substituir por valores calculados do array `allReports = generateFraudData()` usando reduce/filter por countryCode e timestamp.
- `FraudRadarPage.tsx` `handleReportSubmit`: usar `reportType` do select, `target` = valor introduzido pelo utilizador (ou 'global' se vazio), incluir country/city/coords reais (manter Évora como default).
- `news.ts` `fetchGNews`: alargar filtro de 24h para 7 dias (168h), para não cair sempre nos fallbacks estáticos. Manter shuffle para variedade.

### Remove
- Nada a remover da estrutura de páginas.

## Implementation Plan

1. **`FraudHeatmap.tsx`** — Remover `REGIONAL_STATS` e `PERIOD_COUNTS` hardcoded. Calcular dinamicamente após `generateFraudData()`:
   - `ptCount` = pontos com countryCode === 'PT'
   - `brCount` = pontos com countryCode === 'BR'
   - `euCount` = pontos com countryCode === 'EU'
   - `globalCount` = todos
   - `count24h` = pontos com period === '24h'
   - `count7d` = pontos com period === '7d'
   - `count30d` = pontos com period === '30d'
   - `countHistorical` = pontos com period === 'historical'
   - Formatar com `toLocaleString('pt-PT')` para mostrar separador de milhar
   - Adicionar linha de fonte abaixo dos 4 cards regionais: `⚖️ Fonte: AbuseIPDB · OTX AlienVault · Comunidade ICP — GDPR compliant`

2. **`FraudRadarPage.tsx`** — Melhorar modal de reporte:
   - Adicionar `const [reportType, setReportType] = useState('Telefone')`
   - Adicionar `const [reportValue, setReportValue] = useState('')`
   - No modal: Select com tipos (Telefone, Email, Link/URL, IBAN, Cripto, Mensagem, Outro)
   - Input text: "Número / valor a reportar (ex: +351..., email@, https://...)"
   - Textarea motivo (já existe)
   - No `handleReportSubmit`: `target = reportValue || 'global'`, `reportType = reportType.toLowerCase()`
   - Limpar `reportType` e `reportValue` no `handleReportClose`

3. **`news.ts`** — Mudar:
   - `CACHE_KEY = 'antifraud_news_cache_v2'` (bust)
   - Filtro de 24h → 7 dias: `const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000`
   - Substituir `twentyFourHoursAgo` por `sevenDaysAgo` nos dois fetches
