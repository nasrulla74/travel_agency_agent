import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Enum, Integer, Numeric, ForeignKey, JSON, Boolean, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base


class UserRole(str, enum.Enum):
    TRAVELER = "traveler"
    ADMIN = "admin"
    PROPERTY_SALES = "property_sales"


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"


class EscalationStatus(str, enum.Enum):
    PENDING = "pending"
    RESOLVED = "resolved"


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default=UserRole.TRAVELER.value)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    bookings = relationship("Booking", back_populates="user")
    messages = relationship("Message", back_populates="user")


class Property(Base):
    __tablename__ = "properties"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=False)
    contact_name = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    images = Column(JSON, default=list)
    amenities = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    rooms = relationship("Room", back_populates="property")
    bookings = relationship("Booking", back_populates="property")


class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    property_id = Column(String, ForeignKey("properties.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    max_occupancy = Column(Integer, default=2)
    base_rate = Column(Numeric(10, 2), default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    property = relationship("Property", back_populates="rooms")
    bookings = relationship("Booking", back_populates="room")


class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    property_id = Column(String, ForeignKey("properties.id"), nullable=False)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    guests = Column(Integer, default=1)
    total_amount = Column(Numeric(10, 2), default=0)
    status = Column(String, default=BookingStatus.PENDING.value)
    payment_status = Column(String, default=PaymentStatus.PENDING.value)
    stripe_payment_id = Column(String, nullable=True)
    voucher_code = Column(String, unique=True, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="bookings")
    property = relationship("Property", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    conversation_id = Column(String, nullable=False, index=True)
    role = Column(String, default=MessageRole.USER.value)
    content = Column(Text, nullable=False)
    is_escalation = Column(Boolean, default=False)
    escalation_status = Column(String, nullable=True)
    admin_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="messages")


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    file_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
