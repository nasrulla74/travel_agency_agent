import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User, Message, Document, Property, Room
from app.schemas.schemas import ChatRequest, ChatResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])


def search_knowledge_base(query: str, db: Session) -> str:
    documents = db.query(Document).all()
    if not documents:
        return ""
    
    query_lower = query.lower()
    for doc in documents:
        if query_lower in doc.content.lower() or query_lower in doc.title.lower():
            return doc.content
    return ""


def search_properties(query: str, db: Session) -> list:
    query_lower = query.lower()
    properties = db.query(Property).all()
    results = []
    
    for prop in properties:
        if (query_lower in prop.name.lower() or 
            query_lower in prop.location.lower() or
            query_lower in prop.description.lower()):
            rooms = db.query(Room).filter(Room.property_id == prop.id).all()
            results.append({
                "property": prop,
                "rooms": rooms
            })
    return results


def generate_ai_response(user_message: str, context: str, properties: list, db: Session) -> tuple:
    needs_escalation = False
    response_parts = []
    
    if context:
        response_parts.append(f"Based on our knowledge base: {context[:500]}")
    
    if properties:
        response_parts.append("\n\nHere are some properties that match your query:\n")
        for prop_data in properties[:3]:
            prop = prop_data["property"]
            rooms = prop_data["rooms"]
            response_parts.append(f"🏨 **{prop.name}** ({prop.location})")
            if prop.description:
                response_parts.append(f"   {prop.description[:200]}")
            if rooms:
                response_parts.append("   Available rooms:")
                for room in rooms:
                    response_parts.append(f"   - {room.name}: ${room.base_rate}/night")
            response_parts.append("")
    else:
        response_parts.append("\n\nI don't have specific properties matching your query. Would you like me to help you find accommodations? Please let me know your destination, travel dates, and any preferences.")
        needs_escalation = True
    
    return "\n".join(response_parts), needs_escalation


@router.post("", response_model=ChatResponse)
def chat(
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_message = Message(
        conversation_id=chat_request.conversation_id,
        role="user",
        user_id=current_user.id,
        content=chat_request.message
    )
    db.add(user_message)
    db.commit()
    
    context = search_knowledge_base(chat_request.message, db)
    properties = search_properties(chat_request.message, db)
    
    response_text, needs_escalation = generate_ai_response(
        chat_request.message, context, properties, db
    )
    
    if needs_escalation:
        escalation_message = Message(
            conversation_id=chat_request.conversation_id,
            role="assistant",
            user_id=current_user.id,
            content=response_text,
            is_escalation=True,
            escalation_status="pending"
        )
        db.add(escalation_message)
    else:
        ai_message = Message(
            conversation_id=chat_request.conversation_id,
            role="assistant",
            user_id=current_user.id,
            content=response_text,
            is_escalation=False
        )
        db.add(ai_message)
    
    db.commit()
    
    return ChatResponse(
        response=response_text,
        conversation_id=chat_request.conversation_id,
        needs_escalation=needs_escalation
    )
