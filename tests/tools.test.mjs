import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { defs, executores } from "../06-agente-arquivos/tools.mjs";

test("defs declara as 5 tools", () => {
  const nomes = defs.map((d) => d.function.name).sort();
  assert.deepEqual(nomes, ["escrever", "executar", "finalizar", "ler", "listar"]);
});

test("executar roda comando com cwd na sandbox", async () => {
  const saida = await executores.executar({ comando: "pwd && echo ola" });
  assert.match(saida, /workspace/);
  assert.match(saida, /ola/);
});

test("escreve e lê dentro da sandbox", async () => {
  await executores.escrever({ caminho: "teste/ola.txt", conteudo: "olá" });
  assert.equal(await executores.ler({ caminho: "teste/ola.txt" }), "olá");
  assert.match(await executores.listar({ caminho: "teste" }), /ola\.txt/);
  await fs.rm("workspace/teste", { recursive: true, force: true });
});

test("bloqueia path traversal", async () => {
  await assert.rejects(() => executores.ler({ caminho: "../fora.txt" }), /fora da sandbox/);
  await assert.rejects(
    () => executores.escrever({ caminho: "/etc/passwd", conteudo: "x" }),
    /fora da sandbox/
  );
});
