# Exemplo resolvido — Degrau 01 (wire format)

Este documento resolve o degrau 01 de ponta a ponta: objetivo, leitura do
código, execução, saída anotada e observações. Ele é o **modelo do método de
estudo**: replique estes mesmos passos em todos os outros degraus.

> **O método, em uma linha:** leia o cabeçalho do script → leia o código
> procurando o objetivo → rode → confira "o que observar" → experimente.

## 1. Leia o cabeçalho do script

O objetivo de cada degrau está **no cabeçalho do próprio arquivo**. Abra
[`01-fetch-cru.mjs`](../01-fetch-cru.mjs):

```js
// Degrau 01 — o wire format: uma API de LLM é só HTTP + JSON.
// OBJETIVO: ver a requisição e a resposta cruas, sem SDK — model, messages
//   (com roles), choices, finish_reason e usage.
// COMO RODAR: npm run 01   (ou: node --env-file=.env 01-fetch-cru.mjs)
// O QUE OBSERVAR: o JSON completo da resposta e, em seguida, os três campos
//   que importam — content, finish_reason ("stop") e usage (custo em tokens).
```

Antes de rodar, você já sabe o que o degrau ensina e que evidência procurar
na saída.

## 2. Leia o código procurando o objetivo

O arquivo tem ~40 linhas e nenhum SDK. Localize as três peças que o objetivo
anuncia:

1. **O corpo da requisição:** `corpo = { model, messages }`, onde `messages`
   é uma lista de mensagens com papéis (`system` define as regras, `user` faz
   o pedido).
2. **A chamada HTTP:** um `fetch` comum: `POST {BASE_URL}/chat/completions`,
   header `Authorization: Bearer <chave>`, corpo em JSON. É tudo que existe
   entre você e o modelo.
3. **A leitura da resposta:** `json.choices[0].message.content`,
   `finish_reason` e `usage`.

## 3. Execute

```bash
npm run 01
```

## 4. Saída anotada

Saída **ilustrativa**. A sua terá texto e números diferentes (o modelo é
não determinístico, e provedores podem incluir campos extras):

```
== RESPOSTA CRUA (é só JSON) ==
{
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",                                 ← quem "fala" é o modelo
        "content": "É o limite máximo de tokens que o modelo
                    consegue considerar de uma vez."          ← a resposta em si
      },
      "finish_reason": "stop"                                ← POR QUE o modelo parou
    }
  ],
  "usage": {
    "prompt_tokens": 28,                                     ← o que VOCÊ enviou
    "completion_tokens": 31,                                 ← o que o modelo gerou
    "total_tokens": 59                                       ← a "fatura" da chamada
  }
}

== OS TRÊS CAMPOS QUE IMPORTAM ==
content       : É o limite máximo de tokens que o modelo consegue considerar de uma vez.
finish_reason : stop
usage         : { prompt_tokens: 28, completion_tokens: 31, total_tokens: 59 }
```

## 5. Confira "o que observar"

Volte ao cabeçalho e marque cada item contra a sua saída real:

- [ ] O JSON completo apareceu, com `choices` e `usage`.
- [ ] A resposta está em `choices[0].message.content`, com `role: "assistant"`.
- [ ] `finish_reason` é `"stop"`: o modelo terminou por conta própria
  (os outros valores importantes, `"tool_calls"` e `"length"`, aparecem nos
  degraus 04 em diante; ver [`material-apoio.md`](material-apoio.md), §1).
- [ ] `usage` mostra o custo em tokens: `prompt_tokens` (entrada) e
  `completion_tokens` (saída). Em APIs pagas, cada um tem preço. Se
  `total_tokens` for maior que a soma dos dois, é porque modelos com
  raciocínio contam também os tokens de "pensamento"
  (`completion_tokens_details.reasoning_tokens`).

Se todos os itens bateram, você compreendeu o degrau: toda a comunicação
com um LLM é essa requisição e essa resposta.

## 6. Experimente (opcional, recomendado)

Pequenas mutações consolidam o conceito. Uma por vez, rodando entre cada uma:

- **Mude a pergunta** no `role: "user"` e observe `usage` variar com o
  tamanho do texto.
- **Mude a regra** no `role: "system"` (ex.: "responda em inglês, em tom
  formal") e observe o efeito na resposta sem tocar na pergunta.
- **Provoque um erro**: troque um caractere da chave no `.env`, rode e
  observe o `HTTP 401`. Aprenda a ler a mensagem de erro e desfaça em
  seguida.

## 7. Registre

Guarde a saída (copie do terminal para suas anotações). Esse hábito de
registrar *evidência de execução* começa aqui como estudo e vira artefato de
entrega nos degraus 05 e 06 (o trace da atividade).

---

**Próximo passo:** aplique o mesmo método ao degrau 02. O cabeçalho de
[`02-sdk-openai.mjs`](../02-sdk-openai.mjs) já diz o que fazer e o que
observar. Aprofundamento de cada degrau:
[`material-apoio.md`](material-apoio.md).
