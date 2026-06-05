# SIG Empresa — AIOX Constitution

**Version:** 1.1.0

## Source of Truth

1. `docs/VISION.md` — Conceito do sistema e entidades
2. `docs/identidade-visual/brand-spec.md` — Design system (cores, tipografia, componentes)
3. `docs/identidade-visual/FEEDBACK.md` — Status da implementação visual
4. `docs/identidade-visual/data.json` — Mock data e estrutura das APIs
5. `packages/database/prisma/schema.prisma` — Modelo de dados (fonte da verdade do banco)

## Core Principles

1. **Domain First** — Employee, System, User, Expense, Status são os 5 domínios centrais
2. **Visual Identity** — Toda UI deve seguir `brand-spec.md` (DM Sans, paleta #2F6FED, espaçamento 4px)
3. **RBAC** — ADMIN > MANAGER > OPERATOR > VIEWER; ações não permitidas são ocultadas
4. **API First** — Toda funcionalidade nova deve ter endpoint antes de tela
5. **Simple Stack** — NestJS + Next.js + Prisma + PostgreSQL, sem filas, sem cache, sem K8s

## Testing Strategy

Testes são parte obrigatória do desenvolvimento. As regras abaixo valem para todo código produzido.

### 1. Cobertura por Entidade

Cada entidade (Employee, System, User, Expense, Status) deve ter testes que cubram:

- **CRUD completo**: criar, listar, buscar por id, atualizar, desativar/excluir
- **Validação**: campos obrigatórios, tipos, unicidade, relacionamentos
- **RBAC**: rotas protegidas corretamente por perfil
- **Casos de borda**: registro inexistente, duplicata, perfil sem permissão

### 2. Testes de Intenção (Behaviour-Driven)

Testes devem descrever **comportamento do sistema**, não implementação interna:

- ✅ "Deve permitir que ADMIN crie um colaborador com email e CPF válidos"
- ✅ "Deve rejeitar criação de colaborador com email duplicado"
- ✅ "Deve retornar 401 se token não for fornecido"
- ❌ "Deve chamar o serviço create com os parâmetros corretos" (teste técnico)

### 3. Pirâmide de Testes

| Tipo | Onde | Ferramenta | Percentual |
|------|------|------------|------------|
| **Integração (API)** | `apps/api/src/**/*.spec.ts` | Jest + Supertest | 60% |
| **Integração (DB)** | Testes que validam queries Prisma | Jest + test DB | 20% |
| **Unitários** | Lógica pura sem IO | Jest | 10% |
| **E2E** | Fluxo completo API + DB | Jest + Supertest | 10% |

### 4. Toda Story Deve Incluir Testes

- Toda nova story em `docs/stories/` deve listar os cenários de teste nos acceptance criteria
- Testes são implementados junto com o código, não depois
- `pnpm test` deve passar antes de marcar a story como concluída

### 5. Estrutura de Teste Padrão

```typescript
describe('POST /api/employees', () => {
  it('deve criar colaborador com dados válidos', async () => { ... })
  it('deve rejeitar email duplicado', async () => { ... })
  it('deve rejeitar se não autenticado', async () => { ... })
  it('deve rejeitar se perfil não for ADMIN', async () => { ... })
})
```

## Agent Rules

- Sempre consultar `brand-spec.md` antes de criar componentes de UI
- Usar nomenclatura PT-BR: Colaborador, Aplicação, Conta Vinculada, Lançamento
- Slugs e IDs sempre em DM Mono
- Dados mock em `data.json` servem como referência de estrutura
- Nenhuma dependência externa além do stack definido
