from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
import uuid
import random
import string

from app.db.database import get_db
from app.models.user import User, Booking, Room, Property
from app.schemas.schemas import (
    BookingResponse, BookingCreate, BookingUpdate
)
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def generate_voucher_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


@router.get("/", response_model=List[BookingResponse])
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        bookings = db.query(Booking).all()
    elif current_user.role == "property_sales":
        bookings = db.query(Booking).join(Property).all()
    else:
        bookings = db.query(Booking).filter(Booking.user_id == current_user.id).all()
    return bookings


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if current_user.role not in ["admin", "property_sales"] and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this booking"
        )
    return booking


@router.post("/", response_model=BookingResponse)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(Room).filter(Room.id == booking_data.room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    if booking_data.check_in >= booking_data.check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date"
        )
    
    nights = (booking_data.check_out - booking_data.check_in).days
    total_amount = float(room.base_rate) * nights
    
    booking = Booking(
        user_id=current_user.id,
        total_amount=total_amount,
        status="pending",
        payment_status="pending",
        **booking_data.model_dump()
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.put("/{booking_id}/confirm", response_model=BookingResponse)
def confirm_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "property_sales"))
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    booking.status = "confirmed"
    booking.voucher_code = generate_voucher_code()
    db.commit()
    db.refresh(booking)
    return booking


@router.put("/{booking_id}/pay", response_model=BookingResponse)
def pay_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pay for this booking"
        )
    
    if booking.status != "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking must be confirmed before payment"
        )
    
    booking.payment_status = "paid"
    booking.stripe_payment_id = f"pi_{uuid.uuid4().hex}"
    db.commit()
    db.refresh(booking)
    return booking


@router.put("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if current_user.role not in ["admin", "property_sales"] and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this booking"
        )
    
    booking.status = "cancelled"
    if booking.payment_status == "paid":
        booking.payment_status = "refunded"
    db.commit()
    db.refresh(booking)
    return booking
