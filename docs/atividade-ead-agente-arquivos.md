# Atividade EaD — Agente de arquivos

**Disciplina:** Programação Agêntica · **Referência:** Aula 03
**Prazo:** 2 semanas a contar da aula 03 (data-limite registrada no AVA/canal da turma)
**Modalidade:** individual (salvo definição contrária na oferta)

## 1. Contexto e objetivo

No mini-lab você completou o loop de um agente que persegue um objetivo de
brinquedo (adivinhar um número). Nesta atividade, o MESMO padrão de loop vira
um agente que cumpre uma missão real e verificável: montar a estrutura de um
pacote Node dentro de uma sandbox de arquivos — com o humano no loop e uma
ferramenta de sua autoria.

Ponto de partida: [`06-agente-arquivos/`](../06-agente-arquivos/)
(`agente.mjs` com TODOs, `tools.mjs` pronto, `missao.md`, `verificar.mjs`).

## 2. Ciclo de laboratório

Siga o ciclo da disciplina (roteiro de laboratórios) e registre cada passo no
relatório:

1. **Problema** — a missão de `missao.md`.
2. **Hipótese** — como o loop deve resolvê-la (quantos passos você espera? que tools em que ordem?).
3. **Preparação** — ambiente da aula 03 funcionando (`npm run 01`).
4. **Construção** — Partes 1 e 2 abaixo.
5. **Execução** — `npm run agente` (guarde o trace!).
6. **Observação** — o trace: o agente seguiu sua hipótese?
7. **Verificação** — `npm run verificar` → `MISSÃO CUMPRIDA ✅`.
8. **Explicação** — por que cada critério passou; o que causou desvios.
9. **Retirada** — o que desse loop você reescreve do zero, sem assistente?
10. **Registro** — o `relatorio.md` (Parte 3).

## 3. Parte 1 — Núcleo

Complete os TODOs 1..4 de `agente.mjs`:

- **TODO 1** — parada por limite (`MAX_PASSOS`). Sem ela o loop roda pra sempre.
- **TODO 2** — dispatch: executar `executores[nome](argumentos)`, tracear no
  formato `[passo N] nome(args) -> resultado`, devolver o tool result.
- **TODO 3** — tratamento de `finalizar` → estado `sucesso`.
- **TODO 4** — tool que falha vira observação (`ERRO: ...` como tool result),
  nunca crash.

**Pronto quando:** `npm run verificar` imprime `MISSÃO CUMPRIDA ✅` (exit 0).

## 4. Parte 2 — Extensões obrigatórias

**(a) Gate HITL na tool `escrever`.** Modelo de referência: degrau 07
(`07-hitl.mjs`). Antes de toda escrita: mostrar caminho + prévia do conteúdo,
pedir aprovação no terminal; recusa exige motivo e vira tool result
`NEGADO pelo humano: <motivo>`, marcada no trace como `[INTERVENÇÃO]`.
**O trace entregue deve conter pelo menos UMA intervenção real** (uma recusa
com motivo e a reação do agente a ela).

**(b) Uma tool nova de autoria própria** em `tools.mjs`: schema JSON
(name/description/parameters com `required`), validação de argumentos no
executor e uso efetivo pelo agente. Sugestões (escolha uma ou proponha):
`renomear(de, para)`, `apagar(caminho)` (com gate!), `contarPalavras(caminho)`,
`buscarTexto(caminho, termo)`. Se quiser que a missão exija sua tool,
crie um `missao-extra.md` e documente.

## 5. Parte 3 — Registro (`relatorio.md`)

Curto e denso (1–3 páginas):

1. **Trace comentado** — o trace completo da execução final, com anotações:
   onde o agente decidiu bem/mal, onde houve `[INTERVENÇÃO]` e como ele
   reagiu, qual estado final e por quê.
2. **Decisão da tool nova** — qual, por quê, schema escolhido, validação
   implementada, exemplo de uso no trace.
3. **Retirada** — 3 a 5 frases: o que do loop você sabe escrever do zero;
   o que ainda depende de consulta.

## 6. Entrega

Repositório (ou zip) contendo:

- `agente.mjs` e `tools.mjs` modificados (+ `missao-extra.md`, se houver);
- `trace.txt` — saída completa da execução final;
- saída de `npm run verificar` (no fim do trace ou em arquivo separado);
- `relatorio.md`.

Python é permitido (ver [`python/README.md`](../python/README.md)) — mas
`06_agente_arquivos.py` é só referência de estrutura: **copiá-lo não cumpre
as extensões**, que são de autoria sua.

## 7. Critérios de avaliação

| Critério | Peso |
|---|---|
| Núcleo funciona: TODOs corretos e `verificar` passando | 40% |
| Extensão HITL com pelo menos 1 intervenção real no trace | 20% |
| Tool própria: schema correto, validação, uso efetivo | 20% |
| Relatório: trace comentado, decisões e retirada | 20% |

**Anti-critério:** trace inventado, editado ou verificador adulterado =
atividade **zerada** (honestidade de evidência é regra da disciplina —
`AGENTS.md`). Uso de assistente de IA: permitido como apoio, mas a retirada
é sua e o professor pode arguir qualquer linha do código na aula seguinte.

## 8. Dicas e socorro

- Erros comuns e soluções: [`material-apoio.md`](material-apoio.md), seção 7
  (rate limit 429, `arguments` inválido, loop infinito, sandbox).
- Erro "mensagem de tool_call sem resposta": você esqueceu o push do tool
  result — TODA `tool_call_id` precisa de uma mensagem `role: "tool"`.
- Modelo ignorando as tools: reforce o system prompt; no Ollama 7B isso é
  esperado — o loop reorienta.
- Dúvidas: fórum da disciplina (perguntas com trace anexado têm prioridade).
