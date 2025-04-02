from domain.bravo_service import BravoService
from domain.epic import Epic


class RequirementsUseCase:
    def __init__(self, service: BravoService):
        self.service = service

    async def generate_stories_async(self, epic:Epic,  story_type:str, language:str, considerEmbedding: bool) -> None:

        response = await self.service.generate_stories_async(epic,  story_type, language, considerEmbedding)
        return response

    async def generate_requirements_async(self, query:str,  epic_type:str, language:str, considerEmbedding: bool) -> None:

        response = await self.service.generate_requirements_async(query, '', epic_type, language, considerEmbedding)
        return response

    async def generate_precise_requirements_async(self,  file_path: str, epic_type:str, language:str) -> None:

        response = await self.service.generate_requirements_async('', file_path, epic_type, language)
        return response