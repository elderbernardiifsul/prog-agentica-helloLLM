// ATIVIDADE — agente de arquivos. Enunciado completo:
// docs/atividade-ead-agente-arquivos.md — siga o "Roteiro de desenvolvimento"
// (etapas com objetivo, o que fazer e o que observar).
// O QUE FAZER NESTE ARQUIVO:
//   Etapas 1 a 3 — complete os TODOs 1..4 até `npm run verificar` passar;
//   Etapa 4 — gate HITL nas tools escrever e executar (modelo no degrau 07 —
//     executar roda comandos reais: gate obrigatório).
// EM tools.mjs (etapa 5): crie UMA tool nova sua (uma tool é somente uma
//   função + o schema que a descreve ao modelo) e faça a missão usá-la —
//   documente a escolha no relatório.
// Sem o TODO 1 o loop roda pra sempre — Ctrl+C encerra.
// COMO RODAR: npm run agente
//   Com outra missão (ex.: a missao-extra.md da sua tool nova):
//   npm run agente -- 06-agente-arquivos/missao-extra.md
//   Bônus de segurança (etapa 7, SÓ depois do gate HITL): npm run injecao
import OpenAI from "openai";
import fs from "node:fs/promises";
import { defs, executores } from "./tools.mjs";

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY ?? "ollama", // com Ollama não há chave; qualquer string serve
  baseURL: process.env.LLM_BASE_URL ?? "https://openrouter.ai/api/v1",
});
const MODEL = process.env.LLM_MODEL ?? "openrouter/free";
const MAX_PASSOS = 15;

// A missão vem de missao.md — ou do caminho passado como argumento.
const missao = await fs.readFile(process.argv[2] ?? new URL("./missao.md", import.meta.url), "utf8");

// 429 = fila do free tier: esperar e repetir resolve; só desistimos após 3 tentativas.
async function chamarModelo() {
  for (let tentativa = 1; ; tentativa++) {
    try {
      return await client.chat.completions.create({ model: MODEL, messages, tools: defs });
    } catch (erro) {
      if (erro.status !== 429 || tentativa >= 3) throw erro;
      console.log(`[espera] 429 (fila do free tier) — nova tentativa em 10s (${tentativa}/3)`);
      await new Promise((r) => setTimeout(r, 10_000));
    }
  }
}

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

// Contabilidade de custo (veio pronta): a "fatura" da missão, chamada a chamada.
const custo = { chamadas: 0, prompt: 0, completion: 0, maiorPrompt: 0, passoMaiorPrompt: 0 };
function contabilizar(usage) {
  if (!usage) return;
  custo.chamadas++;
  custo.prompt += usage.prompt_tokens ?? 0;
  custo.completion += usage.completion_tokens ?? 0;
  if ((usage.prompt_tokens ?? 0) > custo.maiorPrompt) {
    custo.maiorPrompt = usage.prompt_tokens;
    custo.passoMaiorPrompt = passo;
  }
}

while (estadoFinal === null) {
  passo++;

  // TODO 1 (parada por LIMITE): se passo > MAX_PASSOS, defina
  // estadoFinal = "limite" e saia do loop com break.

  let resposta;
  try {
    resposta = await chamarModelo();
  } catch (erro) {                    // parada por ERRO (esta já veio pronta)
    console.error(`[passo ${passo}] erro de API: ${erro.message}`);
    estadoFinal = "erro";
    break;
  }

  contabilizar(resposta.usage);
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
console.log(
  `== CUSTO: ${custo.chamadas} chamada(s) · prompt ${custo.prompt} tokens ` +
  `(maior no passo ${custo.passoMaiorPrompt}: ${custo.maiorPrompt}) · ` +
  `completion ${custo.completion} · total ${custo.prompt + custo.completion} ==`
);
console.log("Agora rode: npm run verificar");
