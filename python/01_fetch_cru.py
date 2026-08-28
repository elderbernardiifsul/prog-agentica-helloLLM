# Degrau 01 (espelho Python) — o wire format: uma API de LLM é só HTTP + JSON.
# OBJETIVO: ver a requisição e a resposta cruas, sem SDK.
# COMO RODAR: python3 01_fetch_cru.py
# O QUE OBSERVAR: o JSON completo da resposta; content, finish_reason e usage.
import json
import os
import sys

import requests
from dotenv import load_dotenv

load_dotenv("../.env")

BASE_URL = os.environ.get("LLM_BASE_URL", "https://openrouter.ai/api/v1")
MODEL = os.environ.get("LLM_MODEL", "openrouter/free")
API_KEY = os.environ.get("LLM_API_KEY")

if not API_KEY:
    print("Defina LLM_API_KEY no ../.env (copie de ../.env.example)", file=sys.stderr)
    sys.exit(1)

corpo = {
    "model": MODEL,
    "messages": [
        {"role": "system", "content": "Você é um assistente conciso. Responda em uma frase, em pt-BR."},
        {"role": "user", "content": "O que é uma janela de contexto?"},
    ],
}

resposta = requests.post(
    f"{BASE_URL}/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json=corpo,
    timeout=60,
)
resposta.raise_for_status()
dados = resposta.json()

print("== RESPOSTA CRUA (é só JSON) ==")
print(json.dumps(dados, indent=2, ensure_ascii=False))

print("\n== OS TRÊS CAMPOS QUE IMPORTAM ==")
print("content       :", dados["choices"][0]["message"]["content"])
print("finish_reason :", dados["choices"][0]["finish_reason"])
print("usage         :", dados["usage"])
