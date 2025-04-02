# Document Search Application

This repository contains a Python-based backend application for document search and embedding generation using Azure OpenAI and ChromaDB. The application is structured into several layers, each responsible for different aspects of the functionality.

## Project Structure
root
├── backend
│   ├── domain
│   │   ├── document.py 
│   │   └── document_service.py 
│   ├── application
│   │   └── use_cases.py 
│   ├── adapters
│   │   ├── api
│   │   │   ├── document_controller.py
│   │   ├── ai_provider
│   │   │   ├── ai_client.py
│   │   │   └── ai_summarizer.py
│   │   └── database
│   │       └── repository.py
│   └── frameworks
│       └── flask_server.py



### Layers Explanation

1. **Domain Layer (`backend/domain`)**:
   - `document.py`: Contains the document model and related logic.
   - `document_service.py`: Provides services related to document processing.

2. **Application Layer (`backend/application`)**:
   - `use_cases.py`: Contains the use cases and business logic for the application.

3. **Adapters Layer (`backend/adapters`)**:
   - **API (`backend/adapters/api`)**:
     - `document_controller.py`: Handles API requests related to documents.
   - **AI Provider (`backend/adapters/ai_provider`)**:
     - `ai_client.py`: Client for interacting with AI services.
     - `ai_summarizer.py`: Provides summarization services using AI.
   - **Database (`backend/adapters/database`)**:
     - `repository.py`: Handles database interactions.

4. **Frameworks Layer (`backend/frameworks`)**:
   - `flask_server.py`: Sets up the Flask server for the application.

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- `pip` (Python package installer)

### Step-by-Step Setup

1. **Clone the Repository**:
   ```sh
   -- clone repository
   cd backend

2. **Create a Virtual Environment**:
   python -m venv venv

3. **Activate the Virtual Environment**:
   - Windows:
      venv\Scripts\activate
   macOS/Linux:
      source venv/bin/activate

4. **Upgrade pip**:
   python -m pip install --upgrade pip

5. **Install Required Packages**:
   pip install -r requirements.txt

6. **Run the Application**:
   uvicorn main:app --reload

   **Author**
   Amit Gosavi
