import os
from typing import List

from fastapi.responses import StreamingResponse

from adapters.api.dependencies import get_document_service
from application.use_cases import UploadDocumentUseCase, SearchDocumentsUseCase
from domain.document_service import DocumentService
from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends, Response, UploadFile, File
from domain.logger import logger
# Load environment variables from .env file
#load_dotenv()
router = APIRouter()
UPLOAD_DIRECTORY = "./documents"
MAX_UPLOAD_FILES = 3

@router.post("/upload", response_model=dict)


async def upload_documents_async(background_tasks: BackgroundTasks,
                                 files: List[UploadFile] = File(...), 
                                 document_service: DocumentService = Depends(get_document_service)):
    
    if not os.path.exists(UPLOAD_DIRECTORY):
            os.makedirs(UPLOAD_DIRECTORY)
    try:
        use_case = UploadDocumentUseCase(document_service)
        # if numnber of files in list is more than 3 then rerurn bad request
        if len(files) > MAX_UPLOAD_FILES:
            raise HTTPException(status_code=400, detail="Please do not upload more than 5 files at a time")

        response = await use_case.execute_async(files, background_tasks) # This should be done only once in each upload call and should start generating embeddings in batch
        logger.info("file uploaded successfully")
        return response
    except HTTPException as e:
        # Re-raise HTTPExceptions to preserve their status codes
        raise e
    except Exception as e:
        logger.error(f"Error during file upload: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/search")
async def search_query(query: str, document_service: DocumentService = Depends(get_document_service) ):
    try:
        use_case = SearchDocumentsUseCase(document_service)
        results = await use_case.search_query_results_async(query)
        logger.info("search query response successfully")
        return results
    
    except Exception as e:
        logger.error(f"Error during search: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/stream_search",  response_class=StreamingResponse, responses={200: {"description": "Streaming response"}})
async def stream_query(query: str, document_service: DocumentService = Depends(get_document_service)) -> StreamingResponse:
    try:
        use_case = SearchDocumentsUseCase(document_service)
        results = await use_case.stream_query_results_async(query)
        return results
    
    except Exception as e:
        logger.error(f"Error during search: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/openchat")
async def open_chat(query : str, document_service: DocumentService = Depends(get_document_service)) -> Response:
    try:
        use_case = SearchDocumentsUseCase(document_service)
        results = await use_case.search_ai_chat_async(query)
        return results
    
    except Exception as e:
        logger.error(f"Error during search: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/stream-openchat")
async def stream_open_chat(query : str, document_service: DocumentService = Depends(get_document_service)) -> Response:
    try:
        use_case = SearchDocumentsUseCase(document_service)
        results = await use_case.stream_ai_chat_async(query)
        return results
    
    except Exception as e:
        logger.error(f"Error during search: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))