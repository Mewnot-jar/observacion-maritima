from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape, from_shape
import uuid as uuid_lib
from shapely.geometry import Point

from app.database import get_db
from app.models import Observation, Species
from app.schemas import ObservationOut, ObservationCreate
from app.auth import get_current_user, CurrentUser

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

@router.post("", response_model=ObservationOut, status_code=201)
def create_observation(
    payload: ObservationCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    point = from_shape(Point(payload.longitude, payload.latitude), srid=4326)

    observation = Observation(
        id=uuid_lib.uuid4(),
        user_id=current_user.id,
        species_id=payload.species_id,
        observed_at=payload.observed_at,
        location=point,
        location_name=payload.location_name,
        individual_count=payload.individual_count,
        confidence_level=payload.confidence_level,
        conditions=payload.conditions,
        notes=payload.notes,
        is_alert=payload.is_alert,
    )
    db.add(observation)
    db.commit()
    db.refresh(observation)

    species_name = None
    if observation.species_id:
        species = db.query(Species).filter(Species.id == observation.species_id).first()
        species_name = species.common_name if species else None

    return ObservationOut(
        id=observation.id,
        species_common_name=species_name,
        observed_at=observation.observed_at,
        latitude=payload.latitude,
        longitude=payload.longitude,
        location_name=observation.location_name,
        individual_count=observation.individual_count,
        confidence_level=observation.confidence_level,
        is_alert=observation.is_alert,
        is_verified=observation.is_verified,
        notes=observation.notes,
    )