# 🚀 Deployment Guide

This guide covers deploying both the backend and frontend to production.

## Prerequisites

- Git repository (GitHub, GitLab, etc.)
- Production server/hosting (AWS, Heroku, DigitalOcean, etc.)
- MongoDB Atlas account (cloud MongoDB)
- Domain name (optional)

## Backend Deployment

### Option 1: Heroku (Easiest)

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows/Linux - Download from heroku.com/download
   ```

2. **Prepare Backend**
   ```bash
   cd grocery_backend
   
   # Create Procfile
   echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > Procfile
   
   # Create runtime.txt
   echo "python-3.9.16" > runtime.txt
   ```

3. **Deploy**
   ```bash
   heroku login
   heroku create your-grocery-app-backend
   heroku config:set SECRET_KEY=your_production_secret_key
   heroku config:set MONGO_URI=your_mongodb_atlas_uri
   git push heroku main
   ```

### Option 2: AWS EC2

1. **Launch EC2 Instance**
   - Select Python 3.9+ AMI
   - Configure security groups (allow ports 22, 80, 443)

2. **Connect & Setup**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   
   # Update system
   sudo yum update -y
   
   # Install Python and dependencies
   sudo yum install python3 python3-venv git -y
   
   # Clone repository
   git clone <your-repo-url>
   cd grocery_backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Create .env file**
   ```bash
   cat > .env << EOF
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/grocery
   SECRET_KEY=your_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   EOF
   ```

4. **Run with Gunicorn**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 main:app
   ```

5. **Setup Systemd Service** (auto-start)
   ```bash
   sudo tee /etc/systemd/system/grocery-api.service > /dev/null << EOF
   [Unit]
   Description=Grocery Store API
   After=network.target

   [Service]
   Type=notify
   User=ec2-user
   WorkingDirectory=/home/ec2-user/grocery_backend
   ExecStart=/home/ec2-user/grocery_backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 main:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   EOF
   
   sudo systemctl enable grocery-api
   sudo systemctl start grocery-api
   ```

### MongoDB Atlas Setup

1. **Create Cluster**
   - Sign up at mongodb.com/cloud
   - Create free cluster
   - Add IP whitelist
   - Create database user

2. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/grocery
   ```

3. **Update Backend .env**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/grocery
   ```

---

## Frontend Deployment

### Option 1: Vercel (Recommended for React)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to vercel.com
   - Connect GitHub repository
   - Select `grocery-frontend` as root
   - Add environment variables:
     ```
     VITE_API_URL=https://your-backend-url.com
     ```
   - Deploy!

### Option 2: Netlify

1. **Build Frontend**
   ```bash
   cd grocery-frontend
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

3. **Add Environment Variables**
   - Site settings → Build & deploy → Environment
   - Add `VITE_API_URL=https://your-backend-url.com`

### Option 3: AWS S3 + CloudFront

1. **Build**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   - AWS Console → S3 → Create bucket
   - Upload `dist` folder contents
   - Enable static website hosting

3. **Setup CloudFront**
   - CloudFront → Create distribution
   - Point to S3 bucket
   - Add SSL certificate

### Option 4: Traditional Web Server (Nginx)

1. **Build Frontend**
   ```bash
   npm run build
   ```

2. **Upload to Server**
   ```bash
   scp -r dist/* user@server:/var/www/html/
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://your-backend-url;
       }
   }
   ```

4. **Enable SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Environment Variables

### Backend (.env)
```env
# Production - Use strong secret key
SECRET_KEY=generate_with_python_secrets_module
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/grocery
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Frontend (Update in code or .env.production)
Update the API_BASE_URL in `src/utils/constants.js` or create `.env.production`:
```env
VITE_API_URL=https://your-backend-url.com
```

---

## Database Backups

### MongoDB Atlas Backup
- Automatic daily backups included
- Manual backup export:
  ```bash
  mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/grocery"
  ```

### Restore Backup
```bash
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/grocery" dump/
```

---

## Monitoring & Logging

### Backend Monitoring
- Use Sentry for error tracking
- Set up CloudWatch (AWS) or similar
- Enable application logging

### Frontend Monitoring
- Use Sentry or LogRocket
- Monitor performance with Web Vitals
- Track user analytics

---

## Performance Optimization

### Backend
```python
# Add to main.py
from fastapi.middleware.gzip import GZIPMiddleware

app.add_middleware(GZIPMiddleware, minimum_size=1000)
```

### Frontend
- Already optimized with Vite
- Images should be optimized separately
- Use CDN for static assets
- Enable compression (Gzip/Brotli)

---

## SSL/HTTPS

### Backend
- Use reverse proxy (Nginx)
- Let's Encrypt certificate (free)
- Auto-renew with certbot

### Frontend
- Vercel/Netlify handle automatically
- Or use CloudFlare

---

## Domain Setup

1. **Buy Domain** - GoDaddy, Namecheap, etc.
2. **Update DNS Records**
   - Backend: Point to server IP or Heroku URL
   - Frontend: Point to CDN/hosting provider
3. **Configure SSL** - Usually automatic

---

## Post-Deployment Checklist

- [ ] Backend running and accessible
- [ ] Frontend deployed and pointing to correct API
- [ ] MongoDB Atlas cluster running
- [ ] SSL certificates installed
- [ ] Environment variables set
- [ ] Email notifications working
- [ ] Error logging/monitoring setup
- [ ] Database backups configured
- [ ] CDN cache configured
- [ ] Performance monitoring active

---

## Rollback Procedure

### If Something Goes Wrong

**Backend:**
```bash
# Heroku rollback
heroku releases
heroku rollback v5  # Specify version

# Git rollback
git revert <commit-hash>
git push heroku main
```

**Frontend:**
```bash
# Vercel: Go to dashboard and select previous deployment
# Netlify: Deploy → Production deploys → Select previous version
```

---

## Troubleshooting Deployment

### Backend Issues
- Check logs: `heroku logs --tail`
- Verify environment variables: `heroku config`
- Test API endpoint: `curl https://your-api.com/docs`

### Frontend Issues
- Check build output for errors
- Verify API URL is correct
- Check browser console (F12)
- Clear browser cache

### Database Issues
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

---

## Security Considerations

1. **Environment Variables** - Never commit `.env`
2. **CORS** - Configure properly for production
3. **HTTPS** - Always use SSL
4. **Database** - Use strong passwords
5. **API Keys** - Rotate regularly
6. **Rate Limiting** - Add to prevent abuse
7. **Authentication** - Use secure JWT settings
8. **HTTPS Only** - Set secure flag on cookies

---

## Further Resources

- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Deployment](https://vitejs.dev/guide/build.html)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Heroku Python](https://devcenter.heroku.com/articles/getting-started-with-python)
- [AWS EC2](https://docs.aws.amazon.com/ec2/)

---

**Ready to deploy? 🚀**
