import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ObservationOut(BaseModel):
    id: uuid.UUID
    species_common_name: Optional[str] = None
    observed_at: datetime
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    individual_name: Optional[str] = None
    confidence_level: str
    is_alert: bool
    is_verified: bool
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)