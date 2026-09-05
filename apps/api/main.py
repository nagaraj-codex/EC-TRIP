from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import recommendations

app = FastAPI(
    title="QueueCut Intelligence API",
    description="Mathematical intelligence and optimization for theme park decisions.",
    version="1.0.0"
)

# CORS configuration for Frontend (React/Vite on Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(recommendations.router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "QueueCut API"}
