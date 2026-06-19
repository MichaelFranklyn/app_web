# Clean Code Audit — app_web (Typescript)

📅 2026-05-04 22:22 | Arquivos: 388 | Linguagem: Typescript

## 📊 Resumo Executivo

🔴 0 críticas — bloqueia refactor
🟡 47 moderadas — technical debt
🟢 21 leves — polimento

**Total de violações:** 68

---

### 🟡 Componente/função muito grande

**Severidade:** MODERATE | **Ocorrências:** 47

- `src/app/page.tsx`
- `src/hooks/useAsyncAction.ts`
- `src/hooks/useTableData.ts`
- ... e 44 mais

**Descrição:** 797 linhas — considere extrair em partes menores

---

### 🟢 Dados hardcoded

**Severidade:** MINOR | **Ocorrências:** 21

- `next.config.ts`
- `src/app/page.tsx`
- `src/app/(auth)/login/page.tsx`
- ... e 18 mais

**Descrição:** Valor mockado no código: hardcoded name

---

## 🎯 Recomendações

1. **Críticas (0)**: Nenhuma — arquitetura está saudável! ✅
2. **Moderadas**: Revisar antes do próximo release
3. **Leves**: Podem ser feitas como tech-debt cleanup

## Próximos passos

- Rodar `/clean-code-audit-universal` novamente após refatoração
- Integrar em CI/CD com `--git-diff` para validar PRs

---

*Gerado por clean-code-audit-universal (v2)*
