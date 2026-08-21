# Degrau 06 (espelho Python, núcleo RESOLVIDO) — agente de arquivos.
# ATENÇÃO: este arquivo é referência de ESTRUTURA. Copiá-lo não cumpre a
# atividade EaD — as extensões (gate HITL + tool nova de autoria própria)
# são suas. Enunciado: docs/atividade-ead-agente-arquivos.md
# Rode: python3 06_agente_arquivos.py  (depois: cd .. && npm run verificar)
import json
import os
import subprocess
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv("../.env")

client = OpenAI(
    api_key=os.environ.get("GEMINI_API_KEY"),
    base_url=os.environ.get("LLM_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai"),
)
MODEL = os.environ.get("LLM_MODEL", "gemini-2.5-flash")
MAX_PASSOS = 15

# ---- Tools (mesma sandbox do tools.mjs: tudo dentro de ../workspace) ----
RAIZ = (Path(__file__).parent / ".." / "workspace").resolve()


def dentro_da_sandbox(relativo):
    absoluto = (RAIZ / relativo).resolve()
    if absoluto != RAIZ and not absoluto.is_relative_to(RAIZ):
        raise ValueError(f"caminho fora da sandbox: {relativo}")
    return absoluto


def listar(caminho):
    itens = sorted(dentro_da_sandbox(caminho).iterdir())
    return "\n".join(i.name + "/" if i.is_dir() else i.name for i in itens) or "(vazio)"


def ler(caminho):
    return dentro_da_sandbox(caminho).read_text(encoding="utf-8")


def escrever(caminho, conteudo):
    alvo = dentro_da_sandbox(caminho)
    alvo.parent.mkdir(parents=True, exist_ok=True)
    alvo.write_text(conteudo, encoding="utf-8")
    return f"ok: {caminho} ({len(conteudo)} caracteres)"


def executar(comando):
    # Roda comandos reais (cwd = sandbox). O cwd é convenção, não isolamento:
    # na sua versão com HITL, o gate antes desta ferramenta é obrigatório.
    RAIZ.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(comando, shell=True, cwd=RAIZ, capture_output=True, text=True, timeout=60)
    partes = [r.stdout.strip()]
    if r.stderr.strip():
        partes.append(f"[stderr] {r.stderr.strip()}")
    return "\n".join(p for p in partes if p) or "(sem saída)"


executores = {"listar": listar, "ler": ler, "escrever": escrever, "executar": executar}

defs = [
    {
        "type": "function",
        "function": {
            "name": "listar",
            "description": "Lista arquivos e pastas de um diretório dentro da sandbox.",
            "parameters": {
                "type": "object",
                "properties": {"caminho": {"type": "string", "description": "relativo à sandbox, ex.: '.' ou 'src'"}},
                "required": ["caminho"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "ler",
            "description": "Lê o conteúdo de um arquivo de texto da sandbox.",
            "parameters": {
                "type": "object",
                "properties": {"caminho": {"type": "string"}},
                "required": ["caminho"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "escrever",
            "description": "Cria ou sobrescreve um arquivo com o conteúdo dado. Cria pastas necessárias.",
            "parameters": {
                "type": "object",
                "properties": {"caminho": {"type": "string"}, "conteudo": {"type": "string"}},
                "required": ["caminho", "conteudo"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "executar",
            "description": "Executa um comando de shell com diretório de trabalho na sandbox. "
            "Use para instalar dependências (npm install) e rodar scripts (node hello.mjs). "
            "Retorna stdout e stderr.",
            "parameters": {
                "type": "object",
                "properties": {"comando": {"type": "string"}},
                "required": ["comando"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "finalizar",
            "description": "Declare a missão concluída, com um resumo do que foi feito. "
            "Só chame quando TODOS os critérios da missão estiverem prontos.",
            "parameters": {
                "type": "object",
                "properties": {"resumo": {"type": "string"}},
                "required": ["resumo"],
            },
        },
    },
]

# ---- O loop ----
missao = (Path(__file__).parent / ".." / "06-agente-arquivos" / "missao.md").read_text(encoding="utf-8")

messages = [
    {
        "role": "system",
        "content": "Você é um agente que cumpre missões numa sandbox de arquivos, usando "
        "as tools listar, ler, escrever, executar e finalizar. Trabalhe passo a passo "
        "e colete evidências do que fizer. Chame finalizar SOMENTE quando os critérios "
        "obrigatórios da missão estiverem prontos.",
    },
    {"role": "user", "content": missao},
]

estado_final = None  # "sucesso" | "limite" | "erro"
passo = 0

while estado_final is None:
    passo += 1
    if passo > MAX_PASSOS:
        estado_final = "limite"
        break

    try:
        resposta = client.chat.completions.create(model=MODEL, messages=messages, tools=defs)
    except Exception as erro:
        print(f"[passo {passo}] erro de API: {erro}")
        estado_final = "erro"
        break

    msg = resposta.choices[0].message
    messages.append(msg)

    if not msg.tool_calls:
        print(f"[passo {passo}] modelo disse: {msg.content}")
        messages.append({"role": "user", "content": "Continue a missão usando as tools."})
        continue

    for call in msg.tool_calls:
        nome = call.function.name
        argumentos = json.loads(call.function.arguments)

        if nome == "finalizar":
            print(f"[passo {passo}] finalizar: {argumentos['resumo']}")
            messages.append({"role": "tool", "tool_call_id": call.id, "content": "ok"})
            estado_final = "sucesso"
            continue

        try:
            resultado = executores[nome](**argumentos)
            print(f"[passo {passo}] {nome}({json.dumps(argumentos, ensure_ascii=False)[:60]}) -> {str(resultado)[:60]}")
            messages.append({"role": "tool", "tool_call_id": call.id, "content": str(resultado)})
        except Exception as erro:
            # Tool que falha NÃO derruba o agente: o erro vira observação.
            print(f"[passo {passo}] {nome} FALHOU: {erro}")
            messages.append({"role": "tool", "tool_call_id": call.id, "content": f"ERRO: {erro}"})

print(f"\n== FIM: {estado_final} em {passo} passo(s) ==")
print("Agora rode: cd .. && npm run verificar")
