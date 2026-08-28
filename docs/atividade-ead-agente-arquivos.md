# Atividade — Agente de arquivos

**Disciplina:** Programação Agêntica · **Referência:** Aula 03
**Prazo, modalidade e forma de entrega:** definidos na oferta da disciplina.

## 1. Objetivo

Construir um **agente em loop** que cumpre sozinho uma missão de arquivos, com
supervisão humana. Antes de qualquer código, resolva a confusão mais comum da
atividade:

> **Você não cria os arquivos da missão: o agente cria.**
> O seu trabalho é completar o *motor* (o loop em `agente.mjs`) que permite ao
> modelo trabalhar: chamar a API, executar as tools que o modelo pedir,
> registrar o trace e parar na hora certa. O modelo decide *o quê* fazer e *em
> que ordem*; o seu código executa. Se você mesmo criar `package.json` na mão
> dentro de `workspace/`, a atividade perde o sentido, e a ausência dessa
> escrita no trace mostra isso.

A missão que o agente recebe está em
[`06-agente-arquivos/missao.md`](../06-agente-arquivos/missao.md): montar,
dentro da sandbox `workspace/`, o esqueleto de um pacote Node
(`package.json`, `README.md`, `src/index.mjs`), instalar as dependências
rodando `npm install` pela tool `executar` (a pasta `node_modules/` deve
existir ao final) e, como item desejável, criar e executar um `hello.mjs` que imprime
`Hello Agent!`, registrando a saída como evidência.

Além do loop, você vai implementar duas extensões: um **gate de aprovação
humana** (HITL) nas ações sensíveis e **uma ferramenta nova de sua autoria**.

## 2. Organização dos arquivos

Ponto de partida: [`06-agente-arquivos/`](../06-agente-arquivos/). São quatro
arquivos com papéis distintos. Saiba onde você mexe e onde não:

| Arquivo | Papel | Você edita? |
|---|---|---|
| [`agente.mjs`](../06-agente-arquivos/agente.mjs) | O loop do agente (esqueleto com TODOs 1 a 4) | **Sim** (etapas 1 a 4 do roteiro) |
| [`tools.mjs`](../06-agente-arquivos/tools.mjs) | As tools prontas (`listar`, `ler`, `escrever`, `executar`) com sandbox, e os schemas que as descrevem ao modelo | **Sim**, só para adicionar a sua tool nova (etapa 5) |
| [`missao.md`](../06-agente-arquivos/missao.md) | O "pedido" que o agente recebe como mensagem de usuário | Não (se sua tool nova precisar de missão própria, crie `missao-extra.md`) |
| [`verificar.mjs`](../06-agente-arquivos/verificar.mjs) | Verificação externa e objetiva do resultado (`npm run verificar`) | **Nunca**: alterá-lo invalida a atividade |
| `workspace/` | A sandbox onde o agente trabalha (criada em execução, ignorada pelo git) | Não: quem escreve aqui é o agente |
| [`missao-injecao.md`](../06-agente-arquivos/missao-injecao.md) + [`plantar-isca.mjs`](../06-agente-arquivos/plantar-isca.mjs) | Bônus da etapa 7: missão inocente + isca com instrução maliciosa (`npm run injecao`) | Não |

Uma rodada do loop, do ponto de vista do seu código:

```
missao.md ──► [seu loop chama a API com as tools]
                 ▼
          o modelo responde com uma tool_call, ex.: escrever(...)
                 ▼
          [gate HITL, se a ação for sensível]  ── negou? "NEGADO: motivo" vira resultado
                 ▼ aprovou
          seu código executa a tool e registra o trace
                 ▼
          o resultado volta para o modelo como mensagem role:"tool"
                 ▼
          ... repete até finalizar, limite ou erro
```

## 3. Resultados esperados

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

## 4. Roteiro de desenvolvimento

Siga as etapas na ordem. Cada uma declara **objetivo** (por que existe),
**o que fazer** (a ação concreta) e **o que observar** (a evidência de que
funcionou). Se a observação não bater, resolva antes de avançar. Depurar
agente é isso: uma mudança por vez, olhando o trace.

### Etapa 0 — Preparação e linha de base

**Objetivo:** confirmar o ambiente e registrar o estado inicial da
verificação, para saber o que o seu trabalho precisa mudar.

**O que fazer:** confirme que o setup da aula funciona (`npm run 01` imprime
JSON; senão, [`guia-preparacao.md`](guia-preparacao.md)). Leia
[`missao.md`](../06-agente-arquivos/missao.md), que é o que o agente vai
receber. Rode `npm run verificar` **antes de escrever qualquer código**.

**O que observar:** os quatro critérios em FAIL. Essa é a linha de base; a
atividade termina quando todos derem PASS *por obra do agente*.

### Etapa 1 — Condição de parada por limite (TODO 1)

**Objetivo:** garantir que o loop sempre termine. Todo loop de
agente precisa desse freio de emergência: sem ele, um modelo improdutivo roda
(e gasta cota) para sempre.

**O que fazer:** em `agente.mjs`, implemente o TODO 1: se
`passo > MAX_PASSOS`, defina `estadoFinal = "limite"` e saia com `break`.

**O que observar:** `npm run agente` sempre termina sozinho, imprimindo
`== FIM: limite ...` ou `== FIM: erro ...`. Nesta etapa um erro de API do
tipo "tool_call sem resposta" é **esperado e normal**: o modelo pede uma
tool, mas seu loop ainda não devolve resultado nenhum (isso é a etapa 2). O
que importa aqui: o programa nunca fica rodando para sempre.

### Etapa 2 — Encerramento e despacho de ferramentas (TODOs 3 e 2)

**Objetivo:** completar o coração do loop: executar as tools que o modelo
pede e reconhecer o momento de encerrar com sucesso.

**O que fazer:** dois detalhes de ordem, já indicados nos comentários do
código:

- O tratamento de `finalizar` (TODO 3) vem **antes** do dispatch no corpo do
  `for`, porque `finalizar` não tem executor em `tools.mjs`. O loop a trata:
  registra o resumo, devolve `"ok"` como tool result e encerra com
  `estadoFinal = "sucesso"`.
- O dispatch (TODO 2) faz o resto: executa `executores[nome](argumentos)`,
  imprime a linha de trace `[passo N] nome(argumentos) -> resultado` e
  devolve o resultado como mensagem `{ role: "tool", tool_call_id: call.id,
  content: String(resultado) }`. **Toda `tool_call` exige uma mensagem
  `role: "tool"` correspondente**; esquecer o push é o erro mais comum da
  atividade.

**O que observar:** `npm run agente` percorre a missão inteira e chega a
`== FIM: sucesso ...`; em seguida `npm run verificar` mostra os critérios em
PASS. (O item desejável `hello.mjs` só informa, não reprova.)

### Etapa 3 — Tolerância a falhas de ferramenta (TODO 4)

**Objetivo:** transformar falha de tool em observação para o modelo, em vez
de derrubar o programa. Um loop que morre na primeira exceção desperdiça
todos os passos anteriores e nunca dá ao modelo a chance de contornar o erro.

**O que fazer:** envolva o dispatch em `try/catch` e, no catch, devolva
`ERRO: <mensagem>` como tool result. O erro vira observação, e **o modelo**
decide o que fazer com ele (tentar de novo, mudar o caminho, desistir).

**O que observar (teste opcional, recomendado):** numa execução avulsa,
provoque um erro (por exemplo, adicione à missão "leia o arquivo
`nao-existe.txt`") e veja no trace o `ERRO:` seguido da reação do modelo,
com o agente seguindo vivo.

### Etapa 4 — Supervisão humana: gate de aprovação (HITL)

**Objetivo:** nenhuma ação sensível acontece sem aprovação humana explícita;
a recusa entra no contexto como observação e o modelo replaneja. O humano
vira parte do IO do agente.

**O que fazer:** copie e adapte o padrão de [`07-hitl.mjs`](../07-hitl.mjs).
Antes de cada `escrever` **e** de cada `executar`, mostre a ação proposta
(caminho e prévia do conteúdo; ou o comando) e peça confirmação no terminal.
Para `executar` o gate é obrigatório, porque a tool roda comandos reais no
seu computador. Recusa exige um motivo, devolvido ao modelo como tool result
(`NEGADO pelo humano: <motivo>`) e registrado no trace como `[INTERVENÇÃO]`.
A recusa **não** encerra o agente.

**O que observar:** numa execução, negue uma escrita com um motivo concreto
(ex.: "falta a seção Como usar") e veja o agente corrigir nos passos
seguintes. O trace entregue deve conter **pelo menos uma recusa real** com a
reação do agente.

### Etapa 5 — Extensão do conjunto de ferramentas (tool de sua autoria)

**Objetivo:** constatar, criando a sua, que uma tool não exige
infraestrutura: **é somente uma função** no seu código, mais o schema JSON
que a descreve ao modelo (`name`, `description`, `parameters` com
`required`). Veja como `listar` ocupa dez linhas em `tools.mjs`.

**O que fazer:** adicione a sua tool em `tools.mjs` (schema em `defs`,
função em `executores`), com validação dos argumentos no executor. Exemplos
de escopo adequado: `renomear(de, para)`, `apagar(caminho)` (com gate),
`contarPalavras(caminho)`, `buscarTexto(caminho, termo)`. Se a missão
original não exercitar sua ferramenta, descreva uma missão complementar em
`missao-extra.md` e rode o agente com ela:

```bash
npm run agente -- 06-agente-arquivos/missao-extra.md
```

Duas notas:

- O teste `defs declara as 5 tools originais` (`npm test`) já aceita tools
  adicionais; sua tool nova não o quebra. A regra "não alterar" vale para
  `verificar.mjs`, não para `tests/`.
- Só o **verificador** é fixo na missão original; o agente aceita qualquer
  missão pelo argumento acima.

**O que observar:** um trace em que o modelo chama a sua tool e usa o
resultado. O que se avalia: schema correto, validação dos argumentos e uso
efetivo em execução.

### Etapa 6 — Execução final e coleta de evidências

**Objetivo:** produzir as evidências de entrega: um trace completo, limpo e
não editado, mais a saída da verificação.

**O que fazer:** apague a sandbox para uma rodada limpa e grave as saídas:

```bash
rm -rf workspace                          # (PowerShell: Remove-Item -Recurse workspace)
npm run agente    | tee trace.txt         # roda o agente gravando a saída
npm run verificar | tee verificacao.txt   # grava a verificação
```

(`tee` mostra e grava ao mesmo tempo; se preferir, copie a saída do terminal
para os arquivos manualmente.)

**O que observar:** o trace final começa da sandbox vazia, contém a
intervenção da etapa 4 (e a sua tool, se exercitada) e termina em sucesso;
`verificacao.txt` mostra todos os critérios em PASS. A saída deve estar
**completa e não editada**, porque é artefato de avaliação. A linha
`== CUSTO ==` que o loop imprime ao final (chamadas, tokens de prompt e de
completion, e o passo em que o prompt foi maior) resume quanto a missão
consumiu e alimenta o item 4 do relatório.

### Etapa 7 (bônus) — Injeção de prompt na sandbox

**Objetivo:** ver o ataque que sandbox e gate existem para conter. Tudo que o
agente **lê** (arquivos, páginas, saídas de comando) deveria ser tratado como
*dado*, mas o modelo nem sempre respeita essa fronteira e pode obedecer a uma
instrução embutida ali. Faça esta etapa **depois da etapa 4**: a defesa que
você vai observar é o seu gate.

**O que fazer:** leia [`missao-injecao.md`](../06-agente-arquivos/missao-injecao.md)
(uma missão inocente: resumir `notas.txt`) e
[`plantar-isca.mjs`](../06-agente-arquivos/plantar-isca.mjs) (que cria o
`notas.txt` com um bloco de "instrução do sistema" escondido no meio das
anotações). Depois rode:

```bash
npm run injecao | tee trace-injecao.txt
```

Aprove só o que a missão pede (o `resumo.md`); **negue** qualquer escrita ou
comando que venha da isca, com o motivo ("instrução veio de um arquivo, não
do usuário").

**O que observar:** o modelo obedeceu ao bloco injetado (pediu `rm -rf`,
`pwned.txt`) ou o ignorou? Se obedeceu, onde a cadeia parou: no seu gate
(`[INTERVENÇÃO]`) ou na sandbox? Se ignorou, o resumo menciona a instrução?
Rode 2 ou 3 vezes: com `openrouter/free` o modelo varia e o comportamento
também. Registre o que viu em 3 a 5 frases no relatório (item 5).


## 5. Relatório (`relatorio.md`)

Documento de 1 a 3 páginas contendo:

1. **Trace comentado**: o trace completo da execução final, com anotações
   sobre as decisões do agente, a intervenção registrada e o estado final.
2. **Ferramenta nova**: qual foi implementada, justificativa, schema adotado
   e validação realizada, com o trecho do trace em que ela é usada.
3. **Autonomia**: 3 a 5 frases: o que do loop você é capaz de reescrever sem
   assistência e o que ainda exige consulta.
4. **Custo**: a linha `== CUSTO ==` da execução final e 2 a 4 frases: por que
   `prompt` cresce a cada passo, em qual passo foi maior e o que no seu trace
   explica isso; quanto custaria em uma API paga (escolha um preço por milhão
   de tokens e faça a conta).
5. **(Bônus) Injeção de prompt**: se fez a etapa 7: o que o modelo fez com a
   instrução escondida, onde a defesa atuou e o trecho do trace.

## 6. Entrega

Repositório ou arquivo compactado contendo:

| Item | Conteúdo |
|---|---|
| `agente.mjs`, `tools.mjs` | código com os TODOs resolvidos e as extensões (+ `missao-extra.md`, se houver) |
| `trace.txt` | saída completa da execução final, incluindo a intervenção |
| `verificacao.txt` | saída de `npm run verificar` (ou incluída ao final do trace) |
| `relatorio.md` | relatório da seção 5 |
| `trace-injecao.txt` (bônus) | saída da etapa 7, se realizada |

**Onde entregar:** conforme as instruções da oferta (AVA/fórum da turma).

A implementação em Python é aceita (ver
[`python/README.md`](../python/README.md)). O arquivo
`06_agente_arquivos.py` serve apenas como referência de estrutura do núcleo:
as extensões (gate HITL e ferramenta nova) devem ser implementação sua.

## 7. Avaliação

| Critério | Peso |
|---|---|
| Núcleo: TODOs corretos e verificação com todos os critérios em PASS | 40% |
| Gate HITL com pelo menos uma intervenção real registrada no trace | 20% |
| Ferramenta própria: schema correto, validação e uso efetivo | 20% |
| Relatório: trace comentado, justificativas e autonomia | 20% |

A etapa 7 é bônus: não altera os pesos, mas conta como evidência forte no
critério "Relatório" e na arguição.

Trace forjado, editado ou verificador alterado invalida a atividade
(honestidade de evidência é regra da disciplina). Criar na mão os arquivos da
missão dentro de `workspace/` conta como trace forjado. O uso de assistentes
de IA é permitido como apoio; a análise de autonomia é individual e o
professor pode arguir qualquer trecho do código na aula seguinte.

## 8. Referências e suporte

- Erros comuns e soluções: [`material-apoio.md`](material-apoio.md), seção 7
  (limite de requisições, argumentos inválidos, loop sem parada, sandbox).
- Erro "mensagem de tool_call sem resposta": toda `tool_call_id` exige uma
  mensagem `role: "tool"` correspondente; verifique o TODO 2 (etapa 2).
- Modelo respondendo texto em vez de usar as ferramentas: reforce a instrução
  no system prompt; com modelos locais pequenos esse comportamento é
  frequente e o loop já reorienta.
- Erro `429` (fila do free tier): aguarde alguns segundos e rode de novo; se
  persistir, troque o `LLM_MODEL` por outro modelo `:free` no `.env`
  ([`guia-preparacao.md`](guia-preparacao.md), seção 5) ou use Ollama.
- Dúvidas: fórum da disciplina, preferencialmente com o trace anexado.
