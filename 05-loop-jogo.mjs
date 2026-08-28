// Degrau 05 — MINI-LAB: seu primeiro agente em loop.
// OBJETIVO: transformar o ciclo manual do degrau 04 num loop autônomo com
//   três estados de parada: sucesso, limite e erro.
// O QUE FAZER: complete os TODOs 1..3 e rode: npm run 05
// O QUE OBSERVAR: o trace `[passo N] chute X -> resultado`; a busca binária
//   convergindo em ~7 passos; o estado final impresso ao fim.
// DESAFIOS EXTRAS (se sobrar tempo): mude MAX_PASSOS para 3 e observe o
//   estado "limite"; troque o system prompt para proibir busca binária e
//   compare os traces.
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY ?? "ollama", // com Ollama não há chave; qualquer string serve
  baseURL: process.env.LLM_BASE_URL ?? "https://openrouter.ai/api/v1",
});
const MODEL = process.env.LLM_MODEL ?? "openrouter/free";

const SECRETO = Math.floor(Math.random() * 100) + 1;
const MAX_PASSOS = 10;

const tools = [
  {
    type: "function",
    function: {
      name: "chutar",
      description: "Chuta um número. Retorna 'maior' (o secreto é maior), 'menor' ou 'acertou'.",
      parameters: {
        type: "object",
        properties: { numero: { type: "integer", minimum: 1, maximum: 100 } },
        required: ["numero"],
      },
    },
  },
];

function chutar({ numero }) {
  if (numero === SECRETO) return "acertou";
  return numero < SECRETO ? "maior" : "menor";
}

const messages = [
  {
    role: "system",
    content:
      "Você é um agente que precisa adivinhar um número secreto entre 1 e 100 " +
      "usando a tool chutar. Use busca binária. Chute UM número por vez.",
  },
  { role: "user", content: "Descubra o número secreto." },
];

let estadoFinal = null; // "sucesso" | "limite" | "erro"
let passo = 0;

while (estadoFinal === null) {
  passo++;

  // TODO 1 (parada por LIMITE): se passo > MAX_PASSOS, defina
  // estadoFinal = "limite" e saia do loop com break.
  // ATENÇÃO: sem este TODO o loop roda pra sempre — Ctrl+C encerra.

  let resposta;
  try {
    resposta = await client.chat.completions.create({ model: MODEL, messages, tools });
  } catch (erro) {                    // parada por ERRO (esta já veio pronta)
    console.error(`[passo ${passo}] erro de API: ${erro.message}`);
    estadoFinal = "erro";
    break;
  }

  const msg = resposta.choices[0].message;
  messages.push(msg);

  if (!msg.tool_calls) {
    // O modelo conversou em vez de agir — trace e segue o loop.
    console.log(`[passo ${passo}] modelo disse: ${msg.content}`);
    messages.push({ role: "user", content: "Continue: use a tool chutar." });
    continue;
  }

  for (const call of msg.tool_calls) {
    // TODO 2 (DISPATCH): parseie call.function.arguments com JSON.parse,
    //   execute chutar(argumentos), imprima o trace no formato
    //   `[passo N] chute X -> resultado`
    //   e faça push em messages de { role: "tool", tool_call_id: call.id,
    //   content: resultado }.
    // TODO 3 (parada por SUCESSO): se o resultado for "acertou",
    //   defina estadoFinal = "sucesso".
  }
}

console.log(`\n== FIM: ${estadoFinal} em ${passo} passo(s) (secreto era ${SECRETO}) ==`);
