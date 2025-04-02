from pydantic import BaseModel, HttpUrl, EmailStr
from typing import List, Dict, Optional
from enum import Enum

class AIProvider(Enum):
    AZURE_OPENAI = "azureOpenAI"
    OPENAI = "OpenAI"
    OLLAMA = "Ollama"
    GEMINI = "Gemini"

class ConfigJsonItem(BaseModel):
    provider: Optional[str] = None
    model: Optional[str] = None
    endpoint: Optional[str] = None
    apiKey: Optional[str] = None

class EmbeddedConfigSettings(BaseModel):
    embedprovider: Optional[str] = None
    model: Optional[str] = None
    endpoint: Optional[str] = None
    apiKey: Optional[str] = None

class TTConfigSettings(BaseModel):
    trackingtool: Optional[str] = None
    email: Optional[str] = None
    endpoint: Optional[str] = None
    projectkey: Optional[str] = None
    projecttoken: Optional[str] = None

class Config(BaseModel):
    provider: Optional[str] = None
    embedprovider: Optional[str] = None
    configJson: Optional[Dict[str, ConfigJsonItem]] = None
    embedconfigJson: Optional[Dict[str, EmbeddedConfigSettings]] = None
    lookupChecked : Optional[bool] = False

class EncryptedConfig(BaseModel):
    encryptedKey: Optional[str] = None
    encryptedData: Optional[str] = None
    iv: Optional[str] = None
    