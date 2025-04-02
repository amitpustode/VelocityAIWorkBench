import os
from fastapi.responses import JSONResponse
from langchain_text_splitters import RecursiveCharacterTextSplitter
import requests
from adapters.ai_provider.ai_client import EmbeddingClient
from adapters.database.repository import ChromaDBClient
from adapters.ai_provider.ai_summarizer import KnowledgeBaseSummarizer
from domain.epic import Epic
from domain.settings_service import SettingsService
from domain.utils import Utils
from .file_loaders.document_loader import DocumentLoader
from fastapi import HTTPException, UploadFile
from typing import List, Dict, Tuple
import logging
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import ast
import asyncio
import json
from prompts.prompt_loader import PromptLoader
from domain.logger import logger
from langchain.docstore.document import Document

DOCUMENTS_FOLDER = "./documents"

class BravoService:
    def __init__(self, db_client: ChromaDBClient, summarizer_client: KnowledgeBaseSummarizer, ai_client: EmbeddingClient, settings_Service: SettingsService):
        self.db_client = db_client
        self.summarizer_client = summarizer_client
        self.ai_client = ai_client  
        self.file_loader = DocumentLoader()
        self.prompt_loader = PromptLoader()
        self.settingsService = settings_Service
        config = self.settingsService.get_config()
        self.provider = config.provider.lower() if config and config.provider else None
        self.prompt_loader.set_default_provider(self.provider)

    async def  build_user_promt_for_story(self, epic: Epic, story_type: str, language: str, matching_text : str) -> Dict[str, str]:
        print('build_user_promt_for_story')
        try:


            prompt_template = self.prompt_loader.get_prompt("BUILD_USER_PROMPT_FOR_STORY", self.provider)
            userPrompt = {
                "role": "user",
                "content": prompt_template.format(epic=epic, story_type=story_type, language=language,matching_text=matching_text)
            }

            return userPrompt

        except Exception as e:
            print(f"An unexpected error occurred while building user prompts: {e}")
            logger.error(f"An unexpected error occurred while build_user_promt_for_story: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


        

    async def build_system_promt_for_story(self, epic: Epic, story_type: str) -> Dict[str, str]:
        print('build_system_promt_for_story')
        try:


            prompt_template = self.prompt_loader.get_prompt("SYSTEM_PROMPT_FOR_STORY", self.provider)
            systemPrompt = {
                "role": "system",
                "content": prompt_template.format(epic=epic, story_type=story_type)
            }
            return systemPrompt




        except Exception as e:
            print(f"An unexpected error occurred whild building system prompts: {e}")
            logger.error(f"An unexpected error occurred while build_system_promt_for_story: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

    async def build_user_promt(self, query: str, epic_type: str, language: str) -> Dict[str, str]:
        """
        Builds a user prompt containing the epic_type and query,
        instructing the AI to produce EPIC details in a tabular format.
        """
        print("build_user_promt")
        try:

            prompt_template = self.prompt_loader.get_prompt("BUILD_USER_PROMPT", self.provider)
            userPrompt = {
                "role": "user",
                "content": prompt_template.format(epic_type=epic_type, query=query, language=language)
            }

            return userPrompt

        except Exception as e:
            print(f"An unexpected error occurred while building user prompts: {e}")
            logger.error(f"An unexpected error occurred while building build_user_promt_for_ollama: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")



    async def build_system_promt(self) -> Dict[str, str]:
        """
        Builds a system prompt acting like a product owner, outputting JSON with EPIC details.
        """
        print("build_system_promt")
        try:


            prompt_template = self.prompt_loader.get_prompt("SYSTEM_PROMPT", self.provider)
            systemPrompt = {
                "role": "system",
                "content": prompt_template
            }
            return systemPrompt

        except Exception as e:
            print(f"An unexpected error occurred whild building system prompts: {e}")
            logger.error(f"An unexpected error occurred whild building system prompts:: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

    async def post_requrements_async() -> None:
        """
        (Stub) Demonstrates a placeholder for posting requirements elsewhere if needed.
        """
        try:
            print("Posting requirements")
            headers =  { 'Content-Type': 'application/json' }
           
        except Exception as e:
            logger.error(f"An unexpected error occurred : {str(e)}", exc_info=True)
            print(f"An unexpected error occurred: {e}")

    def normalize_response_stories(self, response):
                data = json.loads(response)
                possible_keys = ["STORY", "stories", "Stories", "STORIES"]

                for key in possible_keys:
                    if key in data:
                        return json.dumps({ "story": data[key] })  # Normalize key to "Epic"
                    
    def normalize_response(self, response):
                
                data = json.loads(response)
                possible_keys = ["EPIC", "epics", "Epics", "EPICS"]

                for key in possible_keys:
                    if key in data:
                        return json.dumps({ "Epic": data[key] })  # Normalize key to "Epic"

                raise ValueError("No valid EPIC key found in response")

    async def generate_stories_async(self, epic: Epic,  story_type: str, language: str, considerEmbedding: bool) -> JSONResponse:
        print("Generating stories")
        try:
            
            isLookupSet = self.settingsService.get_config().lookupChecked

            summary = ""
            combined_text = ""

            try:
                if isLookupSet and considerEmbedding is True:
                    query_embeddings = self.ai_client.get_embedding_function().embed_query(epic.epic_title + " " + epic.epic_description)
                    if query_embeddings:
                        results = self.db_client.collection.similarity_search_by_vector(query_embeddings, k=10)
                        if results:
                            logger.info("results found")
                            similarity_threshold = 0.50
                            query_vector = np.array(query_embeddings).reshape(1, -1)

                            filtered_results = []
                            for doc in results:
                                doc_embedding = np.array(ast.literal_eval(doc.metadata['embedding'])).reshape(1, -1)
                                similarity = cosine_similarity(query_vector, doc_embedding)[0][0]
                                if similarity >= similarity_threshold:
                                    filtered_results.append((doc, similarity))

                        
                            if filtered_results:
                                # Sort by similarity descending
                                filtered_results.sort(key=lambda x: x[1], reverse=True)
                                for result in filtered_results:
                                    combined_text += result[0].page_content

                                summary = self.summarizer_client.summarize_text(combined_text, epic.epic_title + " " + epic.epic_description)

            except Exception as e:
                print(f"An unexpected error occurred while geting document context while builing stories: {e}")
                logger.error(f"An unexpected error occurred while geting document context while builing stories : {str(e)}", exc_info=True)
                # do not throw error as even if it failed to get detaild context it should be able to generate requirements based on given input
                    

                        
            user_prompt = await self.build_user_promt_for_story(epic, story_type, language, summary)
            system_prompt = await self.build_system_promt_for_story(epic, story_type)

            # Summarize/Generate final "requirements" using the LLM
            response = await self.summarizer_client.generate_requirements_async(user_prompt, system_prompt)
            # Clean up response 
            response = response.replace('json\n','')
            response = response.strip().strip('```')
            normalized_response = self.normalize_response_stories(response)
            if normalized_response:
                return normalized_response
            return response


        except json.JSONDecodeError as e:
            print(f"Failed to decode JSON: {e}")
            logger.error(f"Failed to decode JSON : {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail="Invalid JSON response received")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            logger.error(f"An unexpected error occurred : {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
        
        
    def extract_text_from_file(self, file_path: str) -> List[str]:
        """Extract text (by pages) from the file using the corresponding loader."""
        try:
            loader = self.file_loader.get_loader(file_path)  # Get the correct loader based on file type
            loaded_docs = loader.load()
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                separators=["\n\n", "\n", " ", ""],
            )
            splitted_docs = []
            for doc in loaded_docs:
                chunks = text_splitter.split_text(doc.page_content)
                for chunk in chunks:
                    splitted_docs.append(Document(page_content=chunk, metadata=doc.metadata))
            return [doc.page_content for doc in splitted_docs]
        except Exception as e:
            logger.error(f"An error occurred while extracting text from file: {file_path}")
            return []
    
    async def  generate_requirements_async(self, query: str, file_path: str, epic_type: str, language: str, considerEmbedding: bool) -> JSONResponse:
        """
        Gathers relevant info (query or file), performs a search in your knowledge base,
        then uses the summarizer to generate an EPIC requirements JSON.
        Returns a JSON string that includes EPIC details in the specified format.
        """
        print("Generating requirements")
        try:
            if not query and not file_path:
                raise HTTPException(status_code=400, detail="Please provide either query or file")
            
            isLookupSet = self.settingsService.get_config().lookupChecked 

            # If a file is provided, load it and treat its entire contents as the query
            if file_path:
                file_extension = os.path.splitext(file_path)[1].lower()
                loader = self.file_loader.get_loader(file_extension)
                loader.load_file(file_path)
                file_contents = loader.get_page_contents()
                query = " ".join(file_contents)

            searched_file_name = ""
            summary = ""
            requirements_details = ""

            try:
                
                # RAG: Load whole document if embeddigns and bravo  YY
                if isLookupSet and considerEmbedding:
                    searched_file_name, filtered_results = await self.search_requirements_in_documents(query)
                    
                    if searched_file_name:
                        file_extension = os.path.splitext(searched_file_name)[1].lower()
                        
                        file_extension = file_extension.split('_')[0]
                        searched_file_name = os.path.splitext(searched_file_name)[0]
                        file_path = os.path.join(DOCUMENTS_FOLDER, searched_file_name+file_extension)
                        #loader = self.file_loader.get_loader(file_path)
                        
                        #file_path = os.path.join(DOCUMENTS_FOLDER, searched_file_name+file_extension)
                       
                        file_contents = await asyncio.to_thread(self.extract_text_from_file, file_path)
                        #loader.load_file(file_path)
                        #file_contents = loader.get_page_contents()

                        
                        for page_content in file_contents:
                            requirements_details += Utils.clean_text(self, page_content) 
                        
                        if len(requirements_details) > Utils.max_token_length:
                            requirements_details = ""
                            for result in filtered_results:
                                requirements_details += result[0].page_content
                            requirements_details = Utils.clean_text(self, requirements_details)

                        summary = self.summarizer_client.summarize_text(requirements_details, "Provide a comprehensive summary of this text. The summary should be detailed and cover all relavant aspects of the text.")
                
                # load matching context if embedings is not checked but bravo is checked NY
                elif isLookupSet is False and considerEmbedding is True: 
                    searched_file_name, filtered_results = await self.search_requirements_in_documents(query)

                    if filtered_results:
                        
                        for result in filtered_results:
                            requirements_details += Utils.clean_text(self, result[0].page_content)

                        print(f"Document details: {requirements_details}")
                        summary = self.summarizer_client.summarize_text(requirements_details, "Provide a comprehensive summary of this text. The summary should be detailed and cover all relavant aspects of the text.")
                
            except requests.exceptions.RequestException as reqException:
                logger.error(f"An unexpected error occurred: {reqException}")
            except Exception as e:
                print(f"An unexpected error occurred while geting document context while builing requirements: {e}")
                logger.error(f"An unexpected error occurred : {str(e)}", exc_info=True)
                # do not throw error as even if it failed to get detaild context it should be able to generate requirements based on given input
                
            # Not embeddings or bravo are not chekced (NN) OR Embeddings Checked but Bravo not checked  (YN) in such case it will be empty summary
            # Combine original query with retrieved context (if any)
            user_query = query if not summary else query + " \n " + summary
            
            # Build user & system prompts

            
            user_prompt = await self.build_user_promt(user_query, epic_type, language)

            system_prompt = await self.build_system_promt()

            # Summarize/Generate final "requirements" using the LLM
            response = await self.summarizer_client.generate_requirements_async(user_prompt, system_prompt)
            print(response)
            # Clean up response 
            response = response.replace('json\n','')
            response = response.strip().strip('```')
            response_json = json.loads(response)  # raises JSONDecodeError if invalid
            #normalized_response = self.normalize_response(response)
            return json.dumps(response_json)

        except json.JSONDecodeError as e:
            print(f"Failed to decode JSON: {e}")
            logger.error(f"An unexpected error occurred : {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail="Invalid JSON response received")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            logger.error(f"An unexpected error occurred : {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

    async def search_requirements_in_documents(self, query: str) -> Tuple[str, List[Tuple]]:
        """
        1) Splits query into smaller chunks if needed.
        2) Gets embeddings for each chunk, then averages them into a single vector.
        3) Performs a top-k similarity search in the DB, filters by threshold.
        4) Combines matched pages from the best-matching document into one text.
        5) Returns that text so it can be appended to the user’s query.
        """
        try:
            # Break the query into smaller chunks if it's too large
            chunk_size = 2048
            query_chunks = [query[i:i + chunk_size] for i in range(0, len(query), chunk_size)]

            # Collect embeddings for each chunk
            embedding_arrays = []
            for chunk in query_chunks:
                chunk_embeddings =  self.ai_client.get_embedding_function().embed_query(chunk)
                if chunk_embeddings:
                    # chunk_embeddings is presumably a single vector or a 1D list
                    embedding_arrays.append(np.array(chunk_embeddings))

            # If no embedding arrays were generated, we cannot search
            if not embedding_arrays:
                logger.error("Failed to get query embeddings")
                return ""

            # Average all chunk embeddings to get a single vector
            query_embedding = np.mean(embedding_arrays, axis=0)

            # Vector search in Chroma
            results = self.db_client.collection.similarity_search_by_vector(query_embedding.tolist(), k=50)
            if not results:
                logger.info("No results found")
                return "", []

            # Filter by similarity threshold
            similarity_threshold = 0.30
            query_vector = query_embedding.reshape(1, -1)

            filtered_results = []
            for doc in results:
                doc_embedding = np.array(ast.literal_eval(doc.metadata['embedding'])).reshape(1, -1)
                similarity = cosine_similarity(query_vector, doc_embedding)[0][0]
                if similarity >= similarity_threshold:
                    filtered_results.append((doc, similarity))

            if not filtered_results:
                logger.info("No results found above threshold")
                # return empty file name and empty filtered_results
                return "", []

            # Sort descending by similarity
            filtered_results.sort(key=lambda x: x[1], reverse=True)
            first_result_filename = os.path.splitext(filtered_results[0][0].metadata['filename'])[0].lower()

            filtered_results = [
                result for result in filtered_results 
                if os.path.splitext(result[0].metadata['filename'])[0].lower() == first_result_filename
            ]

            # The logic here: gather the top doc's filename, then combine all chunks from that same file
            first_item_filename = filtered_results[0][0].metadata['filename']
            return first_item_filename , filtered_results
        
       
        except requests.exceptions.RequestException as reqException:
            logger.error(f"An unexpected error occurred: {reqException}")
            raise reqException
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            logger.error(f"An unexpected error occurred : {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
            