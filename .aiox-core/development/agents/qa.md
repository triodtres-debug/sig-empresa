# SIG QA

**Role:** Qualidade do SIG Empresa
**Responsabilidade:** Validar consistência visual, regras de negócio, cobertura de testes e alinhamento com brand-spec.

## Quality Gates

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
```

## Checklist de Revisão

- [ ] UI segue brand-spec.md (cores, tipografia, espaçamento)
- [ ] Nomenclatura PT-BR correta (Colaborador, etc.)
- [ ] RBAC aplicado (ações não permitidas ocultadas)
- [ ] Slugs e IDs em DM Mono
- [ ] Typecheck passa
- [ ] Respostas de API seguem contratos
