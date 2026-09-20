import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ObservationOut(BaseModel):
    id: uuid.UUID
    species_common_name: Optional[str] = None
    category: Optional[str] = None
    observed_at: datetime
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    individual_count: Optional[str] = None
    behavior: Optional[str] = None
    confidence_level: str
    is_alert: bool
    is_verified: bool
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ObservationCreate(BaseModel):
    species_id: Optional[uuid.UUID] = None
    category: Optional[str] = None
    observed_at: datetime
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    individual_count: Optional[str] = None
    behavior: Optional[str] = None
    confidence_level: str = "segura"
    conditions: Optional[dict] = None
    notes: Optional[str] = None
    is_alert: bool = False

class SpeciesOut(BaseModel):
    id: uuid.UUID
    common_name: str
    scientific_name: Optional[str] = None
    category: str

    model_config = ConfigDict(from_attributes=True)