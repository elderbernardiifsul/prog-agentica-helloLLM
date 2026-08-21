// Degrau 03 — chat no terminal. A "memória" do modelo é ESTE array.
// O modelo não lembra de nada entre chamadas: quem lembra é você.
import OpenAI from "openai";
import readline from "node:readline/promises";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.LLM_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai",
});
const MODEL = process.env.LLM_MODEL ?? "gemini-2.5-flash";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const historico = [
  { role: "system", content: "Você é um assistente direto e simpático. Responda em pt-BR." },
];

console.log("Chat iniciado. Digite /sair para encerrar.\n");

while (true) {
  const entrada = await rl.question("você> ");
  if (entrada.trim() === "/sair") break;

  historico.push({ role: "user", content: entrada });

  const resposta = await client.chat.completions.create({ model: MODEL, messages: historico });
  const msg = resposta.choices[0].message;

  // Sem este push, na próxima chamada o modelo não veria a própria resposta.
  historico.push(msg);

  console.log(`\nmodelo> ${msg.content}`);
  console.log(`(mensagens no histórico: ${historico.length} | prompt_tokens: ${resposta.usage.prompt_tokens} — repare que cresce a cada turno)\n`);
}

rl.close();
