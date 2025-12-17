from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.grocery
users_collection = db.users
products_collection = db["products"]
invoices_collection = db["invoices"]
wishlist_collection = db["wishlist"]
cart_collection = db["cart"]