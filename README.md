# TECTRIS Web

Versão web responsiva do TECTRIS, jogo educacional originalmente escrito em C com Raylib. A auditoria do código fonte, as funcionalidades encontradas, divergências documentais e o mapeamento para a nova arquitetura estão em [docs/AUDITORIA_E_MIGRACAO.md](docs/AUDITORIA_E_MIGRACAO.md).

## Tecnologias

- React, TypeScript e Vite no frontend.
- Express e SQLite no backend.
- Engine do tabuleiro isolada dos componentes React.
- Banco local de perguntas incluído no frontend para permitir jogar offline.

## Executar em desenvolvimento

Requer Node.js 20 ou mais recente.

```sh
npm install
npm run dev
```

O Vite inicia em `http://localhost:5173`; a API inicia em `http://localhost:3001`. O SQLite é criado em `backend/data/tectris.sqlite`. Se o backend estiver hospedado em outro endereço, defina `VITE_API_URL` para a URL base da API durante o build.

## Produção

```sh
npm run build
npm start
```

Publique `frontend/dist` em um host estático e execute o backend como serviço Node persistente em Render, Railway ou equivalente. Configure `PORT` e `DATABASE_PATH` para um volume durável no host. Em Vercel, conecte o frontend a uma API e banco persistentes externos; o disco de funções serverless não é armazenamento durável para SQLite.

## Modos

- **Desafio de C:** resposta digitada, pontuação por acerto e penalidade por erro ou tempo esgotado.
- **Modo Easy:** perguntas de conhecimentos gerais com quatro alternativas.
- **Duelo local:** dois tabuleiros no mesmo dispositivo, perguntas de programação com alternativas e controles de toque. O primeiro jogador a acertar vence; respostas erradas aplicam a penalidade do jogo. Player 1 responde pelas teclas 1–4 e Player 2 pelas teclas 7–0. É uma extensão web, pois o código C original não implementava o modo de dois jogadores.

No modo solo, use as setas para mover/rotacionar, espaço para soltar e P ou Esc para pausar. Em celular, os botões ficam abaixo do tabuleiro. O histórico e as estatísticas dependem da API; a partida continua jogável mesmo sem conexão com ela.
