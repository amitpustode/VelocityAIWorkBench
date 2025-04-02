import ast
import asyncio
import hashlib
import logging
import os
import time
import traceback
from typing import Dict, List, Tuple

import aiofiles
from fastapi.responses import StreamingResponse
import numpy as np
import requests
from adapters.ai_provider.ai_client import EmbeddingClient
from adapters.ai_provider.ai_summarizer import KnowledgeBaseSummarizer
from adapters.database.repository import ChromaDBClient
from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile
from sklearn.metrics.pairwise import cosine_similarity
from domain.settings_service import SettingsService
from validators.file_validator import FileValidator

from .file_loaders.document_loader import DocumentLoader
from .utils import Utils
from domain.logger import logger
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document

load_dotenv()
AZURE_SUMMERIZE_ENDPOINT = os.getenv("AZURE_SUMMERIZE_ENDPOINT")
AZURE_SUMMERIZE_KEY = os.getenv("AZURE_SUMMERIZE_KEY")

UPLOAD_DIRECTORY = "./documents"
DOCUMENTS_FOLDER = "./documents"



class DocumentService:
    def __init__(
        self, 
        ai_client: EmbeddingClient,
        db_client: ChromaDBClient, 
        summarizer_client: KnowledgeBaseSummarizer,
        settings_Service: SettingsService
    ):
        self.ai_client = ai_client
        self.db_client = db_client
        self.summarizer_client = summarizer_client
        self.file_loader = DocumentLoader()
        self.file_validator = FileValidator()
        self.settingsService = settings_Service

    def generate_document_hash(self, text: str) -> str:
        """Generates a SHA256 hash for the given text."""
        return hashlib.sha256(text.encode('utf-8')).hexdigest()

    def generate_file_hash(self, filename: str) -> str:
        """Generates a SHA256 hash for the contents of a file."""
        file_path = os.path.join(UPLOAD_DIRECTORY, filename)
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()

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
            logger.error(f"An error occurred while extracting text from file: {file_path}", exc_info=True)
            return []

    async def store_documents_task_async(self, documents: List[str]) -> None:
        """Creates an async task to process and store documents in the DB."""
        asyncio.create_task(self.process_document(documents))

    async def process_document(self, documents: List[str]) -> None:
        """
        Processes each document in the list:
         - Checks if document is already in the collection and unchanged (via hash).
         - If new or changed, extracts text, embeds, and stores in the DB.
        """
        for filename in documents:
            print(f"Generating hash for file: {filename}")
            try:
                document_hash = await asyncio.to_thread(self.generate_file_hash, filename)
                collection = self.db_client.get_collection()
                existing_docs = await asyncio.to_thread(collection.get, ids=[filename])
                existing_doc_metadata = existing_docs['metadatas']

                if (
                    len(existing_doc_metadata) > 0 
                    and existing_docs['metadatas'][0]['hash'] == document_hash
                ):
                    logger.info(f"Document already stored and unchanged: {filename}")
                    continue
        
            except Exception as e:
                logger.error(f"An error occurred while querying the collection: {str(e)}", exc_info=True)
                continue

            start_time = time.time()
            file_path = os.path.join(DOCUMENTS_FOLDER, filename)
            text_per_page = await asyncio.to_thread(self.extract_text_from_file, file_path)

            # Prepare batch lists
            all_embeddings = []
            all_ids = []
            all_documents = []
            all_metadatas = []

            for i, page_text in enumerate(text_per_page):
                embedding_function = self.ai_client.get_embedding_function()
                embeddings = embedding_function.embed_query(page_text)
                if embeddings:
                    all_embeddings.append(embeddings)
                    all_ids.append(f"{filename}_{i}")
                    all_documents.append(page_text)
                    all_metadatas.append({
                        "filename": f"{filename}_{i}",
                        "hash": document_hash,
                        "page_number": i + 1,
                        "embedding": str(embeddings)
                    })

                    # Store in DB (batch by page)
                    if all_embeddings:
                        collection = self.db_client.get_collection()
                        await asyncio.to_thread(
                            collection._collection.add,
                            ids=all_ids,
                            documents=all_documents,
                            embeddings=all_embeddings,
                            metadatas=all_metadatas
                        )

                    # Clear the batch lists
                    all_embeddings.clear()
                    all_ids.clear()
                    all_metadatas.clear()
                    all_documents.clear()

                    end_time = time.time()
                    time_taken = end_time - start_time
                    print(f"Document stored successfully: {filename} (Time taken: {time_taken:.2f} seconds)")
                else:
                    print(f"Document could not be stored: {filename}")
                    end_time = time.time()
                    time_taken = end_time - start_time
                    print(f"Time taken before failure: {time_taken:.2f} seconds")

    async def save_file_async(self, file: UploadFile) -> None:
        """Asynchronously saves an uploaded file to disk."""
        file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
        async with aiofiles.open(file_location, "wb") as f:
            content = await file.read()
            await f.write(content)

    async def upload_files_async(self, files: List[UploadFile]) -> Dict[str, List[str]]:
        """
        Uploads files asynchronously:
         - Saves the file to disk
         - Validates file type
         - Checks if file is already present in DB
         - If new, it will be stored later via `store_documents_task_async`
        Returns a dict containing "uploaded_files", "duplicate_files", and "failed_files".
        """
        try:
            uploaded_files = []
            duplicate_files = []
            failed_files = []
            print('Uploading files...')

            for file in files:
                file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
                await self.save_file_async(file)

                # Validate file extension
                if not self.file_validator.is_valid_file_extension(file_location):
                    failed_files.append(file.filename)
                    continue

                # Check DB for existing file (by ID)
                collection = self.db_client.get_collection()
                currentFile = collection.get(ids=[file.filename + "_0"])
                if self.file_validator.is_file_alredy_present(file_location, file.filename, currentFile):
                    duplicate_files.append(file.filename)
                else:
                    try:
                        uploaded_files.append(file.filename)
                    except Exception as e:
                        failed_files.append(file.filename)

        except Exception as e:
            print(f"An error occurred while uploading files: {e}")
            logger.error(f"An error occurred while uploading files : {str(e)}", exc_info=True)

        return {
            "uploaded_files": uploaded_files,
            "duplicate_files": duplicate_files,
            "failed_files": failed_files
        }

    async def load_documents_async(self, list_of_files: List[str]) -> List[str]:
        """
        Loads documents (by filename) from the local folder. 
        Currently just returns the list of matching filenames.
        """
        documents = []
        for filename in os.listdir(DOCUMENTS_FOLDER):
            if filename in list_of_files:
                documents.append(filename)
                logger.info(f"Document loaded successfully: {filename}.")
        return documents

    async def stream_query_results_async(self, query: str) -> StreamingResponse:
        try:
            combined_text, file_name, searched_file_name, filtered_results, error  = await self._process_query(query)
            isLookupSet = self.settingsService.get_config().lookupChecked

            if error != "":
                return error

            if searched_file_name and isLookupSet:
                file_extension = os.path.splitext(searched_file_name)[1].lower()
                file_extension = file_extension.split('_')[0]
                searched_file_name = os.path.splitext(searched_file_name)[0]

                file_path = os.path.join(DOCUMENTS_FOLDER, searched_file_name + file_extension)
                file_contents = await asyncio.to_thread(self.extract_text_from_file, file_path)

                page_numbers_set = set()

                for page_content in file_contents:
                    combined_text += page_content + "\n"
                    file_name = filtered_results[0][0].metadata['filename']
                    page_number = filtered_results[0][0].metadata['page_number']
                    page_numbers_set.add(page_number)

                combined_text = Utils.clean_text(self, combined_text)

                if len(combined_text) > Utils.max_token_length:
                    combined_text = ""
                    for result in filtered_results:
                        combined_text += result[0].page_content
                    combined_text = Utils.clean_text(self, combined_text)

            answer = await self.summarizer_client.stream_summarization(combined_text, query)
            return answer

        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return "Something went wrong. Please try again. If the issue persists, you can use the AI chat for assistance."

    async def stream_ai_chat_async(self, query: str) -> StreamingResponse:
        try:
            answer = await self.summarizer_client.stream_summarization("", query)
            return answer
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

    async def search_ai_chat_async(self, query: str) -> str:
        try:
            answer =  self.summarizer_client.summarize_text("", query)
            return answer
        
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

    async def search_query_results_async(self, query: str) -> str:
        try:
            combined_text, file_name, searched_file_name, filtered_results, error = await self._process_query(query)
            isLookupSet = self.settingsService.get_config().lookupChecked

            if error != "":
                return error

            if searched_file_name and isLookupSet:
                file_extension = os.path.splitext(searched_file_name)[1].lower()
                file_extension = file_extension.split('_')[0]
                searched_file_name = os.path.splitext(searched_file_name)[0]

                file_path = os.path.join(DOCUMENTS_FOLDER, searched_file_name + file_extension)
                file_contents = await asyncio.to_thread(self.extract_text_from_file, file_path)

                page_numbers_set = set()

                for page_content in file_contents:
                    combined_text += page_content + "\n"
                    file_name = filtered_results[0][0].metadata['filename']
                    page_number = filtered_results[0][0].metadata['page_number']
                    page_numbers_set.add(page_number)

                combined_text = Utils.clean_text(self, combined_text)

                if len(combined_text) > Utils.max_token_length:
                    combined_text = ""
                    for result in filtered_results:
                        combined_text += result[0].page_content
                    combined_text = Utils.clean_text(self, combined_text)

            answer = self.summarizer_client.summarize_text(combined_text, query)

            if file_name:
                file_name = self.get_file_name(file_name)
                final_response = f"{answer}\n \n Source: {file_name}\n"
            else:
                final_response = answer
            print(f"Final response: {final_response}")
            return final_response

        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return "Something went wrong. Please try again. If the issue persists, you can use the AI chat for assistance."

    async def _process_query(self, query: str) -> Tuple[str, str, str, list, str]:
        try:
            query_embeddings = None
            try:
                query_embeddings = self.ai_client.get_embedding_function().embed_query(" " + query + " ")
            except requests.exceptions.RequestException as reqException:
                logger.error(f"An error occurred while getting query embeddings: {str(reqException)}")
                return "", "", "", [], "Please check the \"Embedded Settings\" section to ensure the settings are configured. Alternatively, you can use the AI chat for assistance."
            except Exception as e:
                logger.error(f"An error occurred while getting query embeddings: {str(e)}")
                return "", "", "", [], "Something went wrong. Please try again. If the issue persists, you can use the AI chat for assistance."

            if not query_embeddings:
                logger.error("Failed to get query embeddings")
                return "", "", "", [], "Failed to retrieve query embeddings. Please try again. Alternatively, you can use the AI chat for assistance."

            collection = self.db_client.get_collection()
            results = collection.similarity_search_by_vector(query_embeddings, k=20)
            if not results:
                logger.info("No results found")
                return "", "", "", [], "No results found in documents. However, you can use the AI chat for assistance."

            similarity_threshold = 0.50
            query_vector = np.array(query_embeddings).reshape(1, -1)

            filtered_results = []
            for doc in results:
                doc_embedding = np.array(ast.literal_eval(doc.metadata['embedding'])).reshape(1, -1)
                similarity = cosine_similarity(query_vector, doc_embedding)[0][0]
                if similarity >= similarity_threshold:
                    filtered_results.append((doc, similarity))

            if not filtered_results:
                logger.info("No results above threshold")
                return "", "", "", [], "No results found in documents. However, you can use the AI chat for assistance."

            filtered_results.sort(key=lambda x: x[1], reverse=True)
            first_result_filename = os.path.splitext(filtered_results[0][0].metadata['filename'])[0].lower()

            filtered_results = [
                result for result in filtered_results
                if os.path.splitext(result[0].metadata['filename'])[0].lower() == first_result_filename
            ]

            combined_text = ""
            file_name = ""
            searched_file_name = filtered_results[0][0].metadata['filename']

            if not self.settingsService.get_config().lookupChecked:
                file_name = searched_file_name
                for result in filtered_results:
                    combined_text += result[0].page_content
                combined_text = Utils.clean_text(self, combined_text)

            return combined_text, file_name, searched_file_name, filtered_results, ""

        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return "", "", "", [], "Something went wrong. Please try again. If the issue persists, you can use the AI chat for assistance."

    def get_file_name(self, name: str) -> str:
        try:
            file_extension = os.path.splitext(name)[1].lower()
            file_extension = file_extension.split('_')[0]
            file_name = os.path.splitext(name)[0]
            return file_name + file_extension
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            logger.error(f"An unexpected error occurred : {str(e)}", exc_info=True)
            return file_name
                
                