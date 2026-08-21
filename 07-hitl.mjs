// Degrau 07 — HITL (human-in-the-loop): o humano é parte do IO do agente.
// Regra: NENHUMA escrita acontece sem aprovação no terminal.
// Demo em aula: rode 2x — uma aprovando, outra negando com um motivo
// ("quero em inglês") e observe o agente REAGIR à recusa no passo seguinte.
import OpenAI from "openai";
import readline from "node:readline/promises";
import { defs, executores } from "./06-agente-arquivos/tools.mjs";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.LLM_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai",
});
const MODEL = process.env.LLM_MODEL ?? "gemini-2.5-flash";
const MAX_PASSOS = 8;

const MISSAO_CURTA =
  "Escreva um arquivo poema.md na raiz da sandbox com um haicai em pt-BR " +
  "sobre laços de repetição, e depois chame finalizar.";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const messages = [
  {
    role: "system",
    content:
      "Você é um agente que cumpre missões manipulando arquivos numa sandbox, " +
      "usando as tools listar, ler, escrever e finalizar. " +
      "Se uma ação for negada pelo humano, leia o motivo e ajuste sua próxima tentativa.",
  },
  { role: "user", content: MISSAO_CURTA },
];

let estadoFinal = null; // "sucesso" | "limite" | "erro"
let passo = 0;

while (estadoFinal === null) {
  passo++;
  if (passo > MAX_PASSOS) { estadoFinal = "limite"; break; }

  let resposta;
  try {
    resposta = await client.chat.completions.create({ model: MODEL, messages, tools: defs });
  } catch (erro) {
    console.error(`[passo ${passo}] erro de API: ${erro.message}`);
    estadoFinal = "erro";
    break;
  }

  const msg = resposta.choices[0].message;
  messages.push(msg);

  if (!msg.tool_calls) {
    console.log(`[passo ${passo}] modelo disse: ${msg.content}`);
    messages.push({ role: "user", content: "Continue a missão usando as tools." });
    continue;
  }

  for (const call of msg.tool_calls) {
    const nome = call.function.name;
    const argumentos = JSON.parse(call.function.arguments);

    if (nome === "finalizar") {
      console.log(`[passo ${passo}] finalizar: ${argumentos.resumo}`);
      messages.push({ role: "tool", tool_call_id: call.id, content: "ok" });
      estadoFinal = "sucesso";
      continue;
    }

    // O GATE: o efeito só acontece com aprovação humana explícita.
    if (nome === "escrever") {
      console.log(`\n⚠️  o agente quer escrever "${argumentos.caminho}" (${argumentos.conteudo.length} caracteres):`);
      console.log(argumentos.conteudo.split("\n").slice(0, 8).map((l) => "   | " + l).join("\n"));
      const ok = await rl.question("aprovar? (s/n) ");
      if (ok.trim().toLowerCase() !== "s") {
        const motivo = await rl.question("motivo da recusa: ");
        console.log(`[passo ${passo}] [INTERVENÇÃO] escrita negada: ${motivo}`);
        // A recusa vira OBSERVAÇÃO: o agente lê o motivo e replaneja.
        messages.push({ role: "tool", tool_call_id: call.id, content: `NEGADO pelo humano: ${motivo}` });
        continue;
      }
    }

    try {
      const resultado = await executores[nome](argumentos);
      console.log(`[passo ${passo}] ${nome}(${JSON.stringify(argumentos).slice(0, 60)}) -> ${String(resultado).slice(0, 60)}`);
      messages.push({ role: "tool", tool_call_id: call.id, content: String(resultado) });
    } catch (erro) {
      console.log(`[passo ${passo}] ${nome} FALHOU: ${erro.message}`);
      messages.push({ role: "tool", tool_call_id: call.id, content: `ERRO: ${erro.message}` });
    }
  }
}

rl.close();
console.log(`\n== FIM: ${estadoFinal} em ${passo} passo(s) ==`);
