from typing import Dict, List, Any

from fastapi.responses import StreamingResponse

from domain.document_service import DocumentService
from fastapi import BackgroundTasks
from fastapi import UploadFile


class UploadDocumentUseCase:
    def __init__(self, document_service: DocumentService):
        self.document_service = document_service

    async def execute_async(self, file_list: List[UploadFile],background_tasks: BackgroundTasks ) -> List[Dict[str, List[str]]]:
        response = await self.document_service.upload_files_async(file_list)
        all_files = await self.document_service.load_documents_async(response.get('uploaded_files'))
        background_tasks.add_task(self.document_service.store_documents_task_async, all_files)
        return response
         
        #TODO: Future Implement the code that can start task to generate embeddings for all documents in batch

class SearchDocumentsUseCase:
    def __init__(self, document_service: DocumentService):
        self.document_service = document_service

    async def execute_async(self, query: str)-> List[Any]:
        return self.document_service.search_documents(query)
    
    async def search_query_results_async(self, query: str) -> List[Any] :
        results = await self.document_service.search_query_results_async(query)
        return results
    
    async def stream_query_results_async(self, query: str) -> StreamingResponse:
        results = await self.document_service.stream_query_results_async(query)
        return results
    
    async def search_ai_chat_async(self, query: str) -> List[Any]:
        results =  await self.document_service.search_ai_chat_async(query)
        return results
    
    async def stream_ai_chat_async(self, query: str) -> List[Any]:
        results =  await self.document_service.stream_ai_chat_async(query)
        return results
