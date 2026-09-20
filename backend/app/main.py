from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import observations
from app.routers import species

app = FastAPI(title="Observacion Maritima Api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://observacion-maritima.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(observations.router)
app.include_router(species.router)

@app.get("/health")
def health():
    return {"status":"ok"}

