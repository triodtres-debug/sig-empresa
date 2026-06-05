# SIG Empresa

Sistema de Gestão Empresarial — plataforma interna corporativa para gerenciar colaboradores, aplicações, contas vinculadas, lançamentos e fluxos de status.

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Backend | NestJS 11 |
| Frontend | Next.js 15 (App Router) |
| Database | PostgreSQL 17 + Prisma ORM |
| Auth | JWT (Passport) + bcryptjs |
| UI | CSS custom properties (light/dark) |
| Ícones | Tabler Icons |
| Tipografia | DM Sans + DM Mono |

## Estrutura

```
sig-empresa/
├── apps/
│   ├── api/          # API REST (auth, CRUDs, autorização, auditoria)
│   └── web/          # Interface web (dashboard, CRUDs, modais)
├── packages/
│   └── database/     # Schema Prisma + seed
├── docker/
│   └── docker-compose.yml
└── docs/
    ├── VISION.md
    └── identidade-visual/
```

## Entidades

| Entidade | Nome SIG | Descrição |
|----------|----------|-----------|
| Employee | Colaborador | Funcionário com acesso ao sistema |
| System | Aplicação | Sistema externo gerenciado |
| User | Conta Vinculada | Pessoa que usa sistemas externos |
| Expense | Lançamento | Despesa registrada por colaborador |
| Status | Fluxo | Workflow de status reutilizável |

## RBAC

Permissões granulares por Resource × Action (VIEW, CREATE, EDIT, DELETE, MENU), com suporte a grupos e permissões individuais.

## Pré-requisitos

- Node.js >= 20
- pnpm >= 10
- Docker (para PostgreSQL)

## Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Iniciar banco de dados
docker compose -f docker/docker-compose.yml up -d

# Aplicar schema e seed
pnpm --filter @sig-empresa/database prisma:db:push
pnpm --filter @sig-empresa/database prisma:seed

# Iniciar API (porta 3001)
pnpm --filter @sig-empresa/api start:dev

# Iniciar web (porta 3000)
pnpm --filter @sig-empresa/web dev
```

## Quality Gates

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
```
