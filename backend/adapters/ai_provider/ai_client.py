from langchain_openai import AzureOpenAIEmbeddings, OpenAIEmbeddings
from langchain_community.embeddings import OllamaEmbeddings
from urllib.parse import urlparse, parse_qs
from utils.docker_util import set_ollama_docker_url
import os

class EmbeddingClient:

    def __init__(self, endpoint: str, api_key: str, model: str, provider:str):
        self.endpoint = endpoint
        self.api_key = api_key
        self.model = model
        self.provider = provider

    def get_embedding_function(self):
        base_url, api_version = parse_url(self.endpoint)
        if "azure.com" in base_url:
            return AzureOpenAIEmbeddings(
                model=self.model,
                azure_endpoint=base_url,
                api_key=self.api_key,
                openai_api_version=api_version
            )
        elif "openai.com" in base_url:
            return OpenAIEmbeddings(model=self.model,api_key=self.api_key)
        else:
            set_ollama_docker_url(self.endpoint)
            return OllamaEmbeddings(model=self.model,base_url=os.getenv("OLLAMA_HOST"))
        
def parse_url(url: str):
    parsed_url = urlparse(url)
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
    query_params = parse_qs(parsed_url.query)
    api_version = query_params.get("api-version", [None])[0]
    return base_url, api_version