# Degrau 05 (espelho Python, RESOLVIDO) — o primeiro agente em loop.
# O mini-lab presencial é em Node; este espelho serve de consulta pós-lab.
# Rode: python3 05_loop_jogo.py
import json
import os
import random

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv("../.env")

client = OpenAI(
    api_key=os.environ.get("GEMINI_API_KEY"),
    base_url=os.environ.get("LLM_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai"),
)
MODEL = os.environ.get("LLM_MODEL", "gemini-2.5-flash")

SECRETO = random.randint(1, 100)
MAX_PASSOS = 10

tools = [
    {
        "type": "function",
        "function": {
            "name": "chutar",
            "description": "Chuta um número. Retorna 'maior' (o secreto é maior), 'menor' ou 'acertou'.",
            "parameters": {
                "type": "object",
                "properties": {"numero": {"type": "integer", "minimum": 1, "maximum": 100}},
                "required": ["numero"],
            },
        },
    }
]


def chutar(numero):
    if numero == SECRETO:
        return "acertou"
    return "maior" if numero < SECRETO else "menor"


messages = [
    {
        "role": "system",
        "content": "Você é um agente que precisa adivinhar um número secreto entre 1 e 100 "
        "usando a tool chutar. Use busca binária. Chute UM número por vez.",
    },
    {"role": "user", "content": "Descubra o número secreto."},
]

estado_final = None  # "sucesso" | "limite" | "erro"
passo = 0

while estado_final is None:
    passo += 1

    if passo > MAX_PASSOS:  # parada por LIMITE
        estado_final = "limite"
        break

    try:
        resposta = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
    except Exception as erro:  # parada por ERRO
        print(f"[passo {passo}] erro de API: {erro}")
        estado_final = "erro"
        break

    msg = resposta.choices[0].message
    messages.append(msg)

    if not msg.tool_calls:
        # O modelo conversou em vez de agir — trace e segue o loop.
        print(f"[passo {passo}] modelo disse: {msg.content}")
        messages.append({"role": "user", "content": "Continue: use a tool chutar."})
        continue

    for call in msg.tool_calls:
        argumentos = json.loads(call.function.arguments)
        resultado = chutar(argumentos["numero"])
        print(f"[passo {passo}] chute {argumentos['numero']} -> {resultado}")

        messages.append({"role": "tool", "tool_call_id": call.id, "content": resultado})

        if resultado == "acertou":  # parada por SUCESSO
            estado_final = "sucesso"

print(f"\n== FIM: {estado_final} em {passo} passo(s) (secreto era {SECRETO}) ==")
