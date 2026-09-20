from supabase import create_client, Client

from app.config import settings

BUCKET_NAME = "observation-photos"

_client: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)

def upload_photo(observation_id: str, filename: str, content: bytes, content_type: str) -> str:
    path = f"{observation_id}/{filename}"
    _client.storage.from_(BUCKET_NAME).upload(
        path, content, file_options={"content-type": content_type}
    )
    return path

def get_public_url(storage_path: str) -> str:
    return f"{settings.supabase_public_url}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"