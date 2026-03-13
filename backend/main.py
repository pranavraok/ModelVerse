import os
from pathlib import Path

from fastapi import FastAPI
from dotenv import load_dotenv
from supabase import Client, create_client

app = FastAPI()

# Load .env from the backend folder (works reliably in Windows PowerShell).
env_path = Path(__file__).resolve().parent / ".env"
loaded = load_dotenv(dotenv_path=env_path)

print("[DEBUG] dotenv path:", str(env_path))
print("[DEBUG] dotenv exists:", env_path.exists())
print("[DEBUG] dotenv loaded:", loaded)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

print("[DEBUG] SUPABASE_URL:", url if url else "MISSING")
print("[DEBUG] SUPABASE_SERVICE_KEY:", (key[:20] + "...") if key else "MISSING")

missing = []
if not url:
    missing.append("SUPABASE_URL")
if not key:
    missing.append("SUPABASE_SERVICE_KEY")

if missing:
    raise RuntimeError(
        "Missing required environment variables: "
        + ", ".join(missing)
        + ". Ensure backend/.env exists and contains these keys."
    )

supabase: Client = create_client(url, key)

@app.get("/health")
def health():
    return {"status": "ok"}
