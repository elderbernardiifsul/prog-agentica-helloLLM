// Degrau 03b — VENDO a janela de contexto.
// A API é STATELESS: a cada chamada o modelo enxerga SOMENTE o que este array
// contém. "Janela de contexto" é o limite de tokens do que pode ser enviado
// (mais a resposta). A do Gemini é enorme (~1M tokens) — então SIMULAMOS uma
// janela pequena para ver o efeito na prática: o modelo ESQUECE.
//
// Roteiro de demonstração:
//   1. "meu nome é <seu nome>"
//   2. peça 2 ou 3 respostas longas (ex.: "explique HTTP em detalhes")
//   3. "qual é meu nome?"  ->  depois do trimming, ele não sabe mais.
import OpenAI from "openai";
import readline from "node:readline/promises";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.LLM_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai",
});
const MODEL = process.env.LLM_MODEL ?? "gemini-2.5-flash";

const ORCAMENTO_PROMPT_TOKENS = 250; // nossa "janela" simulada

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const historico = [
  { role: "system", content: "Você é um assistente direto. Responda em pt-BR." },
];

function mostrarContexto(promptTokens) {
  console.log("┌── CONTEXTO QUE SERÁ ENVIADO ──");
  for (const [i, m] of historico.entries()) {
    const texto = String(m.content ?? "").replaceAll("\n", " ").slice(0, 60);
    console.log(`│ ${String(i).padStart(2)} ${m.role.padEnd(9)} ${texto}`);
  }
  console.log(`└── prompt_tokens da última chamada: ${promptTokens ?? "?"} / orçamento: ${ORCAMENTO_PROMPT_TOKENS}`);
}

function aparar(promptTokens) {
  // Aproximação didática: se a ÚLTIMA chamada estourou o orçamento, removemos
  // a mensagem mais antiga (preservando a system em [0]) antes da próxima.
  if ((promptTokens ?? 0) > ORCAMENTO_PROMPT_TOKENS && historico.length > 2) {
    const removida = historico.splice(1, 1)[0];
    console.log(`✂️  caiu para fora da janela: [${removida.role}] ${String(removida.content).slice(0, 50)}...`);
  }
}

console.log("Chat com janela simulada. /sair encerra.\n");
let ultimoPromptTokens = null;

while (true) {
  const entrada = await rl.question("você> ");
  if (entrada.trim() === "/sair") break;

  aparar(ultimoPromptTokens);
  historico.push({ role: "user", content: entrada });
  mostrarContexto(ultimoPromptTokens);

  const resposta = await client.chat.completions.create({ model: MODEL, messages: historico });
  const msg = resposta.choices[0].message;
  historico.push(msg);
  ultimoPromptTokens = resposta.usage.prompt_tokens;

  console.log(`\nmodelo> ${msg.content}\n`);
}
rl.close();
