import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from services.db_service import db
from routes import user_routes, place_routes, trip_routes

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await db.connect_to_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    await db.close_database_connection()

app.include_router(user_routes.router, prefix="/api", tags=["Users"])
app.include_router(place_routes.router, prefix="/api", tags=["Places"])
app.include_router(trip_routes.router, prefix="/api", tags=["Trips"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Long Line Backend", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
