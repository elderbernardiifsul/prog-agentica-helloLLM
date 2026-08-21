// Degrau 04 — tool calling: o modelo NÃO executa nada. Ele PEDE; SEU código executa.
// Aqui fazemos UM ciclo completo, à mão, sem loop — para ver cada peça.
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.LLM_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai",
});
const MODEL = process.env.LLM_MODEL ?? "gemini-2.5-flash";

// 1) O CONTRATO: a tool é declarada por um schema JSON. O modelo só vê isto.
const tools = [
  {
    type: "function",
    function: {
      name: "somar",
      description: "Soma dois números com precisão exata.",
      parameters: {
        type: "object",
        properties: {
          a: { type: "number" },
          b: { type: "number" },
        },
        required: ["a", "b"],
      },
    },
  },
];

// 2) A IMPLEMENTAÇÃO: só existe no SEU runtime.
function somar({ a, b }) {
  return a + b;
}

const messages = [
  { role: "user", content: "Quanto é 123456 + 654321? Use a ferramenta somar." },
];

// 3) PRIMEIRA CHAMADA: o modelo decide usar a tool.
const r1 = await client.chat.completions.create({ model: MODEL, messages, tools });
const msg = r1.choices[0].message;

console.log("== O MODELO PEDIU ==");
console.log("finish_reason:", r1.choices[0].finish_reason); // "tool_calls"
console.log(JSON.stringify(msg.tool_calls, null, 2));

messages.push(msg); // o pedido de tool também entra no histórico

// 4) DISPATCH: seu código interpreta o pedido e executa a função.
for (const call of msg.tool_calls) {
  const argumentos = JSON.parse(call.function.arguments); // chega como STRING — sempre parsear/validar
  const resultado = somar(argumentos);
  console.log(`\n== EU EXECUTEI == somar(${argumentos.a}, ${argumentos.b}) = ${resultado}`);

  // 5) O RESULTADO volta como mensagem de role "tool", amarrada pelo id.
  messages.push({
    role: "tool",
    tool_call_id: call.id,
    content: String(resultado),
  });
}

// 6) SEGUNDA CHAMADA: o modelo lê o resultado e responde ao usuário.
const r2 = await client.chat.completions.create({ model: MODEL, messages, tools });
console.log("\n== RESPOSTA FINAL ==");
console.log(r2.choices[0].message.content);
