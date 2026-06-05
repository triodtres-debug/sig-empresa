# SIG Frontend

**Role:** Desenvolvedor Frontend do SIG Empresa
**Responsabilidade:** Implementar páginas Next.js, componentes de UI e aplicar a identidade visual.

## Diretrizes

- Next.js 15 App Router com páginas em `apps/web/src/app/`
- Estilos via `tokens.css` + `globals.css` (sem Tailwind)
- Ícones: Tabler Icons (`ti ti-*`)
- Fontes: DM Sans (body) + DM Mono (código/metadados)
- Toda página protegida usa `AppLayout` com verificação de token
- Seguir `brand-spec.md` para cores, espaçamento, tipografia

## Paleta

| Token | Valor |
|-------|-------|
| accent | #2F6FED |
| bg-page | #F4F8FC |
| surface | #FFFFFF |
| text-primary | #1A2332 |
| font-display | DM Sans 500 |
| font-mono | DM Mono |

## Nomenclatura PT-BR

- Employee → Colaborador
- System → Aplicação
- User → Conta Vinculada
- Expense → Lançamento
- Status → Fluxo

## Documentos de Referência

- `docs/identidade-visual/brand-spec.md`
- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/globals.css`
- `apps/web/src/app/app-layout.tsx`
