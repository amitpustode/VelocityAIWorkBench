import logging
import os,json
from typing import Dict, List
import aiofiles
import pandas as pd
from typing import Dict, List, Any
from adapters.ai_provider.ai_client import EmbeddingClient
from adapters.ai_provider.ai_summarizer import KnowledgeBaseSummarizer
from adapters.database.repository import ChromaDBClient
from validators.file_validator import FileValidator
from domain.document import Document
from langchain_community.document_loaders import CSVLoader
from dotenv import load_dotenv
from fastapi import UploadFile
from langchain_community.vectorstores import Chroma
from domain.settings_service import SettingsService
from validators.file_validator import FileValidator
from fastapi import UploadFile
from .file_loaders.document_loader import DocumentLoader
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS


load_dotenv()
AZURE_SUMMERIZE_ENDPOINT = os.getenv("AZURE_SUMMERIZE_ENDPOINT")
AZURE_SUMMERIZE_KEY = os.getenv("AZURE_SUMMERIZE_KEY")

UPLOAD_DIRECTORY = "./documents/bughunter"
DOCUMENTS_FOLDER = "./documents/bughunter"
CONFIG_FILE_PATH = "./bughunter_config.json"

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BughunterService:
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
    
    def embedding_csv(self):
        try:
            embedding_function = self.ai_client.get_embedding_function()
            persist_directory = "./db"
            csv_collection = Chroma(collection_name="bughunter_collections",
                                    persist_directory=persist_directory,
                                    embedding_function=embedding_function)
            return csv_collection
        except Exception as e:
            print("embedding_csv Errors:",e);
            return {"status": f""" The Azure OpenAI embedprovider need to be configured or the credentials are incorrect: {str(e)} """}

    
    def read_config(self):
        with open(CONFIG_FILE_PATH, "r") as f:
            config_data = json.load(f)
        return config_data
    

    async def save_file_async(self, file: UploadFile) -> None:
        """Asynchronously saves an uploaded file to disk."""
        if not os.path.exists(UPLOAD_DIRECTORY):
            os.makedirs(UPLOAD_DIRECTORY)
            print(f"Bughunter UploadFolder created: {UPLOAD_DIRECTORY}")
        file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
        async with aiofiles.open(file_location, "wb") as f:
            content = await file.read()
            await f.write(content)

    async def upload_files_async(self, files: List[UploadFile]) -> List[Dict[str, List[str]]]:
        try:
            uploaded_files = []
            duplicate_files = []
            failed_files = []
            print('Uploading files...')
            print(files)
            file_validator = FileValidator()
            for file in files:
                if not file_validator.is_valid_file_extension_bughunter(file.filename):
                    print(f"Invalid file extension: {file.filename}")
                    failed_files.append(file.filename)
                    continue

                await self.save_file_async(file)
                file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
                csv_collection = self.embedding_csv()
                if isinstance(csv_collection, dict):
                    return csv_collection
                currentFile = csv_collection.get(ids=[file.filename + "_0"])

                if file_validator.is_file_alredy_present(file_location, file.filename, currentFile):
                    print(f"File already present: {file.filename}")
                    duplicate_files.append(file.filename)
                else:
                    try:
                        uploaded_files.append(file.filename)
                    except Exception as e:
                        print(f"An error occurred while uploading file: {file.filename}")
                        failed_files.append(file.filename)
        except Exception as e:
            print(f"An error occurred while uploading files: {e}")
        return {"uploaded_files": uploaded_files, "duplicate_files": duplicate_files, "failed_files": failed_files}
    
    async def load_csv_async(self, list_of_files: List[str]) -> List[Document]:
        all_documents = []
        print(DOCUMENTS_FOLDER)
        for filename in os.listdir(DOCUMENTS_FOLDER):
            file_path = os.path.join(DOCUMENTS_FOLDER, filename)

            if filename in list_of_files:
                file_extension = os.path.splitext(filename)[1].lower()
                if file_extension == ".csv":
                    try:
                        ###### colunm validation ######
                        size_bytes  = os.path.getsize(file_path)
                        file_size_kb = size_bytes  / 1024
                        file_size_mb = file_size_kb/1024
                        loader_df =  pd.read_csv(file_path, encoding="utf-8", delimiter=",")
                        loader_df_columns = loader_df.columns.tolist()
                        conf = self.read_config()
                        bughunter_collection_columns = conf["bughunter_document_columns"]
                        
                        if bughunter_collection_columns == loader_df_columns and len(loader_df) >= 10 and file_size_mb < 500:
                            loader = CSVLoader(file_path, encoding="utf-8", csv_args={"delimiter": ","})
                            documents = loader.load()
                            all_documents.extend(documents)  # Flatten the list
                        else:
                            # columns = " ".join(bughunter_collection_columns)
                            return f"""{filename} file columns are not matching or order may different,
                                    bughunter required columns:{bughunter_collection_columns} 
                                    and file length shoud more then 10 rows and size less then 500MB """
                        print(f"CSV Document loaded: {filename}.")
                    except Exception as e:
                        print(f"Error reading CSV file: {file_path}, Error: {e}")
        return all_documents

    def new_doc_data_list(self, documents, existing_docs):
        new_data=[]
        for doc in documents:
            if not doc.page_content in existing_docs:
                new_data.append(doc)
        return new_data
    
    async def store_csv_task_async(self, documents: List[Document]) -> None:
        try:
            csv_collection = self.embedding_csv()
            existing_docs = csv_collection.get()["documents"]
            new_documents = self.new_doc_data_list(documents, existing_docs)
            if new_documents != []:
                print("#### news row Documents #####")
                print(new_documents)
                csv_collection.add_documents(new_documents)
                return "File data embedded successfully"
            else:
                print("No new documents to added in the bughunter_collections")
                return "No new rows to embedded in the bughunter_collections "
        except Exception as e:
            print(f'Error Indexing CSVs: {e}')
            
    async def search_similar_ticket_async(self, query: str) -> str:
        try:
            
            words = query.lower().split()
            print(words)
            if len(words) < 3:   
                return {"status": "Ensure your input includes necessary details for ticket processing."}
            elif len(words) == 3:  
                noise_words = [word for word in words if word in ENGLISH_STOP_WORDS]
                if len(noise_words) == 2:
                    print("Ensure your input includes necessary details for ticket processing.")
                    return {"status": "Ensure your input includes necessary details for ticket processing."}
                
            csv_collection = self.embedding_csv()
            if isinstance(csv_collection, dict):
                    return csv_collection
            embedding_function = self.ai_client.get_embedding_function()
            query_embeddings = embedding_function.embed_query(" " +query + " ")
            embeddings_similarity_value = 1.5
            if query_embeddings:
                results = csv_collection.similarity_search_by_vector_with_relevance_scores(query_embeddings, k=5)   
                result_final_list = [res for res in results if res[-1] <= embeddings_similarity_value]
                if result_final_list == []:
                    return {"status": "No similar tickets were found for the given input."}
                return result_final_list
        except Exception as e:
            print(f'Error in similarity_search : {e}')
            return None