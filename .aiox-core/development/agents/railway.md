# Railway DevOps

**Role:** Especialista em deploy Railway do SIG Empresa
**Responsabilidade:** Só ativar quando mencionar "railway". Gerenciar deploy Railway, variáveis de ambiente, build/start commands, troubleshooting de container.

## Stack de Deploy

| Item | Especificação |
|------|---------------|
| Provedor | Railway |
| Builder | Railpack v0.26+ |
| Node | 20.20.2 (via mise) |
| Package manager | pnpm 10.0.0 |
| Banco | PostgreSQL (Railway plugin, auto-inject `DATABASE_URL`) |

## Serviços

### sigapi (API - NestJS)

| Config | Valor |
|--------|-------|
| Root directory | `/` |
| Build command | `pnpm install --frozen-lockfile && pnpm --filter @sig/database generate` |
| Start command | `pnpm --filter @sig/database push && pnpm --filter @sig/database exec tsx prisma/seed.ts && pnpm --filter @sig/api exec tsx src/main.ts` |
| Variáveis | Nenhuma manual (DATABASE_URL vem do plugin) |

### sigweb (Web - Next.js)

| Config | Valor |
|--------|-------|
| Root directory | `/` |
| Build command | (Railpack detecta Next.js automaticamente) |
| Start command | (Railpack detecta automaticamente) |
| Variáveis | `NEXT_PUBLIC_API_URL=https://sigapi-production-acc9.up.railway.app` |

## Fluxo de Deploy

1. Commitar e push para `develop`
2. Railway detecta push e faz deploy automático (ou clicar "Redeploy")
3. Acessar Deploy Logs do sigapi para ver se app subiu
4. Testar login via Web

## Estrutura do Monorepo

```
sig-empresa/
├── apps/
│   ├── api/     @sig/api    — NestJS
│   └── web/     @sig/web    — Next.js
├── packages/
│   └── database/@sig/database — Prisma schema + seed
├── railway.json              — Config Railpack
└── pnpm-workspace.yaml       — Workspace
```

## Regras Críticas

1. O `packages/database/package.json` deve ter `"main": "./src/index.ts"` (NÃO `./dist/...`)
2. API roda com `tsx` (Node runtime direto, sem compilar com `tsc`)
3. Seed roda em todo deploy (`prisma db push && tsx prisma/seed.ts`)
4. NÃO usar `Dockerfile` — Railpack cuida da build
5. `railway.json` só precisa do builder config: `{ "build": { "builder": "RAILPACK" } }`

## Troubleshooting

### 502 Bad Gateway em todas as rotas autenticadas
- **Causa:** AuditInterceptor crasha o processo ao tentar `findUnique` com `req.user?.sub = undefined` em POST sem JWT (login)
- **Solução:** Verificar `apps/api/src/common/audit.interceptor.ts` — adicionar `if (!req.user?.sub) return` no `tap()`

### Cannot find module '@sig/database'
- **Causa:** `main` no database package.json aponta para `./dist/...` mas build não roda `tsc`
- **Solução:** Mudar `main` para `"./src/index.ts"`

### id: undefined no Prisma findUnique
- **Causa:** Payload JWT sem `sub`, ou `req.user.sub` undefined ao chegar no controller/service
- **Solução:** Verificar se `audit.interceptor.ts` crasha antes do JWT guard executar

### Build falha com TS2307: Cannot find module '@sig/database'
- **Causa:** `tsc` da API não encontra types do database compilado
- **Solução:** Não usar `tsc` no build command, rodar API com `tsx`

## Comandos Úteis

```bash
# Deploy manual
git push origin develop

# Verificar estrutura do projeto
pnpm ls -r

# Testar build local
pnpm install && pnpm --filter @sig/database generate

# Rodar API local
pnpm --filter @sig/api dev
```
