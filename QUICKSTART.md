# 🚀 Quick Start Guide

Get the GroceryStore application running in 5 minutes!

## Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB running locally

## Step 1: Backend Setup (Terminal 1)

```bash
# Navigate to backend directory
cd grocery_backend

# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo 'MONGO_URI=mongodb://localhost:27017/grocery
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60' > .env

# Run the server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

✅ Backend running at: http://127.0.0.1:8000

## Step 2: Frontend Setup (Terminal 2)

```bash
# Navigate to frontend directory
cd grocery-frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

✅ Frontend running at: http://localhost:5173

## Step 3: Test the Application

1. Open browser to http://localhost:5173
2. Click "Get Started" or navigate to `/register`
3. Create a new account
4. Login with your credentials
5. Browse products, add to cart, place orders

## Common Commands

### Backend
- Run server: `python -m uvicorn main:app --reload`
- Test MongoDB: `python test_mongo.py`
- Install packages: `pip install -r requirements.txt`

### Frontend
- Dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Lint code: `npm run lint`

## Useful Links

- Backend API Docs: http://127.0.0.1:8000/docs
- Frontend: http://localhost:5173
- MongoDB: mongodb://localhost:27017/grocery

## Troubleshooting

**Port 8000 already in use?**
```bash
# Find and kill the process
lsof -i :8000
kill -9 <PID>
```

**MongoDB connection failed?**
```bash
# Ensure MongoDB is running
mongod

# Or check connection string in .env
# Default: mongodb://localhost:27017/grocery
```

**Frontend won't start?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Next Steps

- Add sample products to MongoDB
- Create test user accounts
- Customize Tailwind CSS colors
- Deploy to production
- Add payment integration
- Set up email notifications

Happy coding! 🎉
