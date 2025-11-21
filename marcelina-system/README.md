## Marcelina System

Aplicação web em React + Vite para gerenciar os insumos da confeitaria. O projeto está evoluindo em etapas: primeiro salvando os dados localmente e agora preparado para integrar com o Supabase.

### Scripts

- `npm run dev` – modo desenvolvimento.
- `npm run build` – build de produção.
- `npm run preview` – serve a build gerada.

### Variáveis de ambiente

1. Copie o arquivo `.env.example` para `.env`.
2. Atualize `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` caso gere novas credenciais no painel do Supabase.

Os valores são carregados automaticamente pelo Vite e validados na inicialização do cliente do Supabase (erro explícito caso estejam ausentes).

### Estrutura relevante

- `src/screens` – telas da aplicação (cada uma com `style.ts`).
- `src/theme` – tokens globais de cor/typografia aplicados em `main.tsx`.
- `src/services/supabase` – cliente configurado do Supabase. Novos serviços/fetchers devem importar o `supabaseClient` a partir daqui.

Assim que você criar as tabelas, basta adicionar novos arquivos em `src/services` com as queries específicas (ex.: `suppliesService.ts`). Reexporte por `src/services/index.ts` para manter tudo centralizado.
