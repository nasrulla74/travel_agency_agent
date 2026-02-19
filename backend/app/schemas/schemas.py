from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: str = "traveler"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserResponse(UserBase):
    id: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PropertyBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: str
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    images: List[str] = []
    amenities: List[str] = []


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(PropertyBase):
    pass


class PropertyResponse(PropertyBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class RoomBase(BaseModel):
    name: str
    description: Optional[str] = None
    max_occupancy: int = 2
    base_rate: float = 0


class RoomCreate(RoomBase):
    pass


class RoomUpdate(RoomBase):
    pass


class RoomResponse(RoomBase):
    id: str
    property_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class BookingBase(BaseModel):
    property_id: str
    room_id: str
    check_in: date
    check_out: date
    guests: int = 1
    notes: Optional[str] = None


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None


class BookingResponse(BookingBase):
    id: str
    user_id: str
    total_amount: float
    status: str
    payment_status: str
    stripe_payment_id: Optional[str] = None
    voucher_code: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class MessageBase(BaseModel):
    content: str


class MessageCreate(MessageBase):
    conversation_id: str


class MessageResponse(MessageBase):
    id: str
    user_id: Optional[str] = None
    conversation_id: str
    role: str
    is_escalation: bool
    escalation_status: Optional[str] = None
    admin_response: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class DocumentBase(BaseModel):
    title: str
    content: str
    file_url: Optional[str] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentResponse(DocumentBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str
    conversation_id: str


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    needs_escalation: bool = False


class EscalationUpdate(BaseModel):
    admin_response: str
    status: str = "resolved"
