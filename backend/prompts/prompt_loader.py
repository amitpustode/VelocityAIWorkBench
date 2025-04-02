import os
import json
from typing import Dict

class PromptLoader:
    def __init__(self, config_path: str = "prompts/prompts_config.json"):
        self.config_path = config_path
        self.provider_prefixes = {
            "azureopenai": "AZOAI_",
            "openai": "OAI_",
            "ollama": "OLLAMA_"  # can add more providers based on new models' prompts
        }
        self.default_provider = "azureopenai"  # Default provider if none specified

    def _load_prompts(self) -> Dict[str, str]:
        """Loads the prompt configurations from a JSON file."""
        if not os.path.exists(self.config_path):
            raise FileNotFoundError(f"Prompt config file '{self.config_path}' not found.")
        
        with open(self.config_path, "r", encoding="utf-8") as file:
            return json.load(file)

    def get_prompt(self, prompt_key: str, provider: str = None) -> str:
        """
        Dynamically reloads and retrieves a prompt template based on the provider.
        
        Args:
            prompt_key: The base key for the prompt (without provider prefix)
            provider: The AI provider (azureopenai, openai, ollama)
                     If None, uses the default provider
        
        Returns:
            The prompt template string for the specified provider
        """
        prompts = self._load_prompts()  # Reload every time to get updated prompts
        
        # If prompt_key already has a provider prefix, use it directly
        if any(prompt_key.startswith(prefix) for prefix in self.provider_prefixes.values()):
            try:
                return prompts[prompt_key]
            except KeyError:
                raise KeyError(f"Prompt '{prompt_key}' not found in the prompts_config.")
        
        # Otherwise, determine the provider prefix
            
        provider = provider.lower()
        if provider not in self.provider_prefixes:
            provider = self.default_provider
            
        prefix = self.provider_prefixes[provider]
        full_prompt_key = f"{prefix}{prompt_key}"
        print(f"full prompt key = \n{full_prompt_key}\n")
        
        try:
            return prompts[full_prompt_key]
        except KeyError:
            # If provider-specific prompt not found, try the default provider
            default_key = f"{self.provider_prefixes[self.default_provider]}{prompt_key}"
            try:
                return prompts[default_key]
            except KeyError:
                raise KeyError(f"Prompt '{full_prompt_key}' or '{default_key}' not found in the prompts_config.")

    def set_default_provider(self, provider: str) -> None:
        """Sets the default provider to use when none is specified."""
        if not provider:
            return None
        if provider.lower() in self.provider_prefixes:
            self.default_provider = provider.lower()

