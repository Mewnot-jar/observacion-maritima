from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape

from app.database import get_db
from app.models import Observation, Species
from app.schemas import ObservationOut

router = APIRouter(prefix="/api/observations", tags=["observations"])

@router.get("", response_model=list[ObservationOut])
def list_observations(db: Session = Depends(get_db)):
    results = (
        db.query(Observation, Species.common_name)
        .outerjoin(Species, Observation.species_id == Species.id)
        .filter(Observation.is_hidden.is_(False))
        .order_by(Observation.observed_at.desc())
        .limit(50)
        .all()
    )

    feed = []

    for obs, species_name in results:
        point = to_shape(obs.location)
        feed.append(ObservationOut(
            id=obs.id,
            species_common_name=species_name,
            observed_at=obs.observed_at,
            latitude=point.y,
            longitude=point.x,
            location_name=obs.location_name,
            individual_count=obs.individual_count,
            confidence_level=obs.confidence_level,
            is_alert=obs.is_alert,
            is_verified=obs.is_verified,
            notes=obs.notes,
        ))
    return feed