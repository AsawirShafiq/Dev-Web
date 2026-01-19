#!/bin/bash
# Script to create .env file on EC2 manually

echo "📝 Creating .env file on EC2 server..."
echo ""
echo "⚠️  IMPORTANT: Edit the values below before running!"
echo ""

# ==============================================
# ⬇️ EDIT THESE VALUES ⬇️
# ==============================================

# Your MongoDB Atlas connection string
MONGODB_URL="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/grocery_db"

# Your generated SECRET_KEY (run: python3 -c "import secrets; print(secrets.token_urlsafe(32))")
SECRET_KEY="YOUR_GENERATED_SECRET_KEY_HERE"

# Your EC2 IP address
EC2_IP="13.36.244.170"

# ==============================================
# ⬆️ EDIT THESE VALUES ⬆️
# ==============================================

# Non-sensitive defaults (usually don't need to change)
DATABASE_NAME="grocery_db"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES="30"
DEBUG="False"
ALLOWED_ORIGINS="http://localhost:5173,http://${EC2_IP}:5173"
HOST="0.0.0.0"
PORT="8000"

# Check if values were edited
if [[ "$MONGODB_URL" == *"YOUR_USERNAME"* ]]; then
    echo "❌ ERROR: Please edit MONGODB_URL in this script first!"
    exit 1
fi

if [[ "$SECRET_KEY" == *"YOUR_GENERATED"* ]]; then
    echo "❌ ERROR: Please edit SECRET_KEY in this script first!"
    echo "💡 Generate one with: python3 -c \"import secrets; print(secrets.token_urlsafe(32))\""
    exit 1
fi

# Create .env on EC2
echo "🚀 Creating .env file on EC2..."

ssh -i ~/new-aws-key ec2-user@${EC2_IP} << EOF
  # Create directory if it doesn't exist
  mkdir -p ~/grocery_app/grocery_backend
  
  # Create .env file
  cat > ~/grocery_app/grocery_backend/.env << 'ENVEOF'
MONGODB_URL=${MONGODB_URL}
DATABASE_NAME=${DATABASE_NAME}
SECRET_KEY=${SECRET_KEY}
ALGORITHM=${ALGORITHM}
ACCESS_TOKEN_EXPIRE_MINUTES=${ACCESS_TOKEN_EXPIRE_MINUTES}
DEBUG=${DEBUG}
ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
HOST=${HOST}
PORT=${PORT}
ENVEOF

  # Set permissions
  chmod 644 ~/grocery_app/grocery_backend/.env
  
  echo "✅ .env file created successfully!"
  echo ""
  echo "📄 File contents (sanitized):"
  cat ~/grocery_app/grocery_backend/.env | sed 's/SECRET_KEY=.*/SECRET_KEY=***HIDDEN***/' | sed 's/MONGODB_URL=.*/MONGODB_URL=***HIDDEN***/'
  
  echo ""
  echo "📊 File info:"
  ls -lh ~/grocery_app/grocery_backend/.env
EOF

echo ""
echo "✅ Done! Now restart your containers:"
echo "ssh -i ~/new-aws-key ec2-user@${EC2_IP}"
echo "cd ~/grocery_app"
echo "sudo docker-compose down"
echo "sudo docker-compose up -d --build"
