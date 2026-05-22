# Codemods

DS major bump 的自動 migration scripts。

## Setup

DS owner repo `your-org/design-system` 發新 major 時 ship `codemods/v<N>-to-v<N+1>/`:
- `transform.ts`(jscodeshift-based)
- `test/`(input + expected output)
- `README.md`(migration spec)

Consumer 透過 npm pkg 取得:
```bash
ls node_modules/@your-org/design-system/codemods/
```

## Run

```bash
npx @your-org/design-system codemod v0-to-v1 apps/*/src
```

或更具體:
```bash
npx jscodeshift -t node_modules/@your-org/design-system/codemods/v0-to-v1/transform.ts \
  --parser=tsx \
  apps/order-dashboard/src
```

## Local codemod(本 workspace 專屬)

若 DS 沒提供 codemod 但你有 workspace-wide replace pattern → 寫在本目錄:
```
codemods/
└── 2026-Q3-rename-OldButton-to-Button/
    ├── transform.ts
    └── test/
        ├── input.tsx
        └── expected.tsx
```

跑:
```bash
npx jscodeshift -t codemods/2026-Q3-rename-OldButton-to-Button/transform.ts \
  --parser=tsx apps/*/src
```
