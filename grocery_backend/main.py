from fastapi import FastAPI, HTTPException, Depends
from schemas import UserCreate, UserResponse, UserUpdate, ProductCreate, ProductResponse, InvoiceCreate, InvoiceResponse, WishlistItemCreate, WishlistItemResponse, CartItemCreate, CartItemResponse
from auth import hash_password, verify_password, create_access_token
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from bson import ObjectId
from models import users_collection, invoices_collection, products_collection, wishlist_collection, cart_collection
from fastapi.encoders import jsonable_encoder
from datetime import datetime
from jose import JWTError, jwt
import os
import requests
import random

app = FastAPI()

# JWT Auth setup
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")  # fallback key
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ===============================
# Helper Functions
# ===============================

def off_product_mapper(p: dict) -> dict:
    return {
        "name": p.get("product_name", "Unknown Product"),
        "description": p.get("generic_name"),
        "brand": p.get("brands"),
        "price": round(random.uniform(1, 10,),2),  # OpenFoodFacts does NOT provide prices
        "category": p.get("categories"),
        "stock": random.randint(1, 100),
        "image_url": p.get("image_url"),
        "barcode": p.get("code")  # useful for deduplication
    }


def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "username": user["username"],
        "email": user["email"],
        "usertype": user["usertype"],
        "phone": user.get("phone"),
        "address": user.get("address")
    }


def product_helper(product) -> dict:
    image_url = product.get("image_url")

    # Safety check
    if not isinstance(image_url, str):
        image_url = None

    return {
        "id": str(product["_id"]),
        "name": product.get("name"),
        "brand": product.get("brand"),
        "description": product.get("description"),
        "price": product.get("price", 0.0),
        "category": product.get("category"),
        "stock": product.get("stock", 0),
        "image_url": image_url,
        "rating": product.get("rating"),
        "tags": product.get("tags", [])
    }


def invoice_helper(invoice) -> dict:
    return {
        "id": str(invoice["_id"]),
        "user_id": invoice["user_id"],
        "products": invoice["products"],
        "total_amount": invoice.get("total_amount", 0.0),
        "created_at": invoice.get("created_at", datetime.utcnow().isoformat())
    }



def item_helper(item, item_type: str) -> dict:
    if item_type == "wishlist":
        return {
            "id": str(item["_id"]),
            "user_id": item["user_id"],
            "product_id": item["product_id"]
        }
    elif item_type == "cart":
        return {
            "id": str(item["_id"]),
            "user_id": item["user_id"],
            "product_id": item["product_id"],
            "quantity": item.get("quantity", 1)
        }
    else:
        raise ValueError("Unknown item type")


def calculate_total_amount(products: list) -> float:
    total = 0
    for item in products:
        total += item["price"] * item["quantity"]
    return total


# ===============================
# AUTH ROUTE
# ===============================
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_collection.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user["username"]})
    return {"access_token": token, "token_type": "bearer"}


# ===============================
# USER ROUTES
# ===============================
@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, current_user: str = Depends(get_current_user)):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_pwd = hash_password(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_pwd
    result = users_collection.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    return user_helper(user_dict)


@app.get("/users", response_model=list[UserResponse])
def get_users(current_user: str = Depends(get_current_user)):
    users = users_collection.find()
    return [user_helper(u) for u in users]


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: str, current_user: str = Depends(get_current_user)):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_helper(user)


@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: str, user: UserUpdate, current_user: str = Depends(get_current_user)):
    user_dict = {k: v for k, v in user.dict().items() if v is not None}
    if "password" in user_dict:
        user_dict["password"] = hash_password(user_dict["password"])
    result = users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": user_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = users_collection.find_one({"_id": ObjectId(user_id)})
    return user_helper(updated_user)


@app.delete("/users/{user_id}")
def delete_user(user_id: str, current_user: str = Depends(get_current_user)):
    result = users_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


# ===============================
# PRODUCT ROUTES
# ===============================

@app.post("/import/openfoodfacts")
def import_openfoodfacts_products(current_user: str = Depends(get_current_user)):
    BASE_URL = "https://world.openfoodfacts.net/api/v2/search"
    HEADERS = {
        "User-Agent": "FastAPI-App/1.0 (contact@example.com)"
    }

    inserted_count = 0
    skipped_count = 0

    for page in range(0, 11):
        params = {
            "page": page,
            "page_size": 100,
            "fields": "code,product_name,generic_name,brands,categories,image_url"
        }

        response = requests.get(BASE_URL, headers=HEADERS, params=params)
        if response.status_code != 200:
            continue

        data = response.json()
        products = data.get("products", [])

        for p in products:
            barcode = p.get("code")
            if not barcode:
                continue

            # Avoid duplicates using barcode
            if products_collection.find_one({"barcode": barcode}):
                skipped_count += 1
                continue

            product_data = off_product_mapper(p)
            products_collection.insert_one(product_data)
            inserted_count += 1

    return {
        "message": "Import completed",
        "inserted": inserted_count,
        "skipped": skipped_count
    }


@app.post("/products", response_model=ProductResponse)
def create_product(product: ProductCreate, current_user: str = Depends(get_current_user)):
    product_dict = jsonable_encoder(product)
    result = products_collection.insert_one(product_dict)
    product_dict["_id"] = result.inserted_id
    return product_helper(product_dict)


@app.get("/products", response_model=list[ProductResponse])
def get_all_products(current_user: str = Depends(get_current_user)):
    products = products_collection.find()
    return [product_helper(p) for p in products]


@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, current_user: str = Depends(get_current_user)):
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_helper(product)


@app.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: str, product: ProductCreate, current_user: str = Depends(get_current_user)):
    update_data = {k: v for k, v in product.dict().items() if v is not None}
    updated = products_collection.update_one({"_id": ObjectId(product_id)}, {"$set": update_data})
    if updated.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    updated_product = products_collection.find_one({"_id": ObjectId(product_id)})
    return product_helper(updated_product)


@app.delete("/products/{product_id}")
def delete_product(product_id: str, current_user: str = Depends(get_current_user)):
    deleted = products_collection.delete_one({"_id": ObjectId(product_id)})
    if deleted.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}


# ===============================
# INVOICE ROUTES
# ===============================
@app.post("/invoices", response_model=InvoiceResponse)
def create_invoice(invoice: InvoiceCreate, current_user: str = Depends(get_current_user)):
    populated_products = []
    for item in invoice.products:
        product = products_collection.find_one({"_id": ObjectId(item.product_id)})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        populated_products.append({
            "product_id": item.product_id,
            "price": product["price"],
            "description": product["description"],
            "quantity": item.quantity
        })
    total_amount = calculate_total_amount(populated_products)
    created_at = datetime.utcnow().isoformat()
    invoice_data = {
        "user_id": invoice.user_id,
        "products": populated_products,
        "total_amount": total_amount,
        "created_at": created_at
    }
    result = invoices_collection.insert_one(invoice_data)
    invoice_data["id"] = str(result.inserted_id)
    return invoice_data


@app.get("/invoices", response_model=list[InvoiceResponse])
def get_invoices(current_user: str = Depends(get_current_user)):
    invoices = invoices_collection.find()
    return [invoice_helper(i) for i in invoices]



@app.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: str, current_user: str = Depends(get_current_user)):
    invoice = invoices_collection.find_one({"_id": ObjectId(invoice_id)})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice_helper(invoice)


@app.delete("/invoices/{invoice_id}")
def delete_invoice(invoice_id: str, current_user: str = Depends(get_current_user)):
    deleted = invoices_collection.delete_one({"_id": ObjectId(invoice_id)})
    if deleted.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": "Invoice deleted successfully"}


# ===============================
# WISHLIST ROUTES
# ===============================
@app.post("/wishlist/{user_id}", response_model=WishlistItemResponse)
def add_to_wishlist(user_id: str, item: WishlistItemCreate, current_user: str = Depends(get_current_user)):
    product = products_collection.find_one({"_id": ObjectId(item.product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product does not exist")
    existing = wishlist_collection.find_one({"user_id": user_id, "product_id": item.product_id})
    if existing:
        raise HTTPException(status_code=400, detail="Product already in wishlist")
    item_dict = item.dict()
    item_dict["user_id"] = user_id
    result = wishlist_collection.insert_one(item_dict)
    item_dict["_id"] = result.inserted_id
    return item_helper(item_dict, "wishlist")


@app.get("/wishlist/{user_id}", response_model=list[WishlistItemResponse])
def get_wishlist(user_id: str, current_user: str = Depends(get_current_user)):
    items = wishlist_collection.find({"user_id": user_id})
    return [item_helper(i, "wishlist") for i in items]


@app.delete("/wishlist/{user_id}/{product_id}")
def delete_wishlist_item(user_id: str, product_id: str, current_user: str = Depends(get_current_user)):
    result = wishlist_collection.delete_one({"user_id": user_id, "product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
    return {"message": "Item removed from wishlist"}


# ===============================
# CART ROUTES
# ===============================
@app.post("/cart/{user_id}", response_model=CartItemResponse)
def add_to_cart(user_id: str, item: CartItemCreate, current_user: str = Depends(get_current_user)):
    existing = cart_collection.find_one({"user_id": user_id, "product_id": item.product_id})
    if existing:
        cart_collection.update_one({"_id": existing["_id"]}, {"$inc": {"quantity": item.quantity}})
        existing_item = cart_collection.find_one({"_id": existing["_id"]})
        return item_helper(existing_item, "cart")
    item_dict = item.dict()
    item_dict["user_id"] = user_id
    result = cart_collection.insert_one(item_dict)
    item_dict["_id"] = result.inserted_id
    return item_helper(item_dict, "cart")


@app.get("/cart/{user_id}", response_model=list[CartItemResponse])
def get_cart(user_id: str, current_user: str = Depends(get_current_user)):
    items = cart_collection.find({"user_id": user_id})
    return [item_helper(i, "cart") for i in items]


@app.delete("/cart/{user_id}/{product_id}")
def delete_cart_item(user_id: str, product_id: str, current_user: str = Depends(get_current_user)):
    result = cart_collection.delete_one({"user_id": user_id, "product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    return {"message": "Item removed from cart"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
