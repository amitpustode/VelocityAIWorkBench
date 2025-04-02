from typing import List
from domain.bughunter_service import BughunterService
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from application.bughunter_use_case import SearchBughunterUseCase, UploadBughunterUseCase
from domain.settings_service import SettingsService
from adapters.ai_provider import EmbeddingClient, KnowledgeBaseSummarizer
from adapters.database.repository import ChromaDBClient

router = APIRouter()
MAX_UPLOAD_FILES = 1

def bughunter_service_reset():
    settings_service = SettingsService()
    default_embedding_provider = settings_service.get_default_embedding_provider()
    embedding_provider = settings_service.get_embedding_model_provider()
    summarizer_provider = settings_service.get_ai_model_provider()
    ai_client = EmbeddingClient(embedding_provider.endpoint, embedding_provider.apiKey, embedding_provider.model, default_embedding_provider)
    db_client = ChromaDBClient(ai_client)
    ai_summarizer = KnowledgeBaseSummarizer(summarizer_provider.endpoint, summarizer_provider.apiKey, summarizer_provider.model)
    return BughunterService(ai_client, db_client, ai_summarizer, settings_service)

@router.get("/search")
async def search_ticket(query: str,
                        bughunter_service: SearchBughunterUseCase = Depends(bughunter_service_reset) ):
    try:
        use_case = SearchBughunterUseCase(bughunter_service)
        results = await use_case.search_similar_ticket_async(query)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=300, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=402, detail=str(e))
    
@router.post("/upload", response_model=dict)
async def upload_documents_async(files: List[UploadFile] = File(...), 
                                 bughunter_service: UploadBughunterUseCase = Depends(bughunter_service_reset)):
    try:
        use_case = UploadBughunterUseCase(bughunter_service)
        # if number of files in list is more than 1 then rerun bad request
        if len(files) > MAX_UPLOAD_FILES:
            raise HTTPException(status_code=400, detail="Please do not upload more than 1 files at a time")
        response = await use_case.execute_async_bughunter(files) # This should be done only once in each upload call and should start generating embeddings in batch
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=300, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=402, detail=str(e))