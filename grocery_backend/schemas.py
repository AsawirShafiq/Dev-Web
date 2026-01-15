from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List
from datetime import datetime


class UserBase(BaseModel):
    name: str
    username: str
    email: EmailStr
    usertype: str = "customer"
    phone: Optional[str]
    address: Optional[Dict]
    cart: List[Dict] = []          # Example: [{ "product_id": "...", "quantity": 2 }]
    wishlist: List[str] = []       # Example: ["productId1", "productId2"]


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[str]
    address: Optional[Dict]
    cart: Optional[List[Dict]]
    wishlist: Optional[List[str]]
    password: Optional[str]


class UserResponse(UserBase):
    id: str



class ProductBase(BaseModel):
    name: str
    brand: Optional[str] = None
    description: Optional[str] = None
    price: float = 0.0
    category: Optional[str] = None        # e.g., "Electronics"
    stock: int = 0                        # how many units available
    image_url: Optional[str] = None       # URL to product image
    rating: Optional[float] = 0.0         # overall rating
    tags: Optional[List[str]] = []        # e.g. ["laptop", "gaming"]
    barcode: Optional[str] = None         # product barcode from OpenFoodFacts
    source: Optional[str] = None          # "manual" or "openfoodfacts"


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str]
    brand: Optional[str]
    description: Optional[str]
    price: Optional[float]
    category: Optional[str]
    stock: Optional[int]
    image_url: Optional[str]
    rating: Optional[float]
    tags: Optional[List[str]]


class ProductResponse(ProductBase):
    id: str


class InvoiceProduct(BaseModel):
    product_id: str
    quantity: int

class InvoiceCreate(BaseModel):
    user_id: str
    products: List[InvoiceProduct]

class InvoiceResponse(BaseModel):
    id: str
    user_id: str
    products: List[InvoiceProduct]
    total_amount: float
    created_at: str



from pydantic import BaseModel

# Base for Wishlist items (no quantity)
class WishlistItemBase(BaseModel):
    product_id: str

class WishlistItemCreate(WishlistItemBase):
    pass

class WishlistItemResponse(WishlistItemBase):
    id: str
    user_id: str

# Base for Cart items (includes quantity)
class CartItemBase(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: str
    user_id: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str