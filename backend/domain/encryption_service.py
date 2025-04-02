from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import base64
import json
import logging
import os
from cryptography.hazmat.primitives.padding import PKCS7

from domain.logger import logger

class EncryptionService:
    def __init__(self):
        self.key_dir = './keys'
        os.makedirs(self.key_dir, exist_ok=True)
        
        # Try to load existing keys first
        self._private_key = self._load_private_key()
        self._public_key = self._load_public_key()
        
        # If keys don't exist, generate new ones and save them
        if not self._private_key or not self._public_key:
            self._generate_and_save_keys()
    
    def _load_private_key(self):
        try:
            private_key_path = os.path.join(self.key_dir, 'private_key.pem')
            if os.path.exists(private_key_path):
                with open(private_key_path, 'rb') as f:
                    return serialization.load_pem_private_key(
                        f.read(),
                        password=None,
                        backend=default_backend()
                    )
            return None
        except Exception as e:
            logger.error(f"Failed to load private key: {str(e)}")
            return None
    
    def _load_public_key(self):
        try:
            public_key_path = os.path.join(self.key_dir, 'public_key.pem')
            if os.path.exists(public_key_path):
                with open(public_key_path, 'rb') as f:
                    return serialization.load_pem_public_key(
                        f.read(),
                        backend=default_backend()
                    )
            return None
        except Exception as e:
            logger.error(f"Failed to load public key: {str(e)}")
            return None
    
    def _generate_and_save_keys(self):
        try:
            # Generate new RSA key pair
            self._private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048,
                backend=default_backend()
            )
            self._public_key = self._private_key.public_key()
            
            # Save private key
            with open(os.path.join(self.key_dir, 'private_key.pem'), 'wb') as f:
                f.write(self._private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                ))
            
            # Save public key
            with open(os.path.join(self.key_dir, 'public_key.pem'), 'wb') as f:
                f.write(self._public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                ))
            
            logger.info("Generated and saved new RSA key pair")
        except Exception as e:
            logger.error(f"Failed to generate and save keys: {str(e)}")
            raise RuntimeError(f"Key generation failed: {str(e)}")

    def get_public_key_pem(self) -> str:
        """Return public key in PEM format"""
        try:
            pem = self._public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
            return pem.decode('utf-8')
        except Exception as e:
            logger.error(f"Failed to get public key PEM: {str(e)}")
            raise RuntimeError(f"Failed to get public key: {str(e)}")

    def decrypt_aes_key(self, encrypted_aes_key: bytes) -> bytes:
        """Decrypt the AES key using RSA private key"""
        try:
            if not encrypted_aes_key:
                raise ValueError("Encrypted AES key is empty")

            logger.info(f"Attempting to decrypt AES key: {base64.b64encode(encrypted_aes_key).decode()}")  # Log the encrypted key

            decrypted_key = self._private_key.decrypt(
                encrypted_aes_key,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            return decrypted_key
        except ValueError as e:
            logger.error(f"Invalid encrypted AES key: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Failed to decrypt AES key: {str(e)}")
            raise RuntimeError(f"AES key decryption failed: {str(e)}")

    def decrypt_data(self, encrypted_data: dict) -> dict:
        """Decrypt the data using provided AES key and IV"""
        try:
            # Check if encrypted_data has all required fields
            if not encrypted_data or not all(key in encrypted_data for key in ['encryptedKey', 'encryptedData', 'iv']):
                logger.warning("Encrypted data is missing required fields")
                return {}  # Return empty dict to be converted to default Config
            
            # Decode base64 strings
            encrypted_key = base64.b64decode(encrypted_data['encryptedKey'])
            encrypted_content = base64.b64decode(encrypted_data['encryptedData'])
            iv = base64.b64decode(encrypted_data['iv'])

            # Decrypt the AES key using RSA private key
            aes_key = self.decrypt_aes_key(encrypted_key)

            # Create AES cipher
            cipher = Cipher(
                algorithms.AES(aes_key),
                modes.CBC(iv),
                backend=default_backend()
            )
            decryptor = cipher.decryptor()

            # Decrypt the data
            decrypted_data = decryptor.update(encrypted_content) + decryptor.finalize()

            # Remove PKCS7 padding correctly
            unpadder = PKCS7(128).unpadder()
            decrypted_data = unpadder.update(decrypted_data) + unpadder.finalize()

            # Parse JSON with debug info
            decrypted_str = decrypted_data.decode('utf-8')
            print(f"Decrypted string before JSON parse: {decrypted_str}") # Debugging
            return json.loads(decrypted_str)
        except Exception as e:
            logger.error(f"Data decryption failed: {str(e)}")
            raise RuntimeError(f"Data decryption failed: {str(e)}")
