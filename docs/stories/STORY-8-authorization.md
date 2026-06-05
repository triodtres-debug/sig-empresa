# STORY-8: Módulo de Autorização

**Status:** Done
**Agente:** @architect / @backend / @frontend

## Acceptance Criteria

- [x] Schema Prisma: Group, GroupPermission, EmployeeGroup, EmployeePermission, isAdmin
- [x] Migration + seed com grupos padrão (Admin, Operador, Visualizador)
- [x] PermissionGuard + @RequirePermission decorator substitui RolesGuard + @Roles
- [x] Resolução: isAdmin → individual → grupo → negado
- [x] CRUD Groups (API + frontend /groups)
- [x] Página de autorização por colaborador (API + frontend /authorizations)
- [x] Sidebar condicional baseada em MENU permission
- [x] Todas as views/actions existentes convertidas para novo sistema
- [x] Employee.role removido
- [x] Typecheck passando (lint: API pass, web lint pre-existing)

## Files

- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/seed.ts`
- `apps/api/src/common/permission.guard.ts`
- `apps/api/src/common/permission.decorator.ts`
- `apps/api/src/groups/`
- `apps/api/src/authorizations/`
- `apps/web/src/app/groups/`
- `apps/web/src/app/authorizations/`
- `apps/web/src/app/app-layout.tsx`
- `apps/web/src/lib/api.ts`
