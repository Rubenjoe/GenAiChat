from fastapi import FastAPI
from fastapi.responses import FileResponse
from pathlib import Path

from backend.main import app as backend_app

index_path = Path(__file__).resolve().parent / "index.html"

app = FastAPI(title="Celcia AI (local dev)")


@app.get("/")
async def serve_frontend():
    return FileResponse(str(index_path))


app.mount("/api", backend_app)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
