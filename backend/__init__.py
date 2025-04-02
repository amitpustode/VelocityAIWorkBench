import logging

# Set up logging for the package
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("Backend package initialized")

__version__ = "1.0.0"

# Convenient imports
from .adapters.ai_provider import EmbeddingClient, KnowledgeBaseSummarizer
from .adapters.database import ChromaDBClient
from .domain.document_service import DocumentService
from .domain.settings_service import SettingsService
from .domain.settings import Config, ConfigJsonItem

__all__ = [
    "EmbeddingClient",
    "KnowledgeBaseSummarizer",
    "ChromaDBClient",
    "DocumentService",
    "SettingsService",
    "Config",
    "ConfigJsonItem",
]