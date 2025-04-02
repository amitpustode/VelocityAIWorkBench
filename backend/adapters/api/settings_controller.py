from fastapi import APIRouter, HTTPException, Depends
from domain.settings_service import SettingsService
from domain.encryption_service import EncryptionService
from domain.settings import Config, EncryptedConfig
from application.settings_use_case import SettingsUseCase
from .dependencies import reset_dependencies
import logging
from domain.logger import logger
# logger = logging.getLogger(__name__)
router = APIRouter()

# Create singleton encryption service
encryption_service = EncryptionService()

def get_settings_use_case():
    service = SettingsService(reset_callback=reset_dependencies)
    return SettingsUseCase(service)

@router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "The service is up and running!"}


@router.get("/public-key")
async def get_public_key():
    """Endpoint to get the RSA public key in PEM format for frontend encryption"""
    try:
        public_key = encryption_service.get_public_key_pem()
        return {"publicKey": public_key}
    except Exception as e:
        logger.error(f"Error retrieving public key: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get public key: {str(e)}")
    
@router.post("/save-frontend-config")
async def save_encrypted_config(
    encrypted_data: dict,
    use_case: SettingsUseCase = Depends(get_settings_use_case)
):
    try:
        # write the input as it is to a json
        logger.info("Successfully saved enrypted configuration")
        return {"message": "Configuration saved successfully"}
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error saving encrypted config: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save-encrypted-config")       # gets encrypted config - decrypts - saves in config.json
async def save_encrypted_config(
    encrypted_data: dict,
    use_case: SettingsUseCase = Depends(get_settings_use_case)
):
    try:
        print(f"\n save-encrypted-config =  \n {encrypted_data}")
        decrypted_data = encryption_service.decrypt_data(encrypted_data)
        config = Config(**decrypted_data)
        await use_case.save_config(config)
        logger.info("Successfully saved decrypted configuration")
        return {"message": "Configuration saved successfully"}
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error saving encrypted config: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/read-config", response_model=Config)
async def read_config(use_case: SettingsUseCase = Depends(get_settings_use_case)):
    try:
        config = await use_case.read_config()
        logger.info("Configuration read successfully")
        return config
    except Exception as e:
        logger.error(f"Error reading config: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save-config")
async def save_config(
    config: EncryptedConfig,
    use_case: SettingsUseCase = Depends(get_settings_use_case)
):
    """Save configuration without encryption (deprecated)"""
    try:
        logger.warning("Using unencrypted save-config endpoint")
        await use_case.save_config(config)
        logger.info("Configuration saved successfully")
        return {"message": "Configuration saved successfully"}
    except Exception as e:
        logger.error(f"Error saving config: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))