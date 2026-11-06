# Auditoria e plano de migração do TECTRIS

## Escopo auditado

Leitura do CMake, README, guia de execução, issues, cabeçalhos e todos os fontes C em `src/` e `include/`. O código existente é uma aplicação Raylib em C11, com dependência de caminho absoluto `C:/raylib/raylib/src`; o diretório `build/` contém artefatos locais e não faz parte do código fonte.

## Inventário e comportamento observado

| Área | Implementação atual | Observações e tratamento na versão web |
|---|---|---|
| Inicialização e navegação | `src/main.c`, máquina de estados: menu, jogo, pausa, pergunta, histórico, relatório e game over | React passa a controlar telas e fluxo. A UI do renderizador original tem cinco opções, enquanto o menu em `main.c` usa seis índices; o índice 3 de histórico Easy não tem item correspondente no renderizador. |
| Tabuleiro e peças | `src/game/game.c`, grade 10×20, sete tetrominós, peça seguinte, movimento, rotação com deslocamento lateral e colisão | Engine independente da UI em TypeScript. Mantém tabuleiro, queda, hard drop e sete peças. |
| Linhas, pontuação e dificuldade | 100/300/500/800 pontos por 1/2/3/4 linhas vezes nível; nível sobe a cada 10 linhas; queda usa `1s * 0.85^(nível-1)` | Mantidos. Código C não limita `linesCleared` antes de indexar vetor de cinco itens; a engine web trata contagens de forma segura. |
| Kill line | Linha limite inicial no índice 4; blocos fixos nela ou acima encerram o jogo | Mantida como condição de derrota. |
| Desafios de programação | `src/game/questions.c`, respostas textuais, sorteio por nível, perguntas periódicas de 15s | 100 questões migradas integralmente para JSON local. Aceitação normaliza caixa e espaços; permanecem respostas de texto livre. |
| Modo Easy | `src/game/questions_modo_easy.c`, 100 questões de conhecimentos gerais com alternativas A-D | Mantido como modo alternativo; no código original não é um modo fácil de Tetris, mas muda o tema do quiz. |
| Penalidades | Erro ou timeout desloca o tabuleiro para cima, acrescenta linha cinza com buraco e desce kill line; acerto remove pressão levantando kill line | Mantida a penalidade. Remover penalidade no C não apaga linha cinza; só move a kill line, portanto a interface deixa isso explícito. |
| Pausa e controles | Setas, espaço, P; perguntas normais recebem texto; Easy usa A-D | Teclado e botões grandes para toque. Pausa preservada. |
| Histórico | `history.txt` e `history_easy.txt`, CSV sem jogadores, limitado a 100 registros em memória; salvo ao confirmar game over | Persistência em SQLite no backend Express; histórico por modo, jogador(es), placar, linhas, nível, resultado, data e estatísticas da partida. |
| Estatísticas | Média, melhor/pior, desvio padrão amostral e heurística em `src/utils/stats.c` | Disponíveis via API e tela. Recursões de soma/mínimo/máximo/quadrados são utilitários; desvio padrão existente é iterativo. |
| Multiplayer | Não existe estado de segundo jogador, segundo tabuleiro, sincronização ou lógica competitiva no C | O modo local simultâneo é extensão nova, documentada. Partida online/Socket.IO não é requisito para migrar funcionalidades realmente existentes e não está incluída. |
| Fim e reinício | Game over por kill line/colisão de spawn; Enter grava resultado e retorna ao menu. Não há botão de reinício direto | UI web oferece salvar e jogar novamente/voltar ao menu. Vitória de 100 pontos está nos documentos de backlog, não na mecânica implementada; não é imposta ao Tetris sem documentação de mudança. |
| Identidade visual | Fundo azul-noite, painéis escuros, ciano neon, verde, linha de perigo magenta, título “Aprenda C Jogando” | Paleta e linguagem visual mantidas, com layout adaptativo mobile-first. |

## Discrepâncias e limitações encontradas

- O README e diagramas descrevem dois jogadores locais e vitória ao atingir 100 pontos, porém o código entregue implementa um único tabuleiro e game over por topo. O código também não implementa ataque competitivo.
- O menu de `main.c` contém seis opções e o renderizador apresenta cinco: os itens de histórico Easy/estatísticas ficam desalinhados com os índices.
- O render de relatório inicialmente mostra “Carregando dados...” e é posteriormente sobreposto por relatório funcional em `main.c`.
- Os arquivos de histórico não guardam modo, identificação de partida, jogador ou resultado; carregamento ignora registros após os primeiros 100.
- O estado fácil reutiliza a física ao trocar temporariamente o estado global, um acoplamento que a separação engine/UI elimina.
- A queda hard-drop chama `MergePiece` diretamente; a gravidade subsequente ainda roda naquele frame, e o fluxo permite tentativa de resposta mesmo após timeout marcar feedback.
- Perguntas easy não são selecionadas por nível e têm 100 entradas. O banco principal tem perguntas por níveis 1–5.
- Perguntas e respostas C estão embutidas no fonte; devem continuar disponíveis sem conexão.
- Há referências a multiplayer, adivinhação numérica, timer progressivo e outras ideias apenas em backlog/diagramas, não em código executável. Não serão apresentadas como recursos preexistentes.

## Mapeamento para a arquitetura web

| Recurso | Destino |
|---|---|
| Engine de tabuleiro, colisão, rotação, pontuação, progressão, linha de perigo, penalidade e vitória/derrota | `frontend/src/game/` sem dependência de React |
| Telas/menu, HUD, tabuleiro, perguntas, controles móveis, pausa, histórico e relatório | `frontend/src/components/` e `frontend/src/App.tsx` |
| Banco de perguntas offline | `frontend/src/data/` |
| API de histórico/estatísticas | `backend/src/routes/` e `backend/src/services/` |
| Persistência de partidas | SQLite local no servidor; não usar localStorage como banco de dados |
| Build e execução | Vite no frontend; TypeScript/Express no backend; scripts na raiz |
| Multiplayer local | Dois tabuleiros e input separado na mesma tela/dispositivo, selecionável; sem servidor de jogo |
| Deploy | Frontend estático Vite e API Node persistente em Render/Railway; Vercel pode hospedar frontend/API compatível, mas persistência requer banco externo durável |

## Decisões

1. React, TypeScript, Vite e Express são mantidos conforme solicitado.
2. SQLite é usado pela simplicidade e persistência real para partidas no backend; volume e distribuição futuros podem justificar PostgreSQL.
3. Não incluir Socket.IO: não existe multiplayer pela internet no original. Multiplayer local não precisa de sincronização de rede.
4. Manter local solo como padrão e adicionar multiplayer local como evolução rastreável, sem substituir a experiência original.
5. Perguntas permanecem locais/offline; API e banco persistem resultados, não são pré-requisito para jogar.

## Como executar

Na raiz, `npm install` e `npm run dev` iniciam frontend e API em paralelo. O banco é criado pelo servidor em `backend/data/tectris.sqlite`. `npm run build` gera o build de produção. Configure `PORT` e `DATABASE_PATH` no host; publique o frontend em host estático e o backend em serviço Node com volume durável.
