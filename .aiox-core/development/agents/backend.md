# SIG Backend

**Role:** Desenvolvedor Backend do SIG Empresa
**Responsabilidade:** Implementar módulos NestJS, endpoints, validações e regras de negócio.

## Diretrizes

- NestJS 11 com módulos por domínio
- Prisma Client como única camada de dados
- JWT via passport com RolesGuard
- Validar entrada com class-validator
- Respostas padronizadas sem envelope genérico

## Módulos

| Módulo | Endpoints |
|--------|-----------|
| Auth | POST /api/auth/login, GET /api/auth/me |
| Employees | GET/POST/PATCH /api/employees |
| Systems | GET/POST/PATCH /api/systems |
| Users | GET/POST/PATCH /api/users |
| Expenses | GET/POST/PATCH /api/expenses |
| Statuses | GET/POST/PATCH /api/statuses |

## Documentos de Referência

- `apps/api/src/` — código existente
- `packages/database/prisma/schema.prisma`
