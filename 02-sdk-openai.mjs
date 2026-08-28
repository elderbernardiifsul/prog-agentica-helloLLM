// Degrau 02 — a MESMA chamada do degrau 01, agora com o SDK oficial `openai`.
// OBJETIVO: identificar o que o SDK abstrai e como `baseURL` dá portabilidade:
//   o formato "chat completions" virou padrão de fato — OpenRouter, Gemini,
//   Ollama, Mistral e vLLM expõem endpoints compatíveis; o mesmo SDK fala
//   com todos.
// COMO RODAR: npm run 02
// O QUE OBSERVAR: a mesma resposta do degrau 01 com bem menos código —
//   compare os dois arquivos lado a lado e veja a lista no fim deste arquivo.
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY ?? "ollama", // com Ollama não há chave; qualquer string serve
  baseURL: process.env.LLM_BASE_URL ?? "https://openrouter.ai/api/v1",
});
const MODEL = process.env.LLM_MODEL ?? "openrouter/free";

const resposta = await client.chat.completions.create({
  model: MODEL,
  messages: [
    { role: "system", content: "Você é um assistente conciso. Responda em uma frase, em pt-BR." },
    { role: "user", content: "O que um SDK de LLM abstrai em relação a uma chamada HTTP crua?" },
  ],
});

console.log("content :", resposta.choices[0].message.content);
console.log("usage   :", resposta.usage);

// O que o SDK fez por você (compare com o degrau 01):
//   - montou URL, método e header Authorization
//   - serializou/desserializou o JSON
//   - retries com backoff em erros transitórios (429/5xx)
//   - timeouts e erros tipados (APIError, RateLimitError...)
