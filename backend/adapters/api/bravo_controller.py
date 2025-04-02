from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from typing import Optional
import os

from requests import request
from adapters.api.dependencies import get_bravo_service
from application.requirements_use_case import RequirementsUseCase
from domain.bravo_service import BravoService
from domain.epic import Epic
from domain.logger import logger
router = APIRouter()
UPLOAD_DIRECTORY = "./documents"

class StoryRequest(BaseModel):
    story_type: str
    language: str
    epic: Epic 
    considerEmbedding: bool = False,

@router.post("/generate_stories")
async def generate_stories(
    request_data: StoryRequest ,
    bravo_service: BravoService = Depends(get_bravo_service)
):
    try:
        print("generate_stories")
        # check if story_type, language and epic should be present in request_data otherwise return bad request.
        
        if not request_data.story_type or not request_data.language or not request_data.epic:
            raise HTTPException(status_code=400, detail=f"Mandatory parameters are missing in request payload")
        
        

        use_case = RequirementsUseCase(bravo_service)
        response = await use_case.generate_stories_async(request_data.epic, request_data.story_type, request_data.language, request_data.considerEmbedding)
        logger.info("generate stories successfully")
        return response
        
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        logger.error(f"An unexpected error occurred : {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
     

@router.post("/generate_requirements")
async def generate_requirements(
    userInput: Optional[str] = Form(...),
    epic_type: str = Form(...),
    language: str = Form(...),
    considerEmbedding: str = Form(...),
    bravo_service: BravoService = Depends(get_bravo_service)
):
    try:
        print("Getting list")
        # create new boolean variable based on value of considerEmbedding, if considerEmbedding  is not presnet then it should be false
        embeddingSupport = False
        if  considerEmbedding and considerEmbedding.lower() == "true":
            embeddingSupport = True
       
        use_case = RequirementsUseCase(bravo_service)
        response = await use_case.generate_requirements_async(userInput, epic_type, language, embeddingSupport)
        logger.info("generate requirements successfully")
        return response
        
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        logger.error(f"An unexpected error occurred generate requirements: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")



@router.post("/generate_presice_requirements")
async def generate_presice_requirements(
    epic_type: str = Form(...),
    language: str = Form(...),
    file: Optional[UploadFile] = File(...),
    bravo_service: BravoService = Depends(get_bravo_service)
):
    try:
        print("Generating requirements")
        
        use_case = RequirementsUseCase(bravo_service)
       
        #TODO: change file location and delete file after receving resposne
        file_location  = os.path.join(UPLOAD_DIRECTORY, file.filename)
        with open(file_location, "wb") as f:
                f.write(await file.read())
                print(f"File saved to {file_location}")
        
        response = await use_case.generate_precise_requirements_async(file_location, epic_type, language)
        logger.info("generate presice requirements successfully")
        return response
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        logger.error(f"An unexpected error occurred at generate_presice_requirements: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")