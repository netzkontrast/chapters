import os
import sys

# Add the parent directory to sys.path so we can import 'app'
# This assumes this file is at /backend/api/index.py and the app is at /backend/app
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from app.main import app

# This is the Vercel serverless function entry point
# Vercel looks for a variable named 'app' or 'handler'
# Since we imported 'app', we are good.
