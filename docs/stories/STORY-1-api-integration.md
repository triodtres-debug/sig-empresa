# STORY-1: Conectar Frontend à API Real

**Status:** Draft
**Agente:** @frontend / @backend

## Acceptance Criteria

- [x] Login page faz POST /api/auth/login e armazena token
- [x] Colaboradores carrega de GET /api/employees
- [x] Aplicações carrega de GET /api/systems
- [x] Contas Vinculadas carrega de GET /api/users
- [x] Lançamentos carrega de GET /api/expenses
- [x] Token expirado redireciona para login (401 handler no api.ts)
- [x] Typecheck passa

## Files

- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/employees/page.tsx`
- `apps/web/src/app/systems/page.tsx`
- `apps/web/src/app/users/page.tsx`
- `apps/web/src/app/expenses/page.tsx`
- `apps/web/src/app/app-layout.tsx`
- `apps/web/src/lib/api.ts` (novo)
