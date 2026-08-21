# Atividade EaD — Agente de arquivos

**Disciplina:** Programação Agêntica · **Referência:** Aula 03
**Prazo:** 2 aulas
**Modalidade:** individual (salvo definição contrária na oferta)

## 1. Objetivo

Implementar um agente em loop que cumpre a missão descrita em
[`06-agente-arquivos/missao.md`](../06-agente-arquivos/missao.md): criar,
dentro da sandbox `workspace/`, três arquivos que formam o esqueleto de um
pacote Node, com node_modules. Desejável que crie um script que imprima "Hello Agent!" e que o agente execute esse script e mostre evidencia da tarefa cumprida. O agente deve operar com supervisão humana (gate de aprovação
nas escritas) e usar uma ferramenta adicional implementada por você.

Ponto de partida: [`06-agente-arquivos/`](../06-agente-arquivos/) —
`agente.mjs` (esqueleto com TODOs 1 a 4), `tools.mjs` (ferramentas prontas),
`missao.md` (objetivo do agente) e `verificar.mjs` (verificação automática).

## 2. Resultado esperado

Ao final, a sequência abaixo deve funcionar no seu ambiente:

```bash
npm run agente      # o agente executa a missão, pedindo aprovação nas escritas
npm run verificar   # todos os critérios passam
```

**Estado final da sandbox** (conteúdo mínimo):

```
workspace/
├── package.json      # name "workspace-demo", scripts.test e picocolors em dependencies
├── node_modules/     # resultado de npm install executado PELO AGENTE
├── README.md         # contém a seção "## Como usar"
├── hello.mjs         # (desejável) imprime "Hello Agent!"
└── src/
    └── index.mjs     # exporta saudacao(nome) → "Olá, <nome>!"
```

**Exemplo ilustrativo de trace** (os passos reais variam conforme as decisões
do modelo; o seu trace deve ter esta forma e conter ao menos uma intervenção):

```
[passo 1] listar({"caminho":"."}) -> (vazio)
[passo 2] escrever({"caminho":"package.json", ...}) -> ok: package.json (158 caracteres)

⚠️  o agente quer escrever "README.md" (61 caracteres):
   | # workspace-demo
   | Projeto de demonstração.
aprovar? (s/n) n
motivo da recusa: falta a seção Como usar
[passo 3] [INTERVENÇÃO] escrita negada: falta a seção Como usar
[passo 4] escrever({"caminho":"README.md", ...}) -> ok: README.md (129 caracteres)
[passo 5] escrever({"caminho":"src/index.mjs", ...}) -> ok: src/index.mjs (88 caracteres)

⚠️  o agente quer executar "npm install":
aprovar? (s/n) s
[passo 6] executar({"comando":"npm install"}) -> added 1 package in 1s
[passo 7] escrever({"caminho":"hello.mjs", ...}) -> ok: hello.mjs (31 caracteres)
[passo 8] executar({"comando":"node hello.mjs"}) -> Hello Agent!
[passo 9] finalizar: arquivos criados, dependência instalada e hello.mjs executado com sucesso

== FIM: sucesso em 9 passo(s) ==
```

**Saída esperada da verificação:**

```
PASS package.json válido com name, scripts.test e dependência
PASS dependências instaladas (node_modules presente)
PASS README.md com seção '## Como usar'
PASS src/index.mjs exporta saudacao() correta
INFO desejável cumprido: hello.mjs imprime "Hello Agent!"

MISSÃO CUMPRIDA ✅
```

## 3. Tarefas

### Parte 1 — Completar o loop (núcleo)

Em `agente.mjs`, implemente os quatro TODOs:

1. **TODO 1** — parada por limite: encerrar com estado `limite` quando
   `passo > MAX_PASSOS`.
2. **TODO 2** — dispatch: interpretar cada `tool_call` (parse dos argumentos),
   executar `executores[nome](argumentos)`, registrar a linha de trace
   `[passo N] nome(args) -> resultado` e devolver o resultado como mensagem
   `role: "tool"`.
3. **TODO 3** — tratamento de `finalizar`: registrar o resumo e encerrar com
   estado `sucesso`.
4. **TODO 4** — falha de ferramenta: capturar exceções do executor e devolver
   `ERRO: <mensagem>` como resultado da ferramenta, sem encerrar o programa.

Critério de conclusão desta parte: `npm run verificar` com todos os critérios
em PASS.

### Parte 2 — Extensões

**(a) Gate de aprovação (HITL) nas ferramentas `escrever` e `executar`.**
Referência de implementação: [`07-hitl.mjs`](../07-hitl.mjs). Antes de cada
escrita ou execução de comando, o programa exibe a ação proposta (caminho e
prévia do conteúdo; ou o comando) e pede confirmação no terminal. Para
`executar` o gate é indispensável: a ferramenta roda comandos reais no seu
computador. Recusa exige um motivo, que é devolvido ao modelo como resultado
da ferramenta (`NEGADO pelo humano: <motivo>`) e registrado no trace como
`[INTERVENÇÃO]`. O trace entregue deve conter **pelo menos uma recusa real**,
com a reação do agente nos passos seguintes.

**(b) Uma ferramenta nova, de sua autoria,** em `tools.mjs`. Uma ferramenta
não exige infraestrutura: **é somente uma função** no seu código, mais o
schema JSON que a descreve ao modelo (`name`, `description`, `parameters` com
`required`) — veja como `listar` ocupa dez linhas em `tools.mjs`. O que se
avalia: validação dos argumentos no executor e uso efetivo pelo agente em
execução. Exemplos de escopo adequado: `renomear(de, para)`,
`apagar(caminho)` (com gate), `contarPalavras(caminho)`,
`buscarTexto(caminho, termo)`. Caso a missão original não exercite sua
ferramenta, descreva uma missão complementar em `missao-extra.md`.

### Parte 3 — Relatório (`relatorio.md`)

Documento de 1 a 3 páginas contendo:

1. **Trace comentado** — o trace completo da execução final, com anotações
   sobre as decisões do agente, a intervenção registrada e o estado final.
2. **Ferramenta nova** — qual foi implementada, justificativa, schema adotado
   e validação realizada, com o trecho do trace em que ela é usada.
3. **Autonomia** — 3 a 5 frases: o que do loop você é capaz de reescrever sem
   assistência e o que ainda exige consulta.

## 4. Entrega

Repositório ou arquivo compactado contendo:

| Item | Conteúdo |
|---|---|
| `agente.mjs`, `tools.mjs` | código com os TODOs resolvidos e as extensões (+ `missao-extra.md`, se houver) |
| `trace.txt` | saída completa da execução final, incluindo a intervenção |
| `verificacao.txt` | saída de `npm run verificar` (ou incluída ao final do trace) |
| `relatorio.md` | relatório da Parte 3 |

A implementação em Python é aceita (ver
[`python/README.md`](../python/README.md)). O arquivo
`06_agente_arquivos.py` serve apenas como referência de estrutura do núcleo:
as extensões da Parte 2 devem ser implementação sua.

## 5. Avaliação

| Critério | Peso |
|---|---|
| Núcleo: TODOs corretos e verificação com todos os critérios em PASS | 40% |
| Gate HITL com pelo menos uma intervenção real registrada no trace | 20% |
| Ferramenta própria: schema correto, validação e uso efetivo | 20% |
| Relatório: trace comentado, justificativas e autonomia | 20% |

Trace forjado, editado ou verificador alterado invalida a atividade
(honestidade de evidência é regra da disciplina). O uso de assistentes de IA
é permitido como apoio; a análise de autonomia é individual e o professor pode arguir
qualquer trecho do código na aula seguinte.

## 6. Material de apoio

- Erros comuns e soluções: [`material-apoio.md`](material-apoio.md), seção 7
  (limite de requisições, argumentos inválidos, loop sem parada, sandbox).
- Erro "mensagem de tool_call sem resposta": toda `tool_call_id` exige uma
  mensagem `role: "tool"` correspondente — verifique o TODO 2.
- Modelo respondendo texto em vez de usar as ferramentas: reforce a instrução
  no system prompt; com modelos locais pequenos esse comportamento é
  frequente e o loop já reorienta.
- Dúvidas: fórum da disciplina, preferencialmente com o trace anexado.
