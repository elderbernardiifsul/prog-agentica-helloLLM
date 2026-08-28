# Degrau 04 (espelho Python) — tool calling: o modelo PEDE; seu código executa.
# OBJETIVO: um ciclo completo à mão, sem loop — contrato (schema), pedido
#   (tool_calls), dispatch e resposta final.
# COMO RODAR: python3 04_tool_calling.py
# O QUE OBSERVAR: as quatro mensagens do ciclo no histórico — user, assistant
#   com tool_calls, tool com tool_call_id, e o assistant final.
import json
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv("../.env")

client = OpenAI(
    api_key=os.environ.get("LLM_API_KEY"),
    base_url=os.environ.get("LLM_BASE_URL", "https://openrouter.ai/api/v1"),
)
MODEL = os.environ.get("LLM_MODEL", "openrouter/free")

# 1) O CONTRATO: schema JSON. O modelo só vê isto.
tools = [
    {
        "type": "function",
        "function": {
            "name": "somar",
            "description": "Soma dois números com precisão exata.",
            "parameters": {
                "type": "object",
                "properties": {"a": {"type": "number"}, "b": {"type": "number"}},
                "required": ["a", "b"],
            },
        },
    }
]


# 2) A IMPLEMENTAÇÃO: só existe no SEU runtime.
def somar(a, b):
    return a + b


messages = [{"role": "user", "content": "Quanto é 123456 + 654321? Use a ferramenta somar."}]

# 3) PRIMEIRA CHAMADA: o modelo decide usar a tool.
r1 = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
msg = r1.choices[0].message

print("== O MODELO PEDIU ==")
print("finish_reason:", r1.choices[0].finish_reason)  # "tool_calls"
print(msg.tool_calls)

messages.append(msg)  # o pedido de tool também entra no histórico

# 4) DISPATCH: seu código interpreta o pedido e executa a função.
for call in msg.tool_calls:
    argumentos = json.loads(call.function.arguments)  # chega como STRING — sempre parsear/validar
    resultado = somar(**argumentos)
    print(f"\n== EU EXECUTEI == somar({argumentos['a']}, {argumentos['b']}) = {resultado}")

    # 5) O RESULTADO volta como mensagem de role "tool", amarrada pelo id.
    messages.append({"role": "tool", "tool_call_id": call.id, "content": str(resultado)})

# 6) SEGUNDA CHAMADA: o modelo lê o resultado e responde ao usuário.
r2 = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
print("\n== RESPOSTA FINAL ==")
print(r2.choices[0].message.content)
