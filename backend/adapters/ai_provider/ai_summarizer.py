from typing import Dict
from fastapi import Response
from fastapi.responses import StreamingResponse
from langchain.chains.llm import LLMChain
from langchain.prompts import PromptTemplate
from langchain_community.chat_models import AzureChatOpenAI
from domain.settings_service import SettingsService
from langchain_community.llms import OpenAI, Ollama
from datetime import datetime
import os
import logging
from utils.docker_util import set_ollama_docker_url
from langchain_openai import ChatOpenAI
from prompts.prompt_loader import PromptLoader
from domain.logger import logger 

class KnowledgeBaseSummarizer:
    """
    Enhanced Summarizer that uses an LLM to provide ChatGPT-like answers to queries
    given a chunk of relevant text. 
    """

    def __init__(self, endpoint: str, api_key: str, model: str, settings_Service: SettingsService):
        self.api_key = api_key
        self.model = model
        self.endpoint = endpoint
        self.prompt_loader = PromptLoader()
        self.settingsService = settings_Service
        config = self.settingsService.get_config()
        self.provider = config.provider.lower() if config and config.provider else None
        self.prompt_loader.set_default_provider(self.provider)
        if endpoint:  # Initialize LLM only if endpoint is provided
            self.llm = self._initialize_llm(endpoint)
        else:
            self.llm = None  # Handle case where no LLM is initialized

    def _initialize_llm(self, endpoint: str):
        """
        Initializes the underlying LLM based on the endpoint.
        Supports Azure OpenAI, OpenAI, or Ollama (local LLM).
        """
        if "azure.com" in endpoint:
            return AzureChatOpenAI(
                azure_endpoint=endpoint,
                azure_deployment=self.model,
                api_key=self.api_key,
                api_version="2024-08-01-preview"
            )
        elif "openai.com" in endpoint:
            return ChatOpenAI(
                # if self.api_key is present then assign it to openai_api_key otherwise assign empty string
                openai_api_key=self.api_key if self.api_key else os.getenv("OPENAI_API_KEY", ""),
                model=self.model if self.model else os.getenv("OPENAI_API_MODEL", "")
            )
        else:
            return Ollama(
                            model=self.model, 
                            base_url=set_ollama_docker_url(self.endpoint),
                            format="json"
                        )

    async def stream_summarization(self, text: str, query: str) -> StreamingResponse:
        if not self.llm:
            logger.warning("No LLM is initialized; returning raw text.")
            return "No LLM available to process the query."
        if self.llm.__class__.__name__ == "Ollama":
            self.llm = Ollama(
                            model=self.model, 
                            base_url=set_ollama_docker_url(self.endpoint)
                        )

        def generate():
            for chunk in self.llm.stream(prompt_template) :
                yield f"data: {chunk}\n\n"

        try:
            # currently the summarisation & ai chat prompt is same for all providers
            prompt_template =  self.prompt_loader.get_prompt("SUMMARISATION_PROMPT", self.provider).format(text=text, query=query)
            if not text:
                prompt_template = self.prompt_loader.get_prompt("AZOAI_AI_CHAT_PROMPT", self.provider).format(query=query)
            prompt_template = prompt_template.replace("{", "{{").replace("}", "}}")
            prompt =  PromptTemplate.from_template(prompt_template)
            chain = LLMChain(llm=self.llm, prompt=prompt)
           
            logger.info(f"Query submitted: {datetime.now().time()}")
            response = StreamingResponse( generate(), media_type="text/event-stream")
            
            logger.info(f"Query processed: {datetime.now().time()}")
            
            return response
        except Exception as e:
            logger.error("Error occurred while summarizing the text: {str(e)}")
            raise e

    def summarize_text(self, text: str, query: str) -> str:
        """
        Instead of merely summarizing, this method acts like a ChatGPT-style QA agent:
         - We assume `text` is the relevant context from your knowledge base.
         - The user query is the question.
         - The LLM is prompted to answer in a ChatGPT-like style.
        """
        if not self.llm:
            logger.warning("No LLM is initialized; returning raw text.")
            return "No LLM available to process the query."
        if self.llm.__class__.__name__ == "Ollama":
            self.llm = Ollama(
                            model=self.model, 
                            base_url=set_ollama_docker_url(self.endpoint)
                        )

        # currently the summarisation & ai chat prompt is same for all providers
        prompt_template =  self.prompt_loader.get_prompt("SUMMARISATION_PROMPT", self.provider)
        if not text:
            prompt_template = self.prompt_loader.get_prompt("AI_CHAT_PROMPT", self.provider).format(query=query)
            
        prompt_template = prompt_template.replace("{", "{{").replace("}", "}}")
        prompt = PromptTemplate.from_template(prompt_template)
        chain = LLMChain(llm=self.llm, prompt=prompt)

        try:
            logger.info(f"Query submitted: {datetime.now().time()}")
            response = chain.invoke({"text": text, "query": query})

            if isinstance(response, dict) and "text" in response:
                response = response.get("text")
            
            logger.info(f"Query processed: {datetime.now().time()}")
            
            return response
        except Exception as e:
            logger.error(f"Error occurred while summarizing the text : {str(e)}", exc_info=True)
            raise e

    async def generate_requirements_async(self, userPrompts: Dict[str, str], systemPrompts: Dict[str, str]) -> str:
        """
        Generates requirements based on user/system prompts in strict JSON format.
        """
        print("Summarizer => generate_requirements_async_with_ai")

        if not self.llm:
            return "No LLM available to generate requirements."



        prompt_template = self.prompt_loader.get_prompt("GENERATE_REQUIREMENTS", self.provider)
        prompt = PromptTemplate.from_template(prompt_template)
        chain = LLMChain(llm=self.llm, prompt=prompt)



        try:
            response = await chain.arun({
                "userPrompts": userPrompts['content'],
                "systemPrompts": systemPrompts['content']
            })
            return response
        except Exception as e:
            logger.error(f"Error occurred while generating requirements : {str(e)}", exc_info=True)
            return f"Error occurred while generating requirements: {str(e)}"