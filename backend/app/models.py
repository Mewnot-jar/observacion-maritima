import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from geoalchemy2 import Geography

from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True)
    display_name = Column(Text)
    avatar_url = Column(Text)
    role = Column(Enum("user", "moderator", name="user_role"), nullable=False, default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Species(Base):
    __tablename__ = "species"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    common_name = Column(Text, nullable=False)
    scientific_name = Column(Text)
    category = Column(
        Enum("ave", "mamifero_marino", "pez", "invertebrado", "alga_flora", "otro", name="species_category"),
        nullable=False,
    )
    description = Column(Text)
    reference_image_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Observation(Base):
    __tablename__ = "observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    species_id = Column(UUID(as_uuid=True), ForeignKey("species.id"))
    category = Column(
        Enum("ave", "mamifero_marino", "pez", "invertebrado", "alga_flora", "otro", name="species_category"),
    )
    observed_at = Column(DateTime(timezone=True), nullable=False)
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    location_name = Column(Text)
    individual_count = Column(String)
    behavior = Column(Text)
    confidence_level = Column(
        Enum("segura", "bastante_segura", "no_segura", name="confidence_level"),
        nullable=False, default="segura",
    )
    conditions = Column(JSONB)
    notes = Column(Text)

    is_alert = Column(Boolean, nullable=False, default=False)
    is_hidden = Column(Boolean, nullable=False, default=False)
    is_verified = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Media(Base):
    __tablename__ = "media"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    observation_id = Column(UUID(as_uuid=True), ForeignKey("observations.id", ondelete="CASCADE"), nullable=False)
    storage_path = Column(Text, nullable=False)
    media_type = Column(Enum("image", "video", name="media_type"), nullable=False, default="image")
    created_at = Column(DateTime(timezone=True), server_default=func.now())