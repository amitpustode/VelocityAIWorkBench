from pydantic import BaseModel

class Document(BaseModel):
    id: str
    content: str
    embedding: str = None

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, **data):
        super().__init__(**data)
        self.embedding = None