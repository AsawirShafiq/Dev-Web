# GroceryStore - Full Stack eCommerce Application

A modern, responsive eCommerce application for a grocery store built with **React + Vite + Tailwind CSS** (Frontend) and **FastAPI + MongoDB** (Backend).

## 📋 Project Structure

```
grocery_backend/          # Python FastAPI Backend
├── main.py              # Main application with all routes
├── models.py            # MongoDB database models
├── schemas.py           # Pydantic validation schemas
├── auth.py              # Authentication utilities (JWT, Argon2)
├── requirements.txt     # Python dependencies
└── test_mongo.py        # MongoDB connection test

grocery-frontend/         # React + Vite Frontend
├── src/
│   ├── components/      # Reusable components (Navbar, ProductCard, ProtectedRoute)
│   ├── pages/           # Page components (Login, Register, Products, Cart, Wishlist, Invoices)
│   ├── context/         # React context (AuthContext, CartContext)
│   ├── services/        # API services and HTTP client configuration
│   ├── utils/           # Utilities (constants, token management)
│   ├── App.jsx          # Main app with routing
│   └── index.css        # Tailwind CSS setup
├── package.json
└── vite.config.js
```

## ✨ Features

### Backend
- ✅ User Authentication with JWT tokens
- ✅ Product CRUD operations
- ✅ Shopping Cart management
- ✅ Wishlist functionality
- ✅ Invoice/Order management
- ✅ KPI endpoints for analytics (revenue, top products, active customers, etc.)
- ✅ MongoDB database integration
- ✅ Secure password hashing with Argon2
- ✅ CORS enabled for frontend communication

### Frontend
- ✅ Beautiful, responsive UI with Tailwind CSS
- ✅ User authentication (Login/Register)
- ✅ Browse products with filtering and sorting
- ✅ Add products to cart and wishlist
- ✅ Shopping cart with order summary
- ✅ Wishlist management
- ✅ Order history (Invoices)
- ✅ Protected routes for authenticated users
- ✅ Clean aesthetic design with smooth transitions
- ✅ Mobile-responsive layout

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **PyJWT** - JWT token handling
- **Passlib + Argon2** - Secure password hashing
- **Pydantic** - Data validation
- **CORS Middleware** - Cross-Origin Resource Sharing

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS 4** - Utility-first CSS framework
- **Autoprefixer** - CSS vendor prefixing

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB running locally or accessible via URI

### Backend Setup

1. Navigate to the backend directory:
```bash
cd grocery_backend
```

2. Create a Python virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/grocery
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

5. Run the backend server:
```bash
python run.py
# or
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd grocery-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd grocery_backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd grocery-frontend
npm run dev
```

### Production Build

**Frontend:**
```bash
cd grocery-frontend
npm run build
npm run preview
```

## 📚 API Endpoints

### Authentication
- `POST /token` - Login with username and password

### Users
- `POST /users` - Register new user
- `GET /users` - Get all users (protected)
- `GET /users/{user_id}` - Get user by ID (protected)
- `PUT /users/{user_id}` - Update user (protected)
- `DELETE /users/{user_id}` - Delete user (protected)

### Products
- `GET /products` - Get all products (protected)
- `GET /products/{product_id}` - Get product by ID (protected)
- `POST /products` - Create product (protected)
- `PUT /products/{product_id}` - Update product (protected)
- `DELETE /products/{product_id}` - Delete product (protected)

### Cart
- `GET /cart/{user_id}` - Get user's cart (protected)
- `POST /cart/{user_id}` - Add item to cart (protected)
- `DELETE /cart/{user_id}/{product_id}` - Remove item from cart (protected)

### Wishlist
- `GET /wishlist/{user_id}` - Get user's wishlist (protected)
- `POST /wishlist/{user_id}` - Add item to wishlist (protected)
- `DELETE /wishlist/{user_id}/{product_id}` - Remove item from wishlist (protected)

### Invoices
- `GET /invoices` - Get all invoices (protected)
- `GET /invoices/{invoice_id}` - Get invoice by ID (protected)
- `POST /invoices` - Create invoice (protected)
- `DELETE /invoices/{invoice_id}` - Delete invoice (protected)

### KPI Analytics (All protected)
- `GET /kpi/total-users`
- `GET /kpi/total-products`
- `GET /kpi/total-invoices`
- `GET /kpi/total-revenue`
- `GET /kpi/average-order-value`
- `GET /kpi/total-cart-items`
- `GET /kpi/total-wishlist-items`
- `GET /kpi/active-customers`
- `GET /kpi/top-selling-products`

## 🔐 Authentication Flow

1. User registers/logs in with username and password
2. Backend validates credentials and issues JWT token
3. Frontend stores token in localStorage
4. Token is automatically added to all subsequent API requests via axios interceptor
5. Protected routes check authentication status and redirect to login if needed

## 🎨 Tailwind CSS Customization

The application uses Tailwind CSS v4 with automatic vendor prefixing. Key colors:
- **Primary Green**: `bg-green-600`, `text-green-600`
- **Success Green**: `bg-green-500`, `bg-green-700`
- **Error Red**: `bg-red-500`, `text-red-600`

Customize theme in `tailwind.config.js` if needed.

## 📱 Responsive Design

The application is fully responsive and mobile-friendly:
- Mobile: Single column layout
- Tablet (md): 2-3 column layout
- Desktop (lg): Full 3-4 column layout

## 🐛 Troubleshooting

### CORS Errors
- Ensure the backend is running on `http://127.0.0.1:8000`
- The frontend is configured to accept requests from this URL

### MongoDB Connection Issues
- Verify MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env` matches your MongoDB connection string
- Default: `mongodb://localhost:27017/grocery`

### Frontend Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist`

### Port Already in Use
- Backend (8000): `lsof -i :8000` and kill the process
- Frontend (5173): The dev server will use the next available port

## 📝 Sample User Flow

1. **Landing Page** - Visit `/` to see the home page
2. **Register** - Create a new account at `/register`
3. **Login** - Sign in at `/login`
4. **Browse Products** - View all products at `/products` with filtering/sorting
5. **Add to Cart** - Click "Add to Cart" on product cards
6. **Manage Wishlist** - Click the heart icon to add/remove items
7. **View Cart** - Review items and quantities at `/cart`
8. **Checkout** - Click "Proceed to Checkout" to create an order
9. **View Invoices** - See order history at `/invoices`
10. **Logout** - Sign out using the logout button in the navbar

## 📄 License

This project is open source and available for educational purposes.

## 💡 Future Enhancements

- Payment gateway integration
- Email notifications
- Product reviews and ratings
- Advanced search with full-text search
- Admin dashboard for product/user management
- Order tracking
- Promotional codes and discounts
- Product recommendations
- Real-time inventory updates
- User profile management

---

**Happy Shopping! 🛒**
