// Verificação objetiva da missão. Rode: npm run verificar
// Exit code 0 = missão cumprida; 1 = há critérios falhando.
import fs from "node:fs/promises";
import path from "node:path";

let falhas = 0;
async function checar(nome, fn) {
  try {
    await fn();
    console.log("PASS", nome);
  } catch (erro) {
    falhas++;
    console.log("FAIL", nome, "->", erro.message);
  }
}

await checar("package.json válido com name e scripts.test", async () => {
  const pkg = JSON.parse(await fs.readFile("workspace/package.json", "utf8"));
  if (pkg.name !== "workspace-demo") throw new Error(`name é "${pkg.name}"`);
  if (!pkg.scripts?.test) throw new Error("falta scripts.test");
});

await checar("README.md com seção '## Como usar'", async () => {
  const md = await fs.readFile("workspace/README.md", "utf8");
  if (!md.includes("## Como usar")) throw new Error("seção ausente");
});

await checar("src/index.mjs exporta saudacao() correta", async () => {
  const url = path.resolve("workspace/src/index.mjs");
  const mod = await import(`file://${url}?v=${Date.now()}`);
  if (typeof mod.saudacao !== "function") throw new Error("saudacao não exportada");
  const r = mod.saudacao("Ana");
  if (r !== "Olá, Ana!") throw new Error(`saudacao("Ana") retornou ${JSON.stringify(r)}`);
});

console.log(falhas === 0 ? "\nMISSÃO CUMPRIDA ✅" : `\n${falhas} critério(s) falhando ❌`);
process.exit(falhas === 0 ? 0 : 1);
