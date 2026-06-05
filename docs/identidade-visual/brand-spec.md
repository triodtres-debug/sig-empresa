# SIG Empresa — Especificação de Design

Sistema de Gestão Empresarial — plataforma interna corporativa.

---

## 1. Identidade Visual

- **Display:** DM Sans 500 (headings, títulos)
- **Body:** DM Sans 400 (texto corrido, labels)
- **Mono:** DM Mono 400/500 (slugs, IDs, CPF, metadados)
- **Acento principal:** Azul institucional (#2F6FED)
- **Tom:** Corporativo, sério, denso informativo

---

## 2. Paleta — Modo Claro

| Token | Cor | Uso |
|---|---|---|
| `--bg-page` | #F4F8FC | Fundo geral da página |
| `--surface` | #FFFFFF | Cards, modais, sidebar |
| `--bg-subtle` | #E9EDF2 | Hover, linhas alternadas |
| `--border` | #D0D8E5 | Bordas padrão |
| `--border-strong` | #A8B8CE | Separadores visíveis |
| `--text-primary` | #1A2332 | Títulos e corpo |
| `--text-secondary` | #3A4E6A | Texto de apoio |
| `--text-muted` | #5A6F8C | Metadados, placeholders |
| `--accent` | #2F6FED | Ações, links, destaque |
| `--accent-hover` | #1D5CC7 | Hover de ações |
| `--accent-light` | #EBF2FF | Fundo de destaque |
| `--success` | #22C27A | Sucesso, aprovado |
| `--success-bg` | #E6FFF5 | Fundo de sucesso |
| `--warning` | #F59E0B | Aviso, pendente |
| `--warning-bg` | #FFF8E6 | Fundo de aviso |
| `--danger` | #F43F5E | Erro, rejeitado |
| `--danger-bg` | #FFE8EC | Fundo de erro |
| `--info` | #0284C7 | Informativo |
| `--info-bg` | #E0F2FE | Fundo informativo |

---

## 3. Paleta — Modo Escuro

| Token | Cor | Uso |
|---|---|---|
| `--bg-page` | #0D1117 | Fundo geral |
| `--surface` | #111820 | Cards, modais, sidebar |
| `--bg-subtle` | #1A2332 | Hover, linhas alternadas |
| `--border` | #1E2D42 | Bordas padrão |
| `--border-strong` | #2A3D5A | Separadores visíveis |
| `--text-primary` | #F0F4FF | Títulos e corpo |
| `--text-secondary` | #8BA4C8 | Texto de apoio |
| `--text-muted` | #4A6FA5 | Metadados, placeholders |
| `--accent` | #2F6FED | Ações, links, destaque |
| `--accent-hover` | #4A8AF5 | Hover de ações |
| `--accent-light` | #0D1A2E | Fundo de destaque |
| `--success` | #22C27A | Sucesso, aprovado |
| `--success-bg` | #0D2418 | Fundo de sucesso |
| `--warning` | #F59E0B | Aviso, pendente |
| `--warning-bg` | #241F0D | Fundo de aviso |
| `--danger` | #F43F5E | Erro, rejeitado |
| `--danger-bg` | #241010 | Fundo de erro |
| `--info` | #38BDF8 | Informativo |
| `--info-bg` | #0D1E24 | Fundo informativo |

---

## 4. Tipografia

### Fontes

```css
--font-display: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body:    'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono:    'DM Mono', 'JetBrains Mono', ui-monospace, monospace;
```

### Escala

| Token | Tamanho | Peso | Uso |
|---|---|---|---|
| h1 | 22px | 500 | Título de página |
| h2 | 16px | 500 | Título de seção |
| body | 13px | 400 | Conteúdo, labels |
| code | 12px | 400 | Mono — slugs, CPF, IDs |
| meta | 10px | 500 | Mono uppercase — rótulos |
| small | 11px | 400 | Descrições, timestamps |
| badge | 10px | 500 | Badges, chips |
| caption | 9px | 400 | Metadados de ícone |

---

## 5. Espaçamento

Base 4px. Escala:

```
4px  — inline gap mínimo
8px  — padding badges/chips
12px — gap campos formulário, padding células tabela
16px — padding cards e painéis
20px — separação entre seções dentro do card
24px — padding página, gap entre cards
32px — separação entre seções maiores
48px — espaço entre blocos de conteúdo
```

---

## 6. Raios de Borda

```css
--radius-sm:   4px;   /* badges, chips, inputs */
--radius-md:   8px;   /* cards, botões, dropdowns */
--radius-lg:   12px;  /* modais, painéis laterais */
--radius-full: 9999px; /* avatares, pills */
```

---

## 7. Sombras

```css
--shadow-sm:   0 1px 2px rgba(0,0,0,0.05);
--shadow-md:   0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05);
--shadow-lg:   0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.05);
--shadow-modal: 0 20px 60px rgba(0,0,0,0.15);
```

---

## 8. Componentes

### 8.1 Badges de Perfil

| Role | Label | Fundo | Texto | Borda |
|---|---|---|---|---|
| `admin` | Admin | #F8EDFF / #1a1220 | #A855F7 / #c084fc | #E0C4F7 / #5a2d6e |
| `manager` | Manager | #EBF2FF / #0d1a2e | #2F6FED / #60a5fa | #C4D9F7 / #1e4080 |
| `operator` | Operator | #E6FFF5 / #0d2020 | #0D9488 / #2dd4bf | #B3F0DD / #0f5050 |
| `viewer` | Viewer | #F1F5F9 / #161820 | #64748B / #94a3b8 | #D0D8E5 / #2a2d3a |

Estrutura: `padding: 3px 9px; border-radius: 6px; font-size: 10px; font-weight: 500; font-family: DM Mono; letter-spacing: 0.04em;`

### 8.2 Badges de Status

| Status | Cor | Fundo |
|---|---|---|
| Pendente | #F59E0B | warning-bg |
| Em análise | #2F6FED | accent-light |
| Aprovado | #22C27A | success-bg |
| Rejeitado | #F43F5E | danger-bg |
| Cancelado | #5A6F8C (light) / #4A6FA5 (dark) | bg-subtle |

Estrutura: `padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; letter-spacing: 0.02em;`

### 8.3 Botões

| Variante | Fundo | Texto | Borda |
|---|---|---|---|
| `primary` | #2F6FED | #FFF | — |
| `primary:hover` | #1D5CC7 | #FFF | — |
| `secondary` | transparent | text-primary | border |
| `secondary:hover` | bg-subtle | text-primary | border |
| `danger` | #F43F5E | #FFF | — |
| `danger:hover` | #E11D48 | #FFF | — |
| `ghost` | transparent | text-secondary | — |
| `ghost:hover` | bg-subtle | text-primary | — |
| `icon` | transparent | text-muted | — |

Tamanhos: `sm: 28px; md: 36px; lg: 44px` (altura).

Estados: `:hover` (escurece), `:focus` (outline 2px accent), `:active` (scale 0.98), `:disabled` (opacity 0.4).

### 8.4 Formulários

- Input height: 36px (md) / 44px (lg)
- Border: 1px solid border em repouso
- Focus: border accent + box-shadow 0 0 0 3px accent-light
- Error: border danger + mensagem em text-xs danger
- Padding: 0 12px horizontal

### 8.5 Tabelas

**Estrutura base:**

```css
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  position: sticky;
  top: 0;
  background: var(--bg-subtle);
  font-family: DM Mono;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
  text-align: left;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}

td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-primary);
}
```

**Estado de linhas:**

- `tr:last-child td { border-bottom: none; }`
- `tr:hover td { background: var(--bg-subtle); }`
- Zebra: `tr:nth-child(even) td { background: color-mix(in srgb, var(--bg-subtle) 40%, transparent); }`

**Container:** Envolver tabelas em `.table-container` (overflow-x auto, border radius-lg, background surface).

**Vazios e loading:**
- Fundo: transparente (herda do container)
- Texto: `var(--text-muted)` centralizado, padding 32px
- Texto: "Carregando..." ou "Nenhum registro encontrado"

### 8.9 Badges de Operação (Auditoria)

Usado na página de auditoria para classificar o tipo de operação (CREATE, UPDATE, DELETE, LOGIN).

| Operação | Classe CSS | Cor Texto | Fundo |
|---|---|---|---|
| Criação | `operation-badge-create` | `--success` | `--success-bg` + border success 25% |
| Alteração | `operation-badge-update` | `--accent` | `--accent-light` + border accent 25% |
| Exclusão | `operation-badge-delete` | `--danger` | `--danger-bg` + border danger 25% |
| Login | `operation-badge-login` | `--info` | `--info-bg` + border info 25% |

Estrutura: `padding: 2px 8px; border-radius: 4px; font-family: DM Mono; font-size: 10px; font-weight: 500; letter-spacing: 0.04em; border: 1px solid transparent;`

### 8.10 Listagens com Linhas Expansíveis

Padrão usado na página de auditoria para exibir detalhes adicionais por linha.

**Linha de detalhe (.row-detail):**
- Abaixo da linha clicada, ocupa col-span completo
- Fundo: `--bg-subtle` (mesmo do hover, mas persistente)
- Animação: `fadeIn 150ms`
- Conteúdo interno: padding 12px 16px 16px, border-top

**Campos do detalhe:**
- `.field`: flex com gap 8px
- `.field-label`: `var(--text-muted)`, min-width 80px
- `.field-value`: `var(--text-secondary)`, word-break break-all

**Blocos de código (.code-block):**
- Usado para exibir JSON (before/after) na auditoria
- Fonte: DM Mono 11px
- Fundo: `--surface`, texto: `--text-primary`
- Borda: 1px `--border`, padding 8px, border-radius 4px
- Título: `.code-block-title` — DM Mono 10px, uppercase, `--text-muted`, 4px margin-bottom
- Max-height: 200px com overflow auto

### 8.11 Filtros (Filter Bar)

Padrão para formulários de filtro acima de listagens.

```html
<div class="filter-bar card">
  <select>...</select>
  <select>...</select>
  <span class="count">X registros</span>
</div>
```

- Container: `.filter-bar` — card com padding 12px, display flex, gap 12px, flex-wrap
- Elementos: selects estilizados com chevron SVG, inputs, botões
- Contagem: `.count` — `var(--text-muted)` 12px, `margin-left: auto`
- Select: customizado com `appearance: none`, chevron via SVG background, height 32px, `--input-bg` de fundo

### 8.6 Avatares

- Tamanhos: 30px (tabela), 34px (topbar), 48px (detail), 64px (perfil)
- Fallback: iniciais do nome, fundo gerado por hash
- Borda: 2px solid surface + shadow-sm
- Formato: círculo

### 8.7 Modais

- Largura: 480px (pequeno), 640px (padrão), 800px (grande)
- Overlay: rgba(0,0,0,0.5) + backdrop-filter blur(2px)
- Animação: fade + slide-up 200ms
- Estrutura: header (título + X) / corpo / rodapé (ações)

### 8.8 Toasts

Posição: canto inferior direito, empilhados gap 8px.

| Tipo | Ícone | Cor |
|---|---|---|
| success | check-circle | success |
| error | x-circle | danger |
| warning | alert-triangle | warning |
| info | info-circle | info |

Duração: 4s (success/info), 6s (warning), manual (error).

Máximo 3 toasts simultâneos.

---

## 9. Layout

- Topbar: 64px, surface, border-bottom
- Sidebar: 220px, surface, border-right
- KPI grid: 4 colunas (→ 2 → 1 em breakpoints)
- Conteúdo: padding 24px 32px
- Breakpoints: 1024px / 768px / 640px

---

## 10. Entidades (Nomenclatura SIG)

| Entidade original | Nome SIG | Ícone | Cor |
|---|---|---|---|
| Employee | Colaborador | id-badge | Azul #2F6FED |
| System | Aplicação | server | Roxo #A855F7 |
| User | Conta Vinculada | users | Verde #0D9488 |
| Expense | Lançamento | receipt | Âmbar #F59E0B |
| Status/Workflow | Fluxo | git-branch | Ardósia #64748B |

---

## 11. Perfis (Nomenclatura SIG)

| Role | Nome SIG |
|---|---|
| admin | Administrador |
| manager | Gestor |
| operator | Operador |
| viewer | Consultor |

---

## 12. Princípios de Design

- Ações indisponíveis por perfil são ocultadas, não desabilitadas
- Bordas 1px em repouso, 2px azul em foco
- Slugs e IDs sempre em DM Mono
- Feedback visual imediato em toda ação
- Consistência absoluta entre entidades
