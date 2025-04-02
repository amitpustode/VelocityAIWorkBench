from pydantic import BaseModel

class Epic(BaseModel):
    epic_id: str
    epic_title: str
    epic_description: str
    epic_type: str