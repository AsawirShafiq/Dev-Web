# Manual .env Creation Guide

## Option 1: Direct SSH Method (Recommended)

1. First, generate your SECRET_KEY:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```
Copy the output.

2. SSH to your EC2 server:
```bash
ssh -i ~/new-aws-key ec2-user@13.36.244.170
```

3. Create the directory:
```bash
mkdir -p ~/grocery_app/grocery_backend
```

4. Create the .env file (copy this entire block and paste):
```bash
cat > ~/grocery_app/grocery_backend/.env << 'EOF'
MONGODB_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/grocery_db
DATABASE_NAME=grocery_db
SECRET_KEY=YOUR_GENERATED_SECRET_KEY_HERE
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=False
ALLOWED_ORIGINS=http://localhost:5173,http://13.36.244.170:5173
HOST=0.0.0.0
PORT=8000
EOF
```

5. Edit the file to replace placeholders:
```bash
nano ~/grocery_app/grocery_backend/.env
```

Replace:
- `YOUR_USERNAME` → Your MongoDB username
- `YOUR_PASSWORD` → Your MongoDB password
- `YOUR_CLUSTER` → Your MongoDB cluster address
- `YOUR_GENERATED_SECRET_KEY_HERE` → Output from step 1
- `13.36.244.170` → Your actual EC2 IP (if different)

Press `Ctrl+X`, then `Y`, then `Enter` to save.

6. Set correct permissions:
```bash
chmod 644 ~/grocery_app/grocery_backend/.env
```

7. Verify the file:
```bash
cat ~/grocery_app/grocery_backend/.env
```

8. Restart Docker containers:
```bash
cd ~/grocery_app
sudo docker-compose down
sudo docker-compose up -d --build
sudo docker-compose logs -f backend
```

---

## Option 2: Using the Automated Script

1. Generate SECRET_KEY:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

2. Edit the script:
```bash
cd /home/huzaifa/Desktop/Dev-Web
nano create-env-manual.sh
```

Edit these lines:
- Line 13: Replace `MONGODB_URL` with your MongoDB connection string
- Line 16: Replace `SECRET_KEY` with the generated key from step 1
- Line 19: Replace `EC2_IP` if different

3. Make it executable and run:
```bash
chmod +x create-env-manual.sh
./create-env-manual.sh
```

---

## Quick Copy-Paste Values

### For MongoDB Atlas:

**Connection String Format:**
```
mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://groceryuser:MyP@ssw0rd123@cluster0.abc123.mongodb.net/grocery_db?retryWrites=true&w=majority
```

### For SECRET_KEY:

Run this command and copy the output:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Example output (yours will be different):
```
kX7vK9mNpQ2wRtL5sH8jD3fG6bV1cZ4yE0uI9oP7aS8
```

---

## Verification Checklist

After creating .env:

✅ Check file exists:
```bash
ls -lh ~/grocery_app/grocery_backend/.env
```

✅ Check contents (secrets will be visible):
```bash
cat ~/grocery_app/grocery_backend/.env
```

✅ Check containers:
```bash
sudo docker-compose -f ~/grocery_app/docker-compose.yml ps
```

✅ Check backend logs:
```bash
sudo docker-compose -f ~/grocery_app/docker-compose.yml logs backend
```

✅ Test API:
```bash
curl http://localhost:8000/docs
```

---

## Troubleshooting

### Issue: "No such file or directory"
**Solution:** Make sure you're in the correct directory:
```bash
cd ~/grocery_app
pwd  # Should show: /home/ec2-user/grocery_app
```

### Issue: "Permission denied"
**Solution:** Fix permissions:
```bash
chmod 644 ~/grocery_app/grocery_backend/.env
```

### Issue: "Failed to connect to MongoDB"
**Solution:** Check your MONGODB_URL is correct and your MongoDB Atlas allows connections from your EC2 IP.

### Issue: Docker container crashes
**Solution:** Check logs for the specific error:
```bash
sudo docker-compose logs backend --tail=50
```
