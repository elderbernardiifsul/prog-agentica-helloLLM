// Ferramentas do agente de arquivos.
// SANDBOX: todo caminho é resolvido dentro de ./workspace — o agente não
// consegue ler nem escrever fora dela (menor privilégio, aula 02).
// ATENÇÃO: `executar` roda comandos de verdade (cwd = workspace). O cwd é
// convenção, NÃO isolamento real — por isso o gate HITL antes de executar
// é obrigatório no loop do agente.
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";

const execAsync = promisify(exec);

const RAIZ = path.resolve("workspace");

function dentroDaSandbox(relativo) {
  const absoluto = path.resolve(RAIZ, relativo);
  if (absoluto !== RAIZ && !absoluto.startsWith(RAIZ + path.sep)) {
    throw new Error(`caminho fora da sandbox: ${relativo}`);
  }
  return absoluto;
}

export const defs = [
  {
    type: "function",
    function: {
      name: "listar",
      description: "Lista arquivos e pastas de um diretório dentro da sandbox.",
      parameters: {
        type: "object",
        properties: { caminho: { type: "string", description: "relativo à sandbox, ex.: '.' ou 'src'" } },
        required: ["caminho"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "ler",
      description: "Lê o conteúdo de um arquivo de texto da sandbox.",
      parameters: {
        type: "object",
        properties: { caminho: { type: "string" } },
        required: ["caminho"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "escrever",
      description: "Cria ou sobrescreve um arquivo com o conteúdo dado. Cria pastas necessárias.",
      parameters: {
        type: "object",
        properties: { caminho: { type: "string" }, conteudo: { type: "string" } },
        required: ["caminho", "conteudo"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "executar",
      description:
        "Executa um comando de shell com diretório de trabalho na sandbox. " +
        "Use para instalar dependências (npm install) e rodar scripts " +
        "(node hello.mjs). Retorna stdout e stderr.",
      parameters: {
        type: "object",
        properties: { comando: { type: "string" } },
        required: ["comando"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "finalizar",
      description:
        "Declare a missão concluída, com um resumo do que foi feito. " +
        "Só chame quando TODOS os critérios da missão estiverem prontos.",
      parameters: {
        type: "object",
        properties: { resumo: { type: "string" } },
        required: ["resumo"],
      },
    },
  },
];

export const executores = {
  async listar({ caminho }) {
    const itens = await fs.readdir(dentroDaSandbox(caminho), { withFileTypes: true });
    return itens.map((i) => (i.isDirectory() ? i.name + "/" : i.name)).join("\n") || "(vazio)";
  },
  async ler({ caminho }) {
    return await fs.readFile(dentroDaSandbox(caminho), "utf8");
  },
  async escrever({ caminho, conteudo }) {
    const alvo = dentroDaSandbox(caminho);
    await fs.mkdir(path.dirname(alvo), { recursive: true });
    await fs.writeFile(alvo, conteudo);
    return `ok: ${caminho} (${conteudo.length} caracteres)`;
  },
  async executar({ comando }) {
    await fs.mkdir(RAIZ, { recursive: true });
    const { stdout, stderr } = await execAsync(comando, { cwd: RAIZ, timeout: 60_000 });
    const saida = [stdout.trim(), stderr.trim() && `[stderr] ${stderr.trim()}`]
      .filter(Boolean)
      .join("\n");
    return saida || "(sem saída)";
  },
  // "finalizar" não tem executor: é tratada pelo loop do agente (encerra).
};
