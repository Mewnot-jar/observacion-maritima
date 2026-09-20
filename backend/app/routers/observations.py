from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape, from_shape
from shapely.geometry import Point
import uuid as uuid_lib

from app.database import get_db
from app.models import Observation, Species, Profile, Media
from app.schemas import ObservationOut, ObservationCreate, MediaOut
from app.auth import get_current_user, CurrentUser
from app.storage import upload_photo, get_public_url

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

    observation_ids = [obs.id for obs, _ in results]
    media_by_observation: dict[uuid_lib.UUID, list[Media]] = defaultdict(list)
    if observation_ids:
        for m in db.query(Media).filter(Media.observation_id.in_(observation_ids)).all():
            media_by_observation[m.observation_id].append(m)

    feed = []
    for obs, species_name in results:
        point = to_shape(obs.location)
        feed.append(ObservationOut(
            id=obs.id,
            species_common_name=species_name,
            category=obs.category,
            observed_at=obs.observed_at,
            latitude=point.y,
            longitude=point.x,
            location_name=obs.location_name,
            individual_count=obs.individual_count,
            behavior=obs.behavior,
            confidence_level=obs.confidence_level,
            is_alert=obs.is_alert,
            is_verified=obs.is_verified,
            notes=obs.notes,
            media=[
                MediaOut(id=m.id, url=get_public_url(m.storage_path), media_type=m.media_type)
                for m in media_by_observation.get(obs.id, [])
            ],
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
        category=payload.category,
        observed_at=payload.observed_at,
        location=point,
        location_name=payload.location_name,
        individual_count=payload.individual_count,
        behavior=payload.behavior,
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
        category=observation.category,
        observed_at=observation.observed_at,
        latitude=payload.latitude,
        longitude=payload.longitude,
        location_name=observation.location_name,
        individual_count=observation.individual_count,
        behavior=observation.behavior,
        confidence_level=observation.confidence_level,
        is_alert=observation.is_alert,
        is_verified=observation.is_verified,
        notes=observation.notes,
    )
@router.get("/{observation_id}", response_model=ObservationOut)
def get_observation(observation_id: uuid_lib.UUID, db: Session = Depends(get_db)):
    result = (
        db.query(Observation, Species.common_name, Species.scientific_name, Profile.display_name)
        .outerjoin(Species, Observation.species_id == Species.id)
        .outerjoin(Profile, Observation.user_id == Profile.id)
        .filter(Observation.id == observation_id, Observation.is_hidden.is_(False))
        .first()
    )

    if not result:
        raise HTTPException(status_code=404, detail="Observación no encontrada")

    obs, species_name, species_scientific, reporter_name = result
    point = to_shape(obs.location)

    media_rows = db.query(Media).filter(Media.observation_id == observation_id).all()

    return ObservationOut(
        id=obs.id,
        species_common_name=species_name,
        species_scientific_name=species_scientific,
        category=obs.category,
        observed_at=obs.observed_at,
        latitude=point.y,
        longitude=point.x,
        location_name=obs.location_name,
        individual_count=obs.individual_count,
        behavior=obs.behavior,
        confidence_level=obs.confidence_level,
        is_alert=obs.is_alert,
        is_verified=obs.is_verified,
        notes=obs.notes,
        reporter_name=reporter_name,
        media=[
            MediaOut(id=m.id, url=get_public_url(m.storage_path), media_type=m.media_type)
            for m in media_rows
        ],
    )

@router.post("/{observation_id}/media", response_model=MediaOut, status_code=201)
async def upload_observation_media(
    observation_id: uuid_lib.UUID,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    observation = db.query(Observation).filter(Observation.id == observation_id).first()
    if not observation:
        raise HTTPException(status_code=404, detail="Observación no encontrada")
    if str(observation.user_id) != current_user.id:
        raise HTTPException(status_code=403, detail="No puedes agregar fotos a una observación que no es tuya")

    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Formato no soportado. Usa JPEG, PNG o WebP")

    content = await file.read()
    if len(content) > 8 * 1024 * 1024:  # 8 MB
        raise HTTPException(status_code=400, detail="La imagen no puede superar los 8 MB")

    extension = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{uuid_lib.uuid4()}.{extension}"
    storage_path = upload_photo(str(observation_id), filename, content, file.content_type)

    media = Media(
        id=uuid_lib.uuid4(),
        observation_id=observation_id,
        storage_path=storage_path,
        media_type="image",
    )
    db.add(media)
    db.commit()
    db.refresh(media)

    return MediaOut(id=media.id, url=get_public_url(storage_path), media_type=media.media_type)