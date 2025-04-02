from domain.bughunter_service import BughunterService
from typing import Dict, List, Any
from fastapi import UploadFile

class UploadBughunterUseCase:
    def __init__(self, bughunter_service: BughunterService):
        self.bughunter_service = bughunter_service

    async def execute_async_bughunter(self, file_list: List[UploadFile] ) -> List[Dict[str, List[str]]]:

        print(file_list)
        response = await self.bughunter_service.upload_files_async(file_list) 
        if "status" in response:
            return response
        print(response)
        uploaded_files = response.get('uploaded_files')
        print(uploaded_files)
        csv_uploaded = []
        for file_name in uploaded_files:
            if file_name.lower().endswith('.csv'):
                csv_uploaded.append(file_name) 
        if csv_uploaded is not []:
            response = await self.bughunter_service.load_csv_async(csv_uploaded)
            if isinstance(response, str):
                return {"status": response}
            response = await self.bughunter_service.store_csv_task_async(response) 
        response = {"status": response}
        return response

class SearchBughunterUseCase:
    def __init__(self, bughunter_service: BughunterService):
        self.bughunter_service = bughunter_service
    
    async def search_similar_ticket_async(self, query: str) -> List[Any]:
        results = await self.bughunter_service.search_similar_ticket_async(query)
        return results