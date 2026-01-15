from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Support both MONGO_URI and MONGODB_URL environment variables
MONGO_URI = os.getenv("MONGODB_URL") or os.getenv("MONGO_URI") or "mongodb://localhost:27017/grocery"
client = MongoClient(MONGO_URI)
db = client.grocery
users_collection = db.users
products_collection = db["products"]
invoices_collection = db["invoices"]
wishlist_collection = db["wishlist"]
cart_collection = db["cart"]
api_sync_collection = db["api_sync_status"]