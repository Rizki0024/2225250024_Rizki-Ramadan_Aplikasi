from app.core.config import Settings

from .base import Repository, RepositoryUnavailable


def build_repository(settings: Settings) -> Repository:
    if settings.storage_mode == "supabase":
        from .supabase import SupabaseRepository

        return SupabaseRepository(settings.supabase_url, settings.supabase_secret_key)
    from .local import LocalRepository

    return LocalRepository(settings.local_data_dir)


__all__ = ["Repository", "RepositoryUnavailable", "build_repository"]
