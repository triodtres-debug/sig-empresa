# Feedback — Identidade Visual SIG

## O que está completo e bem definido

| Item | Status |
|------|--------|
| Paleta claro/escuro com tokens CSS | ✅ Completo |
| Tipografia (DM Sans + DM Mono) | ✅ Completo |
| Escala de espaçamento base 4px | ✅ Completo |
| Raios de borda | ✅ Completo |
| Sombras | ✅ Completo |
| Badges de perfil (admin/manager/operator/viewer) | ✅ Completo |
| Badges de status (pendente/aprovado/rejeitado/cancelado) | ✅ Completo |
| Botões (primary/secondary/danger/ghost/icon) | ✅ Completo |
| Formulários (input, foco, erro) | ✅ Completo |
| Tabelas (header sticky, hover, zebra) | ✅ Completo |
| Avatares (tamanhos, fallback iniciais) | ✅ Completo |
| Modais (overlay, tamanhos, animação) | ✅ Completo |
| Toasts (tipos, duração, cores) | ✅ Completo |
| Layout (topbar 64px, sidebar 220px) | ✅ Completo |
| Nomenclatura PT-BR (Colaborador, Aplicação, etc) | ✅ Completo |
| Iconografia por entidade (Tabler Icons) | ✅ Completo |
| Dados mock para todas as telas | ✅ Completo |

## O que está ausente ou precisa ser definido

### Crítico para a implementação

| Item | Por que é necessário |
|------|---------------------|
| **Arquivo de tokens CSS exportável** | Já foi criado (`apps/web/src/styles/tokens.css`) |
| **Pacote de ícones definido** | Tabler Icons — já importado via CDN nos globals |
| **Fontes DM Sans/DM Mono** | Google Fonts — já importado nos globals |
| **Animações e easing** | `fadeIn 150ms` definido, mas faltam easings padrão (`ease-in-out`, `cubic-bezier`) |
| **Z-index scale** | Definido nos tokens (`--z-sidebar`, `--z-modal`, `--z-toast`) |
| **Tema escuro** | Tokens escuros definidos, mas sem toggle implementado |

### Recomendado para próxima iteração

| Item | Sugestão |
|------|----------|
| Componentes React isolados (Button, Badge, Input, Table, Modal, Toast) | Criar em `apps/web/src/components/ui/` |
| Modo escuro com toggle | Adicionar botão na topbar + persistir preferência |
| Responsivo (breakpoints) | Especificado mas não implementado no layout |
| Loading states / Skeleton | Apenas textuais, sem esqueletos visuais |
| Empty states | Sem tela de "nenhum registro" |
| Paginação | Tabelas sem paginação, ideal para >20 registros |
| Tabela zebrada via CSS | `tr:nth-child(even)` não está nos globals |

## Agentes AIOX e o que precisam saber

### Agentes existentes que podem ser úteis

| Agente | O que faria |
|--------|-------------|
| **@ux-design-expert** | Criar componentes React do design system (Button, Badge, Modal, Toast) |
| **@dev** | Implementar páginas com dados reais (conectar API ao frontend) |
| **@architect** | Revisar estrutura de componentes e naming |
| **@qa** | Validar consistência visual entre telas |

### Ajustes necessários nehum agente

Nenhum agente AIOX precisa ser modificado. O projeto sig-empresa **não usa agentes AIOX diretamente** — apenas o `@sig/api` e `@sig/web` como apps independentes.

### Como passar o design para outros devs

1. Enviar o link do `docs/identidade-visual/sig-empresa_brand_guide.html` (guia visual completo)
2. Entregar os tokens CSS em `apps/web/src/styles/tokens.css` (fonte da verdade das cores)
3. Os componentes globais estão em `apps/web/src/styles/globals.css`
4. Layout de referência: `apps/web/src/app/app-layout.tsx`
5. Dados mock em `docs/identidade-visual/data.json` (estrutura das APIs)

### Recomendação de setup para novos devs

```bash
# 1. Ver a identidade visual
start docs/identidade-visual/sig-empresa_brand_guide.html

# 2. Ler tokens e globals
cat apps/web/src/styles/tokens.css
cat apps/web/src/styles/globals.css

# 3. Ver estrutura de páginas existentes em apps/web/src/app/
# 4. Ver dados mock esperados em docs/identidade-visual/data.json
```

## Status da Implementação

### Pronto (já implementado com o novo visual)

- [x] Tokens CSS (cores claro/escuro, tipografia, spacing, radius, shadows)
- [x] Globais (tipografia, botões, inputs, tabelas, badges, avatares, modais, KPIs)
- [x] Página de login (identidade SIG, formulário)
- [x] Layout principal (sidebar com navegação + topbar)
- [x] Dashboard (KPIs, atividades recentes, pendências)
- [x] CRUD Colaboradores (tabela com avatar, badge, busca)
- [x] CRUD Aplicações (tabela com status, slug mono)
- [x] CRUD Contas Vinculadas (tabela com status colorido)
- [x] CRUD Lançamentos (tabela com valores em R$)
