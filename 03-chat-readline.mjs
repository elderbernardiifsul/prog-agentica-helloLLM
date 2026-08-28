// Degrau 03 — chat no terminal: a "memória" do modelo é ESTE array.
// OBJETIVO: constatar que a API é stateless — o modelo não lembra de nada
//   entre chamadas; quem lembra é o array `historico` que VOCÊ gerencia.
// COMO RODAR: npm run 03   (digite /sair para encerrar)
// O QUE OBSERVAR: prompt_tokens crescendo a cada turno (o histórico inteiro
//   é reenviado). Experimento: comente o `historico.push(msg)` da resposta e
//   veja o modelo "esquecer" o que ele mesmo acabou de dizer.
import OpenAI from "openai";
import readline from "node:readline/promises";

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY ?? "ollama", // com Ollama não há chave; qualquer string serve
  baseURL: process.env.LLM_BASE_URL ?? "https://openrouter.ai/api/v1",
});
const MODEL = process.env.LLM_MODEL ?? "openrouter/free";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const historico = [
  { role: "system", content: "Você é um assistente direto e simpático. Responda em pt-BR." },
];

console.log("Chat iniciado. Digite /sair para encerrar.\n");

while (true) {
  const entrada = await rl.question("você> ");
  if (entrada.trim() === "/sair") break;

  historico.push({ role: "user", content: entrada });

  let resposta;
  try {
    resposta = await client.chat.completions.create({ model: MODEL, messages: historico });
  } catch (erro) {
    // 429 (fila do free tier) e afins: informa, desfaz o turno e segue o chat.
    console.error(`erro de API: ${erro.message} — espere alguns segundos e tente de novo\n`);
    historico.pop();
    continue;
  }
  const msg = resposta.choices[0].message;

  // Sem este push, na próxima chamada o modelo não veria a própria resposta.
  historico.push(msg);

  console.log(`\nmodelo> ${msg.content}`);
  console.log(`(mensagens no histórico: ${historico.length} | prompt_tokens: ${resposta.usage.prompt_tokens} — repare que cresce a cada turno)\n`);
}

rl.close();
