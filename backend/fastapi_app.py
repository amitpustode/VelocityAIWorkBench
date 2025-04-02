from fastapi import FastAPI, Depends
from adapters.api.document_controller import router
from adapters.api.settings_controller import router as settings_router
from adapters.api.dependencies import get_document_service, get_upload_document_use_case, get_settings_use_case
from adapters.api.dependencies import get_search_documents_use_case, get_bravo_use_case, get_document_service, get_upload_document_use_case, get_settings_use_case
from adapters.api.bravo_controller import router as bravo_router
from adapters.api.dependencies import get_bughunter_service, get_upload_bughunter_use_case
from adapters.api.bughunter_controller import router as bughunter_router

app = FastAPI(
    title="Document Management API",
    description="API for uploading and searching documents using embeddings",
    version="1.0.0"
)

app.include_router(router, prefix="/api", dependencies=[Depends(get_document_service), Depends(get_upload_document_use_case), Depends(get_search_documents_use_case)])
app.include_router(settings_router, prefix="/api/settings", dependencies=[Depends(get_settings_use_case)])
app.include_router(bravo_router, prefix="/api/bravo", dependencies=[Depends(get_bravo_use_case)])
app.include_router(bughunter_router, prefix="/api/bug_hunter", dependencies=[Depends(get_bughunter_service), Depends(get_upload_bughunter_use_case)])