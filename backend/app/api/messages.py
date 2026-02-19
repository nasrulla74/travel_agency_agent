import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.user import User, Message, Document, Property, Room, Booking
from app.schemas.schemas import (
    MessageResponse, MessageCreate, ChatRequest, ChatResponse, EscalationUpdate
)
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("/conversations/{conversation_id}", response_model=List[MessageResponse])
def get_conversation_messages(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()
    return messages


@router.post("/conversations/{conversation_id}", response_model=MessageResponse)
def create_message(
    conversation_id: str,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = Message(
        conversation_id=conversation_id,
        role="user",
        user_id=current_user.id,
        **message_data.model_dump()
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.get("/escalations", response_model=List[MessageResponse])
def get_escalations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    messages = db.query(Message).filter(
        Message.is_escalation == True
    ).order_by(Message.created_at.desc()).all()
    return messages


@router.put("/escalations/{message_id}", response_model=MessageResponse)
def respond_to_escalation(
    message_id: str,
    escalation_data: EscalationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escalation not found"
        )
    
    message.admin_response = escalation_data.admin_response
    message.escalation_status = escalation_data.status
    
    response_message = Message(
        conversation_id=message.conversation_id,
        role="assistant",
        content=escalation_data.admin_response,
        is_escalation=False,
        escalation_status="resolved"
    )
    db.add(response_message)
    db.commit()
    db.refresh(message)
    return message
