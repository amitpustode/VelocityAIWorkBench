from typing import List
from domain.document import Document
from langchain_chroma import Chroma
from adapters.ai_provider.ai_client import EmbeddingClient

class ChromaDBClient:
    def __init__(self, ai_client: EmbeddingClient):
        self.documents = []
        self.ai_client = ai_client
        self.collection_name = f"collections_{self.ai_client.provider}_{self.ai_client.model}"
        self.collection = Chroma(collection_name=self.collection_name, persist_directory="./db",
                            embedding_function=self.ai_client.get_embedding_function)

    def store_document(self, document: Document):
        self.documents.append(document)

    def get_all_embeddings(self):
        return [doc.embedding for doc in self.documents]

    def custom_embedding_function(self, text: str) ->List[float]:
        return any

    def get_collection(self) -> Chroma:
        self.collection_name = f"collections_{self.ai_client.provider}_{self.ai_client.model}"
        return Chroma(
            collection_name=self.collection_name,
            persist_directory="./db",
            embedding_function=self.ai_client.get_embedding_function
        )
