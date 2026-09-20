from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Species
from app.schemas import SpeciesOut

router = APIRouter(prefix="/api/species", tags=["species"])

@router.get("", response_model=list[SpeciesOut])
def list_species(
    q: str | None = Query(default=None, description="Busca por nombre comun o cientifico"),
    category: str | None = Query(default=None, description="Filtra por categoria"),
    db: Session = Depends(get_db),
):
    query = db.query(Species)

    if q:
        pattern = f"%{q}%"
        query = query.filter(
            or_(
                Species.common_name.ilike(pattern),
                Species.scientific_name.ilike(pattern),
            )
        )

    if category:
        query = query.filter(Species.category == category)

    return query.order_by(Species.common_name).limit(20).all()