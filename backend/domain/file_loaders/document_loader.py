from langchain_community.document_loaders import (
    PyMuPDFLoader,  # For PDF
    TextLoader,  # For TXT
    UnstructuredWordDocumentLoader,  # For DOCX
)

class DocumentLoader:

    def __init__(self):
        self.loaders = {
            "pdf": PyMuPDFLoader,
            "txt": TextLoader,
            "docx": UnstructuredWordDocumentLoader,
        }


    def get_loader(self, file_path: str):
        """Returns the appropriate loader based on the file extension."""
        ext = file_path.split(".")[-1].lower()
        loader_class = self.loaders.get(ext)
        if not loader_class:
            raise ValueError(f"Unsupported file type: {ext}")
        return loader_class(file_path)
