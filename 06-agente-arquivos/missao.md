# Missão do agente

Monte, dentro da sandbox, o esqueleto de um pacote Node chamado `workspace-demo`:

1. `package.json` válido com `"name": "workspace-demo"`, um campo `scripts.test`
   (qualquer comando serve) e `picocolors` declarado em `dependencies`.
2. `README.md` contendo uma seção `## Como usar` com pelo menos uma frase.
3. `src/index.mjs` exportando uma função `saudacao(nome)` que retorna
   exatamente `Olá, ${nome}!` (ex.: `saudacao("Ana")` → `"Olá, Ana!"`).
4. Dependências instaladas: use a tool `executar` para rodar `npm install`
   (a pasta `node_modules/` deve existir ao final).
5. (Desejável) `hello.mjs` na raiz da sandbox que imprime exatamente
   `Hello Agent!`. Execute-o com a tool `executar` e registre a saída como
   evidência de que funciona.

Quando os itens obrigatórios estiverem prontos, chame a tool `finalizar` com
um resumo do que foi feito e das evidências obtidas.
