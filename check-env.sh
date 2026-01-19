#!/bin/bash
# Quick script to check .env file on EC2

echo "🔍 Checking .env file on EC2..."
echo ""

ssh -i ~/new-aws-key ec2-user@13.36.244.170 << 'ENDSSH'
  echo "📂 Current directory:"
  pwd
  
  echo ""
  echo "📁 Checking if grocery_app exists:"
  ls -ld ~/grocery_app 2>/dev/null || echo "❌ grocery_app directory not found"
  
  echo ""
  echo "📄 Checking if .env file exists:"
  ls -lh ~/grocery_app/grocery_backend/.env 2>/dev/null || echo "❌ .env file not found"
  
  echo ""
  echo "📝 .env file contents (if exists):"
  if [ -f ~/grocery_app/grocery_backend/.env ]; then
    echo "✅ File exists! Contents:"
    cat ~/grocery_app/grocery_backend/.env
  else
    echo "❌ File does not exist"
  fi
  
  echo ""
  echo "🐳 Docker container status:"
  sudo docker-compose -f ~/grocery_app/docker-compose.yml ps
  
  echo ""
  echo "📋 Recent backend logs:"
  sudo docker-compose -f ~/grocery_app/docker-compose.yml logs --tail=20 backend
ENDSSH

echo ""
echo "✅ Check complete!"
