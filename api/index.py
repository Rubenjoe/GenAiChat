"""
Vercel entry point for Celcia AI FastAPI application
"""
import sys
from pathlib import Path

# Add backend directory to Python path for imports
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

# Import the FastAPI app from backend/main.py
from main import app

# Vercel will use this 'app' object for serverless deployment
# The FastAPI app is already configured with all routes