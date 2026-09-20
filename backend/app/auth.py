from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
from jwt import PyJWKClient

from app.config import settings
from app.database import get_db
from app.models import Profile


bearer_scheme = HTTPBearer()

_jwks_client = PyJWKClient(f"{settings.supabase_url}/auth/v1/.well-known/jwks.json")

class CurrentUser:
    def __init__(self, id: str):
        self.id = id

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> CurrentUser:
    token = credentials.credentials
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated"
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado"
        )
    return CurrentUser(id=payload["sub"])

def require_moderator(
        current_user: CurrentUser = Depends(get_current_user),
        db: Session = Depends(get_db),
) -> CurrentUser:
    profile = db.query(Profile).filter(Profile.id == current_user.id).first()
    if not profile or profile.role != "moderator":
        raise HTTPException(status_code=403, detail="Requiere permisos de moderador")
    return current_user