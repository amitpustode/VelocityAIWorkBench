#!/bin/bash

# Define the certificate file
CERT_PATH="velocityAI.pem"  # Path to the certificate file in the same folder
KEYCHAIN="login.keychain"  # Install to the default keychain

# Ensure the script is being executed from the correct directory
if [ ! -f "$CERT_PATH" ]; then
  echo "Certificate file '$CERT_PATH' not found in the current directory."
  exit 1
fi

# Install the certificate
security add-certificates -k ~/Library/Keychains/$KEYCHAIN $CERT_PATH

# Verify the installation
if [ $? -eq 0 ]; then
  echo "Certificate '$CERT_PATH' added successfully to '$KEYCHAIN'."
else
  echo "Failed to add certificate '$CERT_PATH' to '$KEYCHAIN'."
  exit 1
fi
