# Session Progress

## STORY-8: Módulo de Autorização ✅ **Complete**

### Done
- [x] Schema Prisma atualizado: Group, GroupPermission, EmployeeGroup, EmployeePermission, isAdmin, GROUPS enum
- [x] `prisma db push` aplicado ao banco PostgreSQL
- [x] Seed reescrito: 3 grupos (Admin, Operador, Visualizador) com permissões granulares
- [x] PermissionGuard + @RequirePermission decorator em `apps/api/src/common/`
- [x] Resolução: isAdmin → EmployeePermission → GroupPermission → negado
- [x] Todos os 5 controllers convertidos: employees, systems, users, expenses, statuses
- [x] Employee.role removido do schema, JWT, responses, frontend
- [x] Módulo Groups: API CRUD (`apps/api/src/groups/`) + frontend (`/groups`)
- [x] Módulo Authorizations: API (`apps/api/src/authorizations/`) + frontend (`/authorizations`)
- [x] Sidebar condicional baseada em MENU permission (via `/auth/permissions`)
- [x] Sidebar atualizada com links para /groups, /authorizations
- [x] api.ts com métodos groups, authorizations, permissions
- [x] Typecheck + lint passando
- [x] API inicia com 8 módulos e todas as rotas mapeadas
- [ ] Pendente: limpeza arquivos antigos (roles.guard.ts, roles.decorator.ts)

### Mudanças Principais
| Antes | Depois |
|-------|--------|
| RBAC com Role (ADMIN/MANAGER/OPERATOR/VIEWER) | Permissões granulares Resource × Action |
| RolesGuard + @Roles | PermissionGuard + @RequirePermission |
| employee.role: Role | employee.isAdmin: boolean + grupos + permissões individuais |
| JWT continha role | JWT contém apenas sub |
| Sidebar fixa (todos itens visíveis) | Sidebar filtra por permissão MENU |
| 6 módulos | 8 módulos (+ Groups, Authorizations) |
