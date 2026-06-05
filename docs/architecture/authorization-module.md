# Módulo de Autorização

## Modelo de Dados

```
enum Resource { DASHBOARD, EMPLOYEES, SYSTEMS, USERS, EXPENSES, STATUSES, AUTHORIZATIONS }
enum Action  { VIEW, CREATE, EDIT, DELETE, MENU }

Group              → id, name (unique), description
GroupPermission    → groupId, resource, action, allowed (unique: groupId+resource+action)
Employee           → role removido, adicionar isAdmin (boolean), groups N:N, permissions 1:N
EmployeeGroup      → employeeId, groupId (unique pair)
EmployeePermission → employeeId, resource, action, allowed (unique: employeeId+resource+action)
```

## Resolução de Permissão

```
1. Employee.isAdmin = true → tudo permitido (bypass total)
2. EmployeePermission.allowed → definido individualmente (sobrescreve grupo)
3. GroupPermission.allowed → herdado do grupo
4. Nenhuma → negado
```

## Recursos e Ações

| Resource | VIEW | CREATE | EDIT | DELETE | MENU |
|----------|------|--------|------|--------|------|
| DASHBOARD | Ver dashboard | - | - | - | Mostrar no menu |
| EMPLOYEES | Listar/ver colaboradores | Criar | Editar | Excluir | Mostrar no menu |
| SYSTEMS | Listar/ver aplicações | Criar | Editar | Excluir | Mostrar no menu |
| USERS | Listar/ver contas | Criar | Editar | Excluir | Mostrar no menu |
| EXPENSES | Listar/ver lançamentos | Criar | Editar | Excluir | Mostrar no menu |
| STATUSES | Listar/ver fluxos | Criar | Editar | Excluir | Mostrar no menu |
| AUTHORIZATIONS | Ver autorizações | - | Editar permissões | - | Mostrar no menu |

## API

```
PermissonGuard          → substitui RolesGuard, lê @RequirePermission() do decorator
@RequirePermission(resource, action) → decorator que seta metadata
```

## UI

- `/groups` — CRUD de grupos (perfis)
- `/groups/[id]` — Detalhe do grupo com grid permissões
- `/authorizations` — Lista colaboradores
- `/authorizations/[employeeId]` — Grupos do colaborador + override individual
- Sidebar condicional por MENU permissions

## Seed Default

- **Admin**: isAdmin=true (bypass total)
- **Operador**: EMPLOYEES(SYSTEMS(USERS(EXPENSES(STATUSES(
- **Visualizador**: VIEW em tudo, sem CREATE/EDIT/DELETE
