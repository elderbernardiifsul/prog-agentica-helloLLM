// Degrau 01 — uma API de LLM é só HTTP + JSON.
// Rode: npm run 01   (ou: node --env-file=.env 01-fetch-cru.mjs)

const BASE_URL = process.env.LLM_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai";
const MODEL = process.env.LLM_MODEL ?? "gemini-2.5-flash";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Defina GEMINI_API_KEY no .env (copie de .env.example)");
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
