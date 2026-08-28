// Degrau 02b — o OUTRO padrão da indústria: a API Messages da Anthropic.
// OBJETIVO: contrastar os dois padrões dominantes de API de LLM. Este degrau
//   é LEITURA DE CÓDIGO (execução opcional, exige ANTHROPIC_API_KEY).
// COMO RODAR (opcional): npm run 02b
// O QUE OBSERVAR: as sete diferenças abaixo — localize cada uma no código.
//
// Diferenças-chave em relação ao chat completions (degrau 02):
//   1. Endpoint POST /v1/messages; auth via header "x-api-key" (o SDK cuida).
//   2. `system` é parâmetro próprio — fica FORA do array messages.
//   3. `max_tokens` é OBRIGATÓRIO.
//   4. A resposta traz `content` como LISTA DE BLOCOS: {type:"text"...},
//      {type:"tool_use"...} — não uma string única.
//   5. Tool use: o modelo emite bloco `tool_use` (stop_reason: "tool_use");
//      o resultado volta como bloco `tool_result` DENTRO de uma mensagem
//      de role "user" (não existe role "tool").
//   6. Tools declaram `input_schema` direto (sem o envelope {type:"function",
//      function:{...}} do padrão OpenAI).
//   7. usage usa input_tokens / output_tokens.
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  console.log("Sem ANTHROPIC_API_KEY — tudo bem: este degrau é leitura de código.");
  console.log("Compare os comentários acima com o shape do degrau 02.");
  process.exit(0);
}

const client = new Anthropic(); // lê ANTHROPIC_API_KEY do ambiente

const resposta = await client.messages.create({
  model: "claude-opus-5",
  max_tokens: 300, // obrigatório!
  system: "Você é um assistente conciso. Responda em uma frase, em pt-BR.",
  messages: [{ role: "user", content: "O que é tool use?" }],
});

console.log("content (lista de blocos):", JSON.stringify(resposta.content, null, 2));
console.log("stop_reason:", resposta.stop_reason);
console.log("usage      :", resposta.usage); // input_tokens / output_tokens
