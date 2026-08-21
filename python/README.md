# Espelho Python

A trilha canônica da aula é Node; estes espelhos mostram que o padrão é o
MESMO em qualquer linguagem — muda a sintaxe, não o conceito.

## Setup

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Os scripts usam o mesmo `.env` da pasta pai (carregado com `python-dotenv`).

## Espelhos

| Script | Degrau Node equivalente |
|---|---|
| `01_fetch_cru.py` | `01-fetch-cru.mjs` — HTTP cru com `requests` |
| `04_tool_calling.py` | `04-tool-calling.mjs` — um ciclo de tool calling |
| `05_loop_jogo.py` | `05-loop-jogo.mjs` — versão RESOLVIDA (consulta pós-lab) |
| `06_agente_arquivos.py` | `06-agente-arquivos/` — agente resolvido SEM as extensões |

**Atenção (atividade EaD em Python):** `06_agente_arquivos.py` serve de
referência de estrutura do núcleo, mas copiar este arquivo NÃO cumpre a
atividade — as extensões obrigatórias (gate HITL + tool nova de autoria
própria) são suas. Veja o enunciado em
`docs/atividade-ead-agente-arquivos.md`.
