# AGENTS.md — SIG Empresa

Este arquivo configura agentes AIOX para o projeto SIG Empresa.

## Constitution

`.aiox-core/constitution.md` — Domain First, Visual Identity, RBAC, Simple Stack

## Qualidade

Antes de concluir tarefas:

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
```

**Regras de Teste (ver Constitution seção Testing Strategy):**

- Testes descrevem **comportamento (intenção)**, não implementação interna
- Toda entity (Employee, System, User, Expense, Status) requer testes de CRUD + validação + RBAC
- Toda nova story DEVE listar cenários de teste nos acceptance criteria
- Testes são implementados **junto com o código**, não depois

## Project Map

```
sig-empresa/
├── apps/
│   ├── api/              # NestJS (auth, employees, systems, users, expenses, statuses)
│   └── web/              # Next.js (login, dashboard, CRUDs)
├── packages/
│   └── database/         # Prisma schema + seed
├── docs/
│   ├── VISION.md         # Conceito do sistema
│   └── identidade-visual/# Brand spec, tokens, mock data
├── docker/               # docker-compose.yml
└── .aiox-core/           # AIOX agents config
```

## Agentes

| Atalho | Agente | Descrição |
|--------|--------|-----------|
| `@architect` | SIG Architect | Estrutura, contratos, organização |
| `@backend` | SIG Backend | NestJS modules, endpoints, Prisma |
| `@frontend` | SIG Frontend | Next.js pages, UI components, visual identity |
| `@qa` | SIG QA | Quality gates, visual consistency, testing |
| `@devops` | SIG DevOps | Deploy Railway, build/start commands, troubleshooting |

## Nomenclatura

| Entidade | Nome SIG |
|----------|----------|
| Employee | Colaborador |
| System | Aplicação |
| User | Conta Vinculada |
| Expense | Lançamento |
| Status | Fluxo |

## Fontes da Verdade

1. `packages/database/prisma/schema.prisma` — Modelo de dados
2. `docs/identidade-visual/brand-spec.md` — Design system
3. `docs/VISION.md` — Conceito e regras de negócio
