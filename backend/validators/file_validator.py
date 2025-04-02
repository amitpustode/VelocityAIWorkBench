# validation.py
import hashlib
from typing import Any, Dict
import os
import mime

class FileValidator:
    
    def is_file_alredy_present(self, file_path: str, file_name: str, current_file: Dict[str, Any]) -> bool:
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
             hash_sha256.update(chunk)

        file_hash =hash_sha256.hexdigest()

        #existing_docs = self.collection.get(ids=[file_name])
        if len(current_file['metadatas']) > 0 and current_file['metadatas'][0]['hash'] == file_hash:
            return True
        return False
            
    def is_valid_file_extension_bughunter(self, file_path: str) -> bool:
        # Check file extension
        file_extension = file_path.lower().endswith(('.csv'))
        valid_mime_types = [
            'text/csv'
        ]
        # check file type
        mime_types = mime.Types.of(file_path)
        mime_info = mime_types[0]
        file_type = mime_info.content_type
        if file_type is None:
            return False
        return file_extension and file_type in valid_mime_types
    
    def is_valid_file_extension(self, file_path: str) -> bool:
        # Check file extension
        file_extension = file_path.lower().endswith(('.pdf', '.docx', '.txt'))
        valid_mime_types = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/zip',
            'text/plain'
        ]
        # check file type
        mime_types = mime.Types.of(file_path)
        mime_info = mime_types[0]
        file_type = mime_info.content_type
        if file_type is None:
            return False
        return file_extension and file_type in valid_mime_types

      
        
        

        