from fastapi import FastAPI
from app.routers import observations

app = FastAPI(title="Observacion Maritima API")
app.include_router(observations.router)

@app.get("/health")
def health():
    return {"status":"ok"}

