from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.schemas.schemas import (
    PropertyResponse, PropertyCreate, PropertyUpdate,
    RoomResponse, RoomCreate, RoomUpdate
)
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/properties", tags=["Properties"])


@router.get("/", response_model=List[PropertyResponse])
def get_properties(db: Session = Depends(get_db)):
    properties = db.query(User).filter(
        User.__table__.c.id != None
    ).all()
    from app.models.user import Property
    properties = db.query(Property).all()
    return properties


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: str, db: Session = Depends(get_db)):
    from app.models.user import Property
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    return property


@router.post("/", response_model=PropertyResponse)
def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "property_sales"))
):
    from app.models.user import Property
    property = Property(**property_data.model_dump())
    db.add(property)
    db.commit()
    db.refresh(property)
    return property


@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: str,
    property_data: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "property_sales"))
):
    from app.models.user import Property
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    for key, value in property_data.model_dump().items():
        if value is not None:
            setattr(property, key, value)
    
    db.commit()
    db.refresh(property)
    return property


@router.delete("/{property_id}")
def delete_property(
    property_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    from app.models.user import Property
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    db.delete(property)
    db.commit()
    return {"message": "Property deleted successfully"}


@router.get("/{property_id}/rooms", response_model=List[RoomResponse])
def get_rooms(property_id: str, db: Session = Depends(get_db)):
    from app.models.user import Room
    rooms = db.query(Room).filter(Room.property_id == property_id).all()
    return rooms


@router.post("/{property_id}/rooms", response_model=RoomResponse)
def create_room(
    property_id: str,
    room_data: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "property_sales"))
):
    from app.models.user import Property, Room
    
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    room = Room(property_id=property_id, **room_data.model_dump())
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.put("/rooms/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: str,
    room_data: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "property_sales"))
):
    from app.models.user import Room
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    for key, value in room_data.model_dump().items():
        if value is not None:
            setattr(room, key, value)
    
    db.commit()
    db.refresh(room)
    return room


@router.delete("/rooms/{room_id}")
def delete_room(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    from app.models.user import Room
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    db.delete(room)
    db.commit()
    return {"message": "Room deleted successfully"}
