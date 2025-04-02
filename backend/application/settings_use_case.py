from domain.settings import Config,EncryptedConfig
from domain.settings_service import SettingsService

class SettingsUseCase:
    def __init__(self, service: SettingsService):
        self.service = service

    async def save_config(self, config: EncryptedConfig):
        await self.service.save_config(config)

    async def read_config(self) -> Config:
        return await self.service.read_config()