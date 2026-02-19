from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.user import User, Document
from app.schemas.schemas import DocumentResponse, DocumentCreate
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("/", response_model=List[DocumentResponse])
def get_documents(db: Session = Depends(get_db)):
    documents = db.query(Document).order_by(Document.created_at.desc()).all()
    return documents


@router.post("/", response_model=DocumentResponse)
def create_document(
    document_data: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    document = Document(**document_data.model_dump())
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    db.delete(document)
    db.commit()
    return {"message": "Document deleted successfully"}
