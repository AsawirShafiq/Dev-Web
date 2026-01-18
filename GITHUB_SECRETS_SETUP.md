# GitHub Secrets Setup Guide

## 📋 Required GitHub Repository Secrets

Go to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### 1. Backend Environment Variables

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `MONGODB_URL` | MongoDB connection string | `mongodb+srv://username:password@cluster.mongodb.net/grocery_db` | ✅ Yes |
| `DATABASE_NAME` | Database name | `grocery_db` | ✅ Yes |
| `SECRET_KEY` | JWT authentication secret | `your-super-secret-key-min-32-chars` | ✅ Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173,http://13.36.244.170:5173` | ✅ Yes |
| `DEBUG` | Debug mode | `False` | ⚠️ Optional |

### 2. Deployment Secrets

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `SSH_PRIVATE_KEY` | Your EC2 SSH private key | `-----BEGIN RSA PRIVATE KEY-----\n...` | ✅ Yes |
| `DEPLOY_HOST` | EC2 IP address | `13.36.244.170` | ✅ Yes |
| `DEPLOY_USER` | EC2 username | `ec2-user` | ✅ Yes |

### 3. Optional Secrets (if using chatbot features)

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for chatbot | `sk-...` | ⚠️ Optional |

---

## 🔧 Detailed Setup Instructions

### Step 1: Generate a Strong SECRET_KEY

Run this in your terminal:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and add it as `SECRET_KEY` in GitHub Secrets.

### Step 2: Get MongoDB Connection URL

**If using MongoDB Atlas (Cloud):**
1. Go to MongoDB Atlas → Clusters → Connect
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `<dbname>` with `grocery_db`

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/grocery_db?retryWrites=true&w=majority
```

**If using local MongoDB on EC2:**
```
mongodb://localhost:27017/grocery_db
```

### Step 3: Configure ALLOWED_ORIGINS

This controls which domains can access your API. Format:
```
http://localhost:5173,http://YOUR_EC2_IP:5173
```

**Example:**
```
http://localhost:5173,http://13.36.244.170:5173
```

### Step 4: Get SSH Private Key

Your EC2 private key should look like:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
(multiple lines)
...
-----END RSA PRIVATE KEY-----
```

**Important:** Copy the ENTIRE key including the BEGIN and END lines.

---

## ✅ What Your Pipeline Already Does

Your pipeline (`.github/workflows/ci-cd.yml`) is **already configured** to:

1. ✅ Read secrets from GitHub repository settings
2. ✅ Create the `.env` file automatically on EC2 with these values:
   ```bash
   MONGODB_URL=<from_secret>
   DATABASE_NAME=<from_secret>
   SECRET_KEY=<from_secret>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DEBUG=<from_secret>
   ALLOWED_ORIGINS=<from_secret>
   HOST=0.0.0.0
   PORT=8000
   ```

3. ✅ Deploy and start containers automatically

---

## 🚀 After Adding Secrets

Once you've added all secrets to GitHub:

1. **Trigger deployment:**
   ```bash
   git commit --allow-empty -m "Trigger deployment with new secrets"
   git push origin huzaifa
   ```

2. **Monitor the deployment:**
   - Go to GitHub → Actions tab
   - Watch the workflow run
   - Check for "✅ .env file created with GitHub Secrets"

3. **Verify on EC2:**
   ```bash
   ssh -i ~/new-aws-key ec2-user@13.36.244.170
   cd ~/grocery_app
   cat grocery_backend/.env
   ```

---

## 🎓 Quick Reference - Backend Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `MONGODB_URL` | Database connection | No default (required) |
| `DATABASE_NAME` | Database name | `grocery_db` |
| `SECRET_KEY` | JWT signing key | No default (required) |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `30` |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_ORIGINS` | CORS origins | `*` (all) |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |

---

## ⚠️ Common Issues

### Issue: "SECRET_KEY secret is not set"
**Solution:** Add `SECRET_KEY` to GitHub Secrets with a value of at least 32 characters.

### Issue: "MONGODB_URL secret is not set"
**Solution:** Add `MONGODB_URL` with your MongoDB connection string.

### Issue: CORS errors in browser
**Solution:** Update `ALLOWED_ORIGINS` to include your frontend URL:
```
http://localhost:5173,http://YOUR_EC2_IP:5173
```

---

## 📝 Example Values (For Testing)

**Do NOT use these in production - generate your own!**

```bash
# DATABASE_NAME
grocery_db

# SECRET_KEY (generate your own!)
dGhpc19pc19qdXN0X2FuX2V4YW1wbGVfc2VjcmV0X2tleV8zMmNoYXJz

# ALLOWED_ORIGINS
http://localhost:5173,http://13.36.244.170:5173

# DEBUG
False
```

---

## ✨ Next Steps

1. Add all secrets to GitHub repository
2. Push a commit to trigger deployment
3. Check GitHub Actions logs
4. Access your app at `http://YOUR_EC2_IP:5173`
5. Check API docs at `http://YOUR_EC2_IP:8000/docs`
