// Degrau 01 — o wire format: uma API de LLM é só HTTP + JSON.
// OBJETIVO: ver a requisição e a resposta cruas, sem SDK — model, messages
//   (com roles), choices, finish_reason e usage.
// COMO RODAR: npm run 01   (ou: node --env-file=.env 01-fetch-cru.mjs)
// O QUE OBSERVAR: o JSON completo da resposta e, em seguida, os três campos
//   que importam — content, finish_reason ("stop") e usage (custo em tokens).

const BASE_URL = process.env.LLM_BASE_URL ?? "https://openrouter.ai/api/v1";
const MODEL = process.env.LLM_MODEL ?? "openrouter/free";
const API_KEY = process.env.LLM_API_KEY;

if (!API_KEY && !process.env.LLM_BASE_URL) {
  // Com Ollama (LLM_BASE_URL local) não há chave; no OpenRouter ela é obrigatória.
  console.error("Defina LLM_API_KEY no .env (copie de .env.example)");
  process.exit(1);
}

// O corpo da requisição: modelo + lista de mensagens com papéis (roles).
const corpo = {
  model: MODEL,
  messages: [
    { role: "system", content: "Você é um assistente conciso. Responda em uma frase, em pt-BR." },
    { role: "user", content: "O que é uma janela de contexto?" },
  ],
};

const resposta = await fetch(`${BASE_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify(corpo),
});

if (!resposta.ok) {
  console.error("HTTP", resposta.status, await resposta.text());
  process.exit(1);
}

const json = await resposta.json();

console.log("== RESPOSTA CRUA (é só JSON) ==");
console.log(JSON.stringify(json, null, 2));

console.log("\n== OS TRÊS CAMPOS QUE IMPORTAM ==");
console.log("content       :", json.choices[0].message.content);
console.log("finish_reason :", json.choices[0].finish_reason); // "stop" = terminou por conta própria
console.log("usage         :", json.usage); // tokens de entrada/saída = custo
