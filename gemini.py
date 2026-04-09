#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Prosty klient CLI do Gemini.
Użycie:
  gemini "Twoje pytanie"
  gemini "Twoje pytanie" --context plik.md
  gemini "Twoje pytanie" --context plik1.md plik2.md
  gemini                              # tryb interaktywny
  gemini --context plik.md            # tryb interaktywny z kontekstem
"""

import sys
import os
import io
import argparse
from pathlib import Path

# Fix UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stdin  = io.TextIOWrapper(sys.stdin.buffer,  encoding="utf-8", errors="replace")

from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyA8Z9pQEHJz_kjMCCi_0LsoBkMO1ahAvgs")
MODEL = "models/gemini-3.1-pro-preview"

client = genai.Client(api_key=API_KEY)


def load_context(paths: list[str]) -> str:
    parts = []
    for p in paths:
        path = Path(p)
        if not path.exists():
            print(f"[ostrzeżenie] Nie znaleziono pliku: {p}", file=sys.stderr)
            continue
        content = path.read_text(encoding="utf-8", errors="replace")
        parts.append(f"=== Kontekst: {p} ===\n{content}")
    return "\n\n".join(parts)


def build_prompt(question: str, context: str) -> str:
    if context:
        return f"{context}\n\n=== Pytanie ===\n{question}"
    return question


def ask(question: str, context: str = "") -> None:
    prompt = build_prompt(question, context)
    response = client.models.generate_content(model=MODEL, contents=prompt)
    print(response.text)


def interactive(context: str = "") -> None:
    if context:
        files = ", ".join(args.context)
        print(f"Gemini ({MODEL}) | kontekst: {files}")
    else:
        print(f"Gemini ({MODEL})")
    print("Wpisz pytanie, Ctrl+C/Ctrl+D żeby wyjść\n")
    while True:
        try:
            question = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not question:
            continue
        ask(question, context)
        print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("question", nargs="*", help="Pytanie do Gemini")
    parser.add_argument("--context", "-c", nargs="+", metavar="PLIK", help="Pliki dołączone jako kontekst")

    args = parser.parse_args()

    context = load_context(args.context) if args.context else ""
    question = " ".join(args.question).strip()

    if question:
        ask(question, context)
    else:
        interactive(context)
