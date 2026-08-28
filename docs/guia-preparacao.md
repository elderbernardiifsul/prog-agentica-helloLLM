# Guia de preparação — Aula 03

A aula 03 é 100% prática: você vai chamar uma API de LLM de verdade e
construir seu primeiro agente. **Sem este setup pronto, nada roda.** Tempo
estimado: 15–20 min. Cada passo diz o que fazer e o que observar para
confirmar que deu certo.

## 1. Obtenção da chave de API (OpenRouter, gratuita)

O OpenRouter é um agregador: **uma única chave** dá acesso a centenas de
modelos de vários fornecedores, pelo mesmo endpoint compatível com o padrão
chat completions. Isso inclui uma faixa de modelos gratuitos, que é a que a
aula usa.

**O que fazer:**

1. Crie uma conta em <https://openrouter.ai> (login com Google ou GitHub).
2. Acesse <https://openrouter.ai/settings/keys>, clique em **Create Key**,
   dê um nome (ex.: `aula-03`) e copie a chave.
3. Guarde-a: você vai colá-la no passo 3. **Nunca** commite essa chave nem
   a envie em prints.

**O que observar:** uma chave no formato `sk-or-...`. Você não precisa
cadastrar cartão para usar os modelos gratuitos.

## 2. Verificação do ambiente Node.js

**O que fazer:**

```bash
node --version
```

**O que observar:** versão **≥ 20.6**. Se não tiver (ou for antiga):
<https://nodejs.org> (versão LTS).

## 3. Clonagem e configuração do repositório

**O que fazer:**

```bash
git clone https://github.com/elderbernardiifsul/prog-agentica-helloLLM.git
cd prog-agentica-helloLLM
cp .env.example .env          # abra o .env e cole sua chave em LLM_API_KEY
npm install
```

**O que observar:** `npm install` termina sem erro e o arquivo `.env` contém
a sua chave (e não vai para o git, porque está no `.gitignore`).

## 4. Teste de verificação e comprovante

**O que fazer:**

```bash
npm run 01
```

**O que observar:** um JSON com `choices` e `usage`. Se apareceu: **pronto** ✅.

**Entregue o comprovante:** cole a saída de `npm run 01` (pode recortar o
texto da resposta) no formulário/fórum indicado pela turma. É o check de
setup.

## 5. Modelos gratuitos: onde encontrar e como trocar

O código usa por padrão o **roteador de modelos gratuitos** do OpenRouter,
slug `openrouter/free` (<https://openrouter.ai/openrouter/free>): a cada
requisição ele seleciona um dos ~24 modelos de variante gratuita da
plataforma, com suporte a tool calling e contexto de 200k tokens, sem
cobrança de tokens. É a forma mais simples de inferência gratuita e também
resiliente: se um modelo está na fila, o roteador serve outro.

Você pode fixar um modelo específico (útil para comparar comportamentos ou
quando quiser reprodutibilidade de modelo entre execuções):

- **Onde encontrar:** <https://openrouter.ai/models?max_price=0> lista todos
  os modelos gratuitos; o **slug termina em `:free`** (ex.:
  `nvidia/nemotron-3-super-120b-a12b:free`). O slug aparece no topo da
  página de cada modelo, com botão de copiar. Pela API:
  `curl https://openrouter.ai/api/v1/models` (filtre os `id` que terminam em
  `:free`).
- **Como setar:** no seu `.env`, defina (ou descomente) a linha:

  ```
  LLM_MODEL=nvidia/nemotron-3-super-120b-a12b:free
  ```

  Nenhuma mudança de código: todos os degraus leem `LLM_MODEL`.
- **Quando trocar:** modelos `:free` individuais compartilham uma fila
  pública; se o que você fixou responder `429` repetidamente, troque o slug
  (ou volte ao roteador `openrouter/free`). Para os degraus 04 em diante o
  modelo precisa suportar **tool calling**. O filtro
  <https://openrouter.ai/models?max_price=0&supported_parameters=tools>
  mostra só esses (o roteador já filtra sozinho).

**O que observar:** o campo `model` da resposta do degrau 01 mostra qual
modelo atendeu. Com `openrouter/free`, ele pode variar entre execuções, o
que confirma que o contrato é o mesmo para todos.

## 6. Problemas comuns

| Erro | Solução |
|---|---|
| `Defina LLM_API_KEY no .env` | você não copiou o `.env.example` ou não colou a chave |
| `HTTP 401` (`No auth credentials` / `User not found`) | chave errada/incompleta; gere outra em <https://openrouter.ai/settings/keys> |
| `HTTP 429` | fila do free tier do modelo; aguarde alguns segundos e repita. Se persistir, troque o `LLM_MODEL` (seção 5) |
| `HTTP 404` no modelo | slug digitado errado ou modelo saiu do ar; confira na lista de modelos (seção 5) |
| `node: .env: not found` | o `.env` não existe (`cp .env.example .env`), ou você está rodando fora da raiz do repositório (`prog-agentica-helloLLM/`) |
| `Unexpected token` / erro de sintaxe | Node antigo; atualize para ≥ 20.6 |

## 7. Alternativa local: Ollama (opcional)

Se preferir não usar chave (ou quiser comparar modelos locais):

**O que fazer:**

```bash
# instale: https://ollama.com/download
ollama pull qwen2.5:7b
```

No seu `.env`, descomente:

```
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=qwen2.5:7b
```

**O que observar:** o mesmo código roda sem mudanças (`npm run 01` responde
via Ollama). Essa é a portabilidade do padrão chat completions que o degrau
02 ensina. Aviso: modelos de 7B obedecem pior às ferramentas, então os
agentes da aula vão precisar de mais passos.
