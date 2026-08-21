// ATIVIDADE EaD — agente de arquivos. Enunciado completo:
// docs/atividade-ead-agente-arquivos.md
// Parte 1 (núcleo): complete os TODOs 1..4 até `npm run verificar` passar.
// Parte 2 (extensões): (a) gate HITL nas tools escrever e executar (modelo
//   no degrau 07 — executar roda comandos reais: gate obrigatório);
//   (b) crie UMA tool nova sua em tools.mjs (uma tool é somente uma função
//   + o schema que a descreve ao modelo) e faça a missão usá-la —
//   documente a escolha no relatório.
// Sem o TODO 1 o loop roda pra sempre — Ctrl+C encerra.
// Rode com: npm run agente
import OpenAI from "openai";
import fs from "node:fs/promises";
import { defs, executores } from "./tools.mjs";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.LLM_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai",
});
const MODEL = process.env.LLM_MODEL ?? "gemini-2.5-flash";
const MAX_PASSOS = 15;

const missao = await fs.readFile(new URL("./missao.md", import.meta.url), "utf8");

const messages = [
  {
    role: "system",
    content:
      "Você é um agente que cumpre missões numa sandbox de arquivos, usando " +
      "as tools listar, ler, escrever, executar e finalizar. Trabalhe passo " +
      "a passo e colete evidências do que fizer. Chame finalizar SOMENTE " +
      "quando os critérios obrigatórios da missão estiverem prontos.",
  },
  { role: "user", content: missao },
];

let estadoFinal = null; // "sucesso" | "limite" | "erro"
let passo = 0;

while (estadoFinal === null) {
  passo++;

  // TODO 1 (parada por LIMITE): se passo > MAX_PASSOS, defina
  // estadoFinal = "limite" e saia do loop com break.

  let resposta;
  try {
    resposta = await client.chat.completions.create({ model: MODEL, messages, tools: defs });
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
    messages.push({ role: "user", content: "Continue a missão usando as tools." });
    continue;
  }

  for (const call of msg.tool_calls) {
    const nome = call.function.name;
    const argumentos = JSON.parse(call.function.arguments);

    // TODO 3 (parada por SUCESSO): se nome === "finalizar", imprima o
    //   argumentos.resumo no trace, faça push do tool result
    //   { role: "tool", tool_call_id: call.id, content: "ok" },
    //   defina estadoFinal = "sucesso" e use `continue`.

    // TODO 2 (DISPATCH): execute executores[nome](argumentos), imprima o
    //   trace no formato `[passo N] nome(argumentos) -> resultado`
    //   e faça push de { role: "tool", tool_call_id: call.id,
    //   content: String(resultado) }.
    // TODO 4 (tool que falha NÃO derruba o agente): envolva o dispatch em
    //   try/catch e, no catch, devolva `ERRO: ${erro.message}` como tool
    //   result — deixe o MODELO decidir o que fazer com o erro.
  }
}

console.log(`\n== FIM: ${estadoFinal} em ${passo} passo(s) ==`);
console.log("Agora rode: npm run verificar");
