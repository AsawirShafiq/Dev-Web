# GitHub Configuration Guide - Secrets & Variables

## 📋 Overview

Your pipeline now uses **two types of GitHub configuration**:
- **Secrets** 🔒 - For sensitive data (passwords, keys)
- **Variables** ⚙️ - For non-sensitive configuration

---

## 🔒 Part 1: GitHub Secrets (Sensitive Data)

**Location:** Repository → Settings → Secrets and variables → Actions → Secrets

### Required Secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `MONGODB_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/grocery_db` |
| `SECRET_KEY` | JWT authentication secret | Generate with command below |
| `SSH_PRIVATE_KEY` | EC2 SSH private key | `-----BEGIN RSA PRIVATE KEY-----\n...` |
| `DEPLOY_HOST` | EC2 IP address | `13.36.244.170` |
| `DEPLOY_USER` | EC2 username | `ec2-user` |

### Generate SECRET_KEY:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## ⚙️ Part 2: GitHub Variables (Non-Sensitive Config)

**Location:** Repository → Settings → Secrets and variables → Actions → Variables

### Recommended Variables:

| Variable Name | Description | Default Value | Your Value |
|---------------|-------------|---------------|------------|
| `DATABASE_NAME` | Database name | `grocery_db` | `grocery_db` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173` | `http://localhost:5173,http://13.36.244.170:5173` |
| `DEBUG` | Debug mode | `False` | `False` |
| `ALGORITHM` | JWT algorithm | `HS256` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry (minutes) | `30` | `30` |
| `HOST` | Server host | `0.0.0.0` | `0.0.0.0` |
| `PORT` | Server port | `8000` | `8000` |

**Note:** Variables are optional - the pipeline has sensible defaults.

---

## � Setup Instructions

### Step 1: Add Secrets (Required)

1. Go to: `https://github.com/huzaifatahirrathore/Dev-Web/settings/secrets/actions`
2. Click: **New repository secret**
3. Add each secret from the table above

**For `SSH_PRIVATE_KEY`:**
```bash
cat ~/new-aws-key  # Copy entire output including BEGIN/END lines
```

**For `MONGODB_URL` (MongoDB Atlas):**
1. MongoDB Atlas → Clusters → Connect
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` and set database name

Example:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/grocery_db?retryWrites=true&w=majority
```

### Step 2: Add Variables (Optional but Recommended)

1. Go to: `https://github.com/huzaifatahirrathore/Dev-Web/settings/variables/actions`
2. Click: **New repository variable**
3. Add variables from the table above

**Important for `ALLOWED_ORIGINS`:**
```
http://localhost:5173,http://YOUR_EC2_IP:5173
```

Replace `YOUR_EC2_IP` with your actual EC2 IP (e.g., `13.36.244.170`)

---

## 🎯 What Gets Created in .env File

Your pipeline automatically creates this `.env` file on EC2:

```bash
MONGODB_URL=<from_secret>
DATABASE_NAME=<from_variable_or_default>
SECRET_KEY=<from_secret>
ALGORITHM=<from_variable_or_default>
ACCESS_TOKEN_EXPIRE_MINUTES=<from_variable_or_default>
DEBUG=<from_variable_or_default>
ALLOWED_ORIGINS=<from_variable_or_default>
HOST=<from_variable_or_default>
PORT=<from_variable_or_default>
```

---

## ✅ Verification Checklist

### Before Deployment:
- [ ] All 5 secrets added to GitHub
- [ ] `ALLOWED_ORIGINS` includes your EC2 IP
- [ ] `SECRET_KEY` is at least 32 characters
- [ ] `MONGODB_URL` is valid connection string

### After Deployment:
```bash
# SSH to EC2
ssh -i ~/new-aws-key ec2-user@YOUR_EC2_IP

# Check .env file
cd ~/grocery_app
cat grocery_backend/.env

# Check containers
sudo docker-compose ps

# Check logs
sudo docker-compose logs backend
```

---

## 🔥 Trigger Deployment

After adding secrets and variables:

```bash
git commit --allow-empty -m "Trigger deployment with new configuration"
git push huzaifa-origin huzaifa
```

Monitor at: `https://github.com/huzaifatahirrathore/Dev-Web/actions`

---

## 🎓 For Viva/Presentation

### Architecture:
**"We use GitHub Actions for CI/CD with environment-specific configuration:"**
- **Secrets** for sensitive data (encrypted at rest)
- **Variables** for environment configuration (easier to update)
- **Automatic .env generation** on deployment
- **Health checks** to verify successful deployment

### Security:
**"Secrets are encrypted and never exposed in logs. We use:"**
- SSH key authentication for EC2
- JWT tokens with secure SECRET_KEY
- MongoDB connection with TLS
- CORS configuration to restrict API access

---

## 🐛 Troubleshooting

### Issue: "MONGODB_URL secret is not set"
**Solution:** Add `MONGODB_URL` to GitHub Secrets (not Variables)

### Issue: CORS errors in browser console
**Solution:** Update `ALLOWED_ORIGINS` variable to include your frontend URL

### Issue: Containers fail to start
**Solution:** SSH to EC2 and check logs:
```bash
ssh -i ~/new-aws-key ec2-user@YOUR_EC2_IP
cd ~/grocery_app
sudo docker-compose logs
