# SIG Empresa

Sistema de Gestão Empresarial — plataforma interna para gerenciar funcionários, sistemas, usuários e despesas.

## Conceito

Um sistema corporativo onde **apenas funcionários** têm acesso. Cada funcionário possui um **perfil** (admin, manager, operator, viewer) que define quais recursos ele pode acessar e modificar.

## Entidades

| Entidade | O que é |
|----------|---------|
| **Employee** | Funcionário da empresa. Tem acesso ao sistema. Possui CPF, email, role e senha. |
| **System** | Sistema externo gerenciado. Cada sistema tem nome, slug e URL base para integração futura. |
| **User** | Pessoa que usa os sistemas externos (ex: cliente de um sistema). Não tem acesso ao SIG. |
| **Expense** | Despesa registrada por um funcionário, opcionalmente vinculada a um sistema. |
| **Status** | Workflow de status reutilizável por entidade (ex: "Pendente → Aprovado → Rejeitado"). |

## Regras de Negócio

- Apenas **ADMIN** pode criar/editar funcionários e definir perfis
- **MANAGER** gerencia sistemas, usuários e visualiza despesas
- **OPERATOR** registra despesas e gerencia usuários
- **VIEWER** apenas visualiza dados

## Arquitetura

```
apps/web (Next.js)  →  apps/api (NestJS)  →  PostgreSQL
       ˫ proxy /api/*        ˫ JWT auth
                              ˫ CRUD employees
                              ˫ CRUD systems
                              ˫ CRUD users
                              ˫ CRUD expenses
                              ˫ CRUD statuses
```

Stack: **NestJS + Next.js + PostgreSQL + Prisma + Docker Compose**

## Integração Futura

Conexão com sistemas externos será feita via API própria (fora do SIG), usando a `baseUrl` registrada em cada sistema e um mecanismo de API Key.
