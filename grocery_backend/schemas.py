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
    brand: str
    description: str
    price: float
    category: Optional[str] = None        # e.g., "Electronics"
    stock: int = 0                        # how many units available
    images: Optional[List[str]] = []      # array of image URLs
    rating: Optional[float] = 0.0         # overall rating
    tags: Optional[List[str]] = []        # e.g. ["laptop", "gaming"]


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str]
    brand: Optional[str]
    description: Optional[str]
    price: Optional[float]
    category: Optional[str]
    stock: Optional[int]
    images: Optional[List[str]]
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