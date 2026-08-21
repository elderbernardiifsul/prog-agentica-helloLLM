// Degrau 02 — a MESMA chamada do degrau 01, agora com o SDK oficial `openai`.
// O formato "chat completions" virou padrão de fato: Gemini, Ollama, Mistral e
// vLLM expõem endpoints compatíveis — o mesmo SDK fala com todos via baseURL.
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.LLM_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai",
});
const MODEL = process.env.LLM_MODEL ?? "gemini-2.5-flash";

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
