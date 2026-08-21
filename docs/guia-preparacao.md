# Guia de preparação — Aula 03 (fazer ANTES da aula)

A aula 03 é 100% prática: você vai chamar uma API de LLM de verdade e
construir seu primeiro agente. **Sem este setup pronto, você perde o
mini-lab.** Tempo estimado: 15–20 min.

## 1. Crie sua chave do Google AI Studio (gratuita)

1. Acesse <https://aistudio.google.com/apikey> com sua conta Google.
2. Clique em **Create API key** e copie a chave (algo como `AIza...`).
3. Guarde-a — você vai colá-la no passo 3. **Nunca** commite essa chave nem
   a envie em prints.

O free tier basta para toda a aula (se aparecer erro 429 durante o uso,
é a cota por minuto: espere ~1 min e repita).

## 2. Instale/confira o Node.js

```bash
node --version   # precisa ser >= 20.6
```

Se não tiver (ou for antigo): <https://nodejs.org> (versão LTS).

## 3. Clone o repositório da atividade e configure

```bash
git clone https://github.com/elderbernardiifsul/prog-agentica-helloLLM.git
cd prog-agentica-helloLLM
cp .env.example .env          # abra o .env e cole sua chave em GEMINI_API_KEY
npm install
```

## 4. Teste

```bash
npm run 01
```

Se imprimiu um JSON com `choices` e `usage`: **pronto** ✅.

**Entregue o comprovante:** cole a saída de `npm run 01` (pode recortar o
texto da resposta) no formulário/fórum indicado pela turma. É o check de
setup do início da aula.

## Problemas comuns

| Erro | Solução |
|---|---|
| `Defina GEMINI_API_KEY no .env` | você não copiou o `.env.example` ou não colou a chave |
| `HTTP 401/403` | chave errada/incompleta — gere outra no AI Studio |
| `HTTP 429` | cota do free tier — espere 1 minuto e repita |
| `node: .env: not found` | rode da raiz do repositório (`prog-agentica-helloLLM/`) |
| `Unexpected token` / erro de sintaxe | Node antigo — atualize para ≥ 20.6 |

## Opcional: Ollama (rodar 100% local, sem chave)

Se preferir não usar chave (ou quiser comparar modelos locais):

```bash
# instale: https://ollama.com/download
ollama pull qwen2.5:7b
```

No seu `.env`, descomente:

```
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=qwen2.5:7b
```

O mesmo código roda sem mudanças. Aviso: modelos de 7B obedecem pior às
ferramentas — os agentes da aula vão precisar de mais passos.
