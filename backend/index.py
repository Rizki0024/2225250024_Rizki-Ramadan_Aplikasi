"""Titik masuk untuk Vercel (Python serverless). Vercel mencari objek `app` di file ini.

Untuk menjalankan lokal tetap gunakan: uvicorn app.main:app --reload
"""
from app.main import app  # noqa: F401
