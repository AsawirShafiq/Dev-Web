from pymongo import MongoClient

# Replace 'grocery' with your database name
MONGO_URI = "mongodb://localhost:27017/grocery"

try:
    client = MongoClient(MONGO_URI)
    db = client.get_database()  # connects to 'grocery' database
    print("Connected successfully!")
    print("Databases on server:", client.list_database_names())
except Exception as e:
    print("Connection failed:", e)
