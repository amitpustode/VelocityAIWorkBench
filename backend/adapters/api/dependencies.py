import os
from adapters.ai_provider import EmbeddingClient, KnowledgeBaseSummarizer
from application.settings_use_case import SettingsUseCase
from adapters.database.repository import ChromaDBClient
from domain.document_service import DocumentService
from domain.settings_service import SettingsService
from domain.settings import ConfigJsonItem
from application.use_cases import UploadDocumentUseCase, SearchDocumentsUseCase
from application.bughunter_use_case import UploadBughunterUseCase, SearchBughunterUseCase
from domain.logger import Logger
from domain.bravo_service import BravoService
from domain.bughunter_service import BughunterService
from application.requirements_use_case import RequirementsUseCase

DOCUMENTS_FOLDER = "./documents"

document_service = None
document_service = None
embedding_provider = None
summarizer_provider = None
db_client = None
ai_client = None
ai_summarizer = None
upload_use_case = None
search_use_case = None

def reset_dependencies():
    global document_service, embedding_provider, summarizer_provider, db_client, ai_client, ai_summarizer, upload_use_case, search_use_case, requirements_use_case, bravo_service, upload_bughunter_use_case, search_bughunter_use_case

    document_service = None
    embedding_provider = None
    summarizer_provider = None
    db_client = None
    ai_client = None
    ai_summarizer = None
    upload_use_case = None
    search_use_case = None
    requirements_use_case = None
    bravo_service = None
    default_embedding_provider = None
    upload_bughunter_use_case = None
    search_bughunter_use_case = None


    settings_service = SettingsService()
    default_embedding_provider = settings_service.get_default_embedding_provider()
    embedding_provider = settings_service.get_embedding_model_provider()
    summarizer_provider = settings_service.get_ai_model_provider()

    ai_client = EmbeddingClient(embedding_provider.endpoint, embedding_provider.apiKey, embedding_provider.model, default_embedding_provider)
    db_client = ChromaDBClient(ai_client)
    ai_summarizer = KnowledgeBaseSummarizer(summarizer_provider.endpoint, summarizer_provider.apiKey, summarizer_provider.model, settings_service)
    
    document_service = DocumentService(ai_client, db_client, ai_summarizer, settings_service)
    bravo_service = BravoService(db_client, ai_summarizer, ai_client, settings_service)
    bughunter_service = BughunterService(ai_client, db_client, ai_summarizer, settings_service)

    upload_use_case = UploadDocumentUseCase(document_service)
    search_use_case = SearchDocumentsUseCase(document_service)
    requirements_use_case = RequirementsUseCase(bravo_service)
    upload_bughunter_use_case = UploadBughunterUseCase(bughunter_service)
    search_bughunter_use_case = SearchBughunterUseCase(bughunter_service)


# Initialize logger
log_service = Logger()
logger = log_service.get_logger()

if not os.path.exists(DOCUMENTS_FOLDER):
    os.makedirs(DOCUMENTS_FOLDER)

settings_service = SettingsService()
default_embedding_provider = settings_service.get_default_embedding_provider()
embedding_provider = settings_service.get_embedding_model_provider()
summarizer_provider = settings_service.get_ai_model_provider()

ai_client = EmbeddingClient(embedding_provider.endpoint, embedding_provider.apiKey, embedding_provider.model, default_embedding_provider)
db_client = ChromaDBClient(ai_client)
ai_summarizer = KnowledgeBaseSummarizer(summarizer_provider.endpoint, summarizer_provider.apiKey, summarizer_provider.model, settings_service)
document_service = DocumentService(ai_client, db_client, ai_summarizer, settings_service)
bravo_service = BravoService(db_client, ai_summarizer, ai_client, settings_service )
bughunter_service = BughunterService(ai_client, db_client, ai_summarizer, settings_service)


upload_use_case = UploadDocumentUseCase(document_service)
search_use_case = SearchDocumentsUseCase(document_service)
requirements_use_case = RequirementsUseCase(bravo_service)
upload_bughunter_use_case = UploadBughunterUseCase(bughunter_service)
search_bughunter_use_case = SearchBughunterUseCase(bughunter_service)

def get_bravo_use_case():
    return requirements_use_case

def get_bravo_service() -> BravoService:
    return bravo_service


def get_document_service() -> DocumentService:
    return document_service

def get_embedding_provider() -> ConfigJsonItem:
    return embedding_provider

def get_summarizer_provider() -> ConfigJsonItem:
    return summarizer_provider

def get_settings_service() -> SettingsService:
    return settings_service

def get_upload_document_use_case():
    return upload_use_case

def get_search_documents_use_case():
    return search_use_case

def get_settings_use_case():
    service = SettingsService()
    return SettingsUseCase(service)

def update_document_service(new_document_service: DocumentService):
    global document_service
    document_service = new_document_service

def get_bughunter_service() -> BughunterService:
    return bughunter_service

def get_upload_bughunter_use_case():
    return upload_bughunter_use_case

def get_search_bughunter_use_case():
    return search_bughunter_use_case

model_provider = get_embedding_provider()
summarizer_provider = get_summarizer_provider()
