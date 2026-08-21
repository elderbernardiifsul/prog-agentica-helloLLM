# prog-agentica-helloLLM

Material prático da **Aula 03 — APIs de LLM e o primeiro agente em loop**, da
disciplina de Programação Agêntica (IFSul Câmpus Passo Fundo · Ciência da
Computação · Prof. Me. Élder F. F. Bernardi).

Uma **escada de código**: cada degrau é um arquivo autocontido que roda
sozinho e introduz UM conceito novo sobre o anterior — do HTTP cru até um
agente autônomo com humano no loop.

## Comece aqui

```bash
git clone https://github.com/elderbernardiifsul/prog-agentica-helloLLM.git
cd prog-agentica-helloLLM
cp .env.example .env      # cole sua chave do Google AI Studio no .env
npm install
npm run 01                # imprimiu JSON? está pronto.
```

Chave gratuita: <https://aistudio.google.com/apikey> · passo a passo completo
(inclui alternativa Ollama, 100% local): **[docs/guia-preparacao.md](docs/guia-preparacao.md)**

## Os degraus

| # | Rodar | Arquivo | O que ensina |
|---|---|---|---|
| 01 | `npm run 01` | [`01-fetch-cru.mjs`](01-fetch-cru.mjs) | A API de LLM é só HTTP + JSON (wire format, roles, `usage`) |
| 02 | `npm run 02` | [`02-sdk-openai.mjs`](02-sdk-openai.mjs) | O que o SDK abstrai; `baseURL` como portabilidade entre provedores |
| 02b | `npm run 02b` | [`02b-sdk-anthropic.mjs`](02b-sdk-anthropic.mjs) | Contraste: o padrão Anthropic Messages (leitura de código) |
| 03 | `npm run 03` | [`03-chat-readline.mjs`](03-chat-readline.mjs) | Chat: a "memória" é um array que VOCÊ gerencia |
| 03b | `npm run 03b` | [`03b-janela-contexto.mjs`](03b-janela-contexto.mjs) | Vendo (e estourando) a janela de contexto: dump + trimming |
| 04 | `npm run 04` | [`04-tool-calling.mjs`](04-tool-calling.mjs) | Um ciclo manual de tool calling: o modelo pede, seu código executa |
| 05 | `npm run 05` | [`05-loop-jogo.mjs`](05-loop-jogo.mjs) | 🧪 **MINI-LAB** (em aula): o primeiro agente em loop — complete os TODOs |
| 06 | `npm run agente` | [`06-agente-arquivos/`](06-agente-arquivos) | 📦 **ATIVIDADE EaD**: agente de arquivos com missão verificável — complete os TODOs |
| 07 | `npm run 07` | [`07-hitl.mjs`](07-hitl.mjs) | HITL: gate de aprovação humana antes de ações sensíveis |

⚠️ Os degraus **05 e 06 têm TODOs propositais** — são os exercícios. Enunciado
da atividade EaD (partes, critérios, entrega):
**[docs/atividade-ead-agente-arquivos.md](docs/atividade-ead-agente-arquivos.md)**

## Notebook de estudo (NotebookLM)

📚 <https://notebooklm.google.com/notebook/e147d1de-a7b9-43b8-a349-b1440f212450>

Notebook com todo o material da aula (docs, slides e código) mais as fontes
canônicas dos temas centrais: documentação das APIs OpenAI (function calling,
estado de conversa) e Anthropic (Messages, tool use, janela de contexto),
compatibilidade OpenAI do Gemini e do Ollama, o artigo ReAct e o guia
*Building Effective AI Agents*. Use para perguntas, revisão e geração de
quizzes/resumos — citações apontam a fonte exata.

## Estrutura do repositório

| Caminho | O que é |
|---|---|
| `01-*.mjs` … `07-*.mjs` | Os degraus (Node.js ≥ 20.6, sem framework — só o SDK `openai`) |
| [`06-agente-arquivos/`](06-agente-arquivos) | Atividade EaD: [`agente.mjs`](06-agente-arquivos/agente.mjs) (esqueleto com TODOs), [`tools.mjs`](06-agente-arquivos/tools.mjs) (tools prontas com sandbox), [`missao.md`](06-agente-arquivos/missao.md) (objetivo do agente), [`verificar.mjs`](06-agente-arquivos/verificar.mjs) (verificação objetiva — `npm run verificar`) |
| [`tests/`](tests) | Testes das tools da sandbox (`npm test`) |
| [`python/`](python) | Espelho Python dos degraus 01, 04, 05 e 06 ([leia antes](python/README.md)) |
| [`docs/slides-aula-03.pdf`](docs/slides-aula-03.pdf) | Slides da aula (também em [HTML](docs/slides-aula-03.html)) |
| [`docs/material-apoio.md`](docs/material-apoio.md) | Aprofundamento por degrau + troubleshooting (erros comuns e soluções) |
| [`docs/guia-preparacao.md`](docs/guia-preparacao.md) | Setup completo (chave, Node, Ollama) — fazer ANTES da aula |
| [`docs/atividade-ead-agente-arquivos.md`](docs/atividade-ead-agente-arquivos.md) | Enunciado da atividade EaD (prazo: 2 semanas) |
| `.env.example` | Modelo de configuração — copie para `.env` (que é ignorado pelo git) |

## Nota sobre produção com IA generativa

A **direção pedagógica**, as **ideias de conteúdo**, a **sequência didática**
e as **atividades** deste material são do professor. O material (texto, código
e documentação) foi **produzido com apoio de IA generativa**, em sessão com
forte supervisão humana (HITL): decisões, revisões e ajustes diretos no texto
pelo professor — o mesmo fluxo de trabalho que esta disciplina ensina.

## Regras rápidas

- **Nunca** commite sua chave (`.env` está no `.gitignore` — deixe assim).
- Erro `429`? Cota do free tier: espere ~1 min. Mais problemas:
  [troubleshooting](docs/material-apoio.md#7-troubleshooting).
- `workspace/` é a sandbox do agente — criada em execução, ignorada pelo git.
- Ollama no lugar do Gemini: descomente `LLM_BASE_URL`/`LLM_MODEL` no `.env`
  — o mesmo código roda sem mudanças.
