export class EncryptionUtil {
    private publicKey: string | null = null;
    private initialized: boolean = false;

    async initialize() {
        try {
            // Use IPC instead of fetch
            const response = await window.electronAPI.getPublicKey();
            this.publicKey = response.publicKey;
            this.initialized = true;
        } catch (error) {
            console.error('Failed to fetch public key:', error);
            throw error;
        }
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    private async importRsaKey(pem: string): Promise<CryptoKey> {
        // Remove PEM header, footer, and whitespace
        const pemContents = pem
            .replace('-----BEGIN PUBLIC KEY-----', '')
            .replace('-----END PUBLIC KEY-----', '')
            .replace(/\s/g, '');

        // Convert base64 to binary
        const binaryString = window.atob(pemContents);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Import the key
        return await window.crypto.subtle.importKey(
            'spki',
            bytes,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256',
            },
            false,
            ['encrypt']
        );
    }

    private async generateAesKey(): Promise<CryptoKey> {
        return await window.crypto.subtle.generateKey(
            {
                name: 'AES-CBC',
                length: 256,
            },
            true,
            ['encrypt']
        );
    }

    private async exportKey(key: CryptoKey): Promise<ArrayBuffer> {
        return await window.crypto.subtle.exportKey('raw', key);
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    async encryptData(data: any): Promise<{
        encryptedKey: string;
        encryptedData: string;
        iv: string;
    }> {
        if (!this.publicKey) {
            throw new Error('Public key not initialized');
        }

        try {
            // Generate AES key
            const aesKey = await this.generateAesKey();

            // Generate random IV
            const iv = window.crypto.getRandomValues(new Uint8Array(16));

            // Convert data to ArrayBuffer
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));

            // Encrypt data with AES
            const encryptedContent = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-CBC',
                    iv: iv.buffer,
                },
                aesKey,
                dataBuffer
            );

            // Export AES key
            const exportedAesKey = await this.exportKey(aesKey);

            // Import RSA public key
            const rsaPublicKey = await this.importRsaKey(this.publicKey);

            // Encrypt AES key with RSA
            const encryptedKey = await window.crypto.subtle.encrypt(
                {
                    name: 'RSA-OAEP'
                },
                rsaPublicKey,
                exportedAesKey
            );

            // Convert to base64
            return {
                encryptedKey: this.arrayBufferToBase64(encryptedKey),
                encryptedData: this.arrayBufferToBase64(encryptedContent),
                iv: this.arrayBufferToBase64(iv.buffer)
            };
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt data: ' + (error as Error).message);
        }
    }
}

// Create singleton instance
export const encryptionUtil = new EncryptionUtil(); 