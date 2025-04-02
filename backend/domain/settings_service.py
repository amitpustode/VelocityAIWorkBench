import json
import os
from typing import Any, List, Dict, Optional
from fastapi import HTTPException
from pydantic import HttpUrl
from .settings import Config, ConfigJsonItem, EmbeddedConfigSettings, EncryptedConfig
from domain.encryption_service import EncryptionService
from domain.logger import logger
CONFIG_FILE_PATH = "./config.json"
encryption_service = EncryptionService()


class SettingsService:
    def __init__(self, reset_callback=None):
        self.config = None
        self.reset_callback = reset_callback
        

    async def save_config(self, config: EncryptedConfig) -> None:
        def custom_encoder(obj: Any) -> Any:
            if isinstance(obj, HttpUrl):
                return str(obj)
            raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")
        
        try:

            with open(CONFIG_FILE_PATH, "w") as f:
                settings = config.model_dump()
                json.dump(settings, f, indent=2, default=custom_encoder)

            self.config = None
            self.reset_dependencies() 
        except (OSError, IOError) as e:
            print(f"File error occurred: {e}")
            logger.error(f"An unexpected File error occurred : {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"File error occurred: {e}")
        except TypeError as e:
            print(f"Serialization error occurred: {e}")
            logger.error(f"An unexpected Serialization error occurred : {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Serialization error occurred: {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            logger.error(f"An unexpected error occurred : {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
        
    def reset_dependencies(self):
        self.get_config()
        if self.reset_callback:
            self.reset_callback()

    async def read_config(self) -> Config:
        # Check if config file exists
        if not os.path.exists(CONFIG_FILE_PATH):
            print("Config file does not exist, returning default config")
            return Config()
            
        try:
            with open(CONFIG_FILE_PATH, "r") as f:
                config_data = json.load(f)
            
            # Check if the file is empty or doesn't have required fields
            if not config_data or not all(key in config_data for key in ['encryptedKey', 'encryptedData', 'iv']):
                print("Config file is empty or missing required fields, returning default config")
                return Config()
                
            print(f"\n read_config = {config_data}")
            decrypted_data = encryption_service.decrypt_data(config_data)
            config = Config(**decrypted_data)
            print(f"\n read_config - after decryption = {config}")
            return config
        except json.JSONDecodeError:
            print("Invalid JSON in config file, returning default config")
            return Config()
        except Exception as e:
            print(f"Error reading config: {e}")
            raise
    
    def read_config_async(self) -> Config:
        # Check if config file exists
        if not os.path.exists(CONFIG_FILE_PATH):
            print("Config file does not exist, returning default config")
            return Config()
            
        try:
            with open(CONFIG_FILE_PATH, "r") as f:
                config_data = json.load(f)
            
            # Check if the file is empty or doesn't have required fields
            if not config_data or not all(key in config_data for key in ['encryptedKey', 'encryptedData', 'iv']):
                print("Config file is empty or missing required fields, returning default config")
                return Config()
                
            print(f"\n read_config_async = {config_data}")
            decrypted_data = encryption_service.decrypt_data(config_data)
            config = Config(**decrypted_data)
            print(f"\n read_config_async - after decryption = {config}")
            return config
        except json.JSONDecodeError:
            print("Invalid JSON in config file, returning default config")
            return Config()
        except Exception as e:
            print(f"Error reading config: {e}")
            raise
    
    def get_config(self) -> Config:
        try:
            self.config = self.read_config_async()  # Read latest config every time
        except Exception as e:
            print(f"Error occurred while reading config: {e}")
            self.config = Config()  # Return a default Config object if an error occurs
        return self.config

    def get_ai_model_provider(self, provider: Optional[str] = None) -> ConfigJsonItem:
        try:
            config_items = self.get_config().configJson
            if config_items:
                if provider and provider in config_items:
                    return config_items[provider]
                else:
                    # provide first available model
                    for key, value in config_items.items():
                        if value.endpoint != "":
                            return value
        except Exception as e:
            print(f"Error occurred while getting AI model provider: {e}")
        return ConfigJsonItem()  # Return default if an error occurs

    def get_embedding_model_provider(self, provider: Optional[str] = None) -> EmbeddedConfigSettings:
        try:
            config_items = self.get_config().embedconfigJson
            if config_items:
                if provider and provider in config_items:
                    return config_items[provider]
                else:
                    # provide first available model
                    for key, value in config_items.items():
                        if value.endpoint != "":
                            return value
        except Exception as e:
            print(f"Error occurred while getting embedding model provider: {e}")
        return EmbeddedConfigSettings()  # Return default if an error occurs
            

    def get_all_config_json_items(self) -> List[ConfigJsonItem]:
        config = self.get_config()
        return list(config.configJson.values()) if config.configJson else []

    def get_default_embedding_provider(self) -> str:
        config = self.get_config()
        return config.embedprovider

    
