#!/bin/bash
# Test script to verify .env creation on EC2

echo "🧪 Testing .env file creation..."

# Simulate environment variables (you'll need to replace these with real values)
export MONGODB_URL="mongodb+srv://test:test@cluster.mongodb.net/grocery_db"
export DATABASE_NAME="grocery_db"
export SECRET_KEY="test-secret-key-32-characters-long"
export ALLOWED_ORIGINS="http://localhost:5173,http://13.36.244.170:5173"
export DEBUG="False"
export ALGORITHM="HS256"
export ACCESS_TOKEN_EXPIRE_MINUTES="30"
export HOST="0.0.0.0"
export PORT="8000"

# Create directory
mkdir -p grocery_backend

# Create .env file (same method as pipeline)
echo "MONGODB_URL=${MONGODB_URL}" > grocery_backend/.env
echo "DATABASE_NAME=${DATABASE_NAME}" >> grocery_backend/.env
echo "SECRET_KEY=${SECRET_KEY}" >> grocery_backend/.env
echo "ALGORITHM=${ALGORITHM}" >> grocery_backend/.env
echo "ACCESS_TOKEN_EXPIRE_MINUTES=${ACCESS_TOKEN_EXPIRE_MINUTES}" >> grocery_backend/.env
echo "DEBUG=${DEBUG}" >> grocery_backend/.env
echo "ALLOWED_ORIGINS=${ALLOWED_ORIGINS}" >> grocery_backend/.env
echo "HOST=${HOST}" >> grocery_backend/.env
echo "PORT=${PORT}" >> grocery_backend/.env

chmod 644 grocery_backend/.env

echo "✅ .env file created!"
echo ""
echo "📄 Contents:"
cat grocery_backend/.env
echo ""
echo "📊 File info:"
ls -lh grocery_backend/.env
