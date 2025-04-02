# VelocityAI Workbench

VelocityAI Workbench is a powerful application developed for the GlobalLogic Velocity.AI platform. It integrates modern web technologies with desktop application capabilities, leveraging Electron and React for a seamless user experience. This workbench is designed to help users work with artificial intelligence and data workflows efficiently. **Velocity.AI Workbench Version 2.0.0 (MVP Release)**, is released on **10th March 2025**.

## Prerequisites

This document provides instructions for setting up and installing the tool. For safe GenAI practices, please ensure that you re-validate the License.md for the tool. Additionally, installing any GenAI LLM model or creating an account for managed GenAI services for official work requires approval from the client and project manager. Depending on the project, approval from the legal team (ai-legal@globallogic.com) may also be necessary. The latest version of License.md for VelocityAIWorkBench 2.0.0 is included in this package and is also available from the community and PS teams.

## VelocityAI Workbench Version 2.0.0 (MVP Release): 10th March 2025

### Features Released:

- **Generate Requirement**:
  - Controlled support for context upload via the Knowledge Hub, with a checkbox in the first step. This allows performing requirement generation with or without the Knowledge Hub uploaded context.
  - Stabilization of multilingual text support
  - Enhancements in export functionality
  - Previous and Next buttons now support editing
- **Generate Diagrams**:
  - Fixes for exporting visualizations to JPEG and PNG formats for small image resolutions
  - Previous and Next buttons now support editing
- **Chat**:
  - Improved chat display with formatted and styled content
  - Default chats are now saved
    -**Knowledge Hub**:
  - Support for .pdf, .docx, .doc, and .txt file formats
  - View the list of already uploaded files
- **VAW Logs**:
  - Logs can now be filtered based on log level
- **Settings**:
  - Embedding settings have an additional checkbox to indicate whether contextual search should consider the matched results or the entire document.
- Integration with LangChain for majority of use cases
- OLLAMA support across all use cases
- Code-signed app for Mac, unsigned app for windows
- Stabilization and Bug Fixes as reported by users, PS team and QA team
- **Release Artifacts**: Updated the following documents as part of the release process:
  - `ReadME.md` to include release notes
  - `CHANGELOG.md` to maintain the release history
  - `LICENSE.md` to update the list of used packages' licenses
  - `help.html` to update the support and troubleshooting details for the new features

# VelocityAI Workbench 1.0.0 Beta Release: 26th January 2025

## Description

VelocityAI Workbench is a powerful application developed for the GlobalLogic VelocityAI Workbench platform. It integrates modern web technologies with desktop application capabilities, leveraging Electron and React for a seamless user experience. This workbench is designed to help users work with artificial intelligence and data workflows efficiently.

# VAW Core Features

- **Web and Desktop Integration**: Combines the power of Vite, Electron, and React to create a cross-platform solution.
- **UI Components**: Utilizes Material UI for modern, customizable components and icons.
- **State Management**: Employs Redux and React-Redux for effective state management across the app.
- **Logging**: Incorporates Winston for robust logging with daily file rotation.
- **Python Integration**: Uses `python-shell` to interface with Python scripts directly from the Electron app.
- **Deployment**: Built for both development and production environments with options for building and previewing.

# VAW Dependencies

## Core Dependencies

- **React**: A JavaScript library for building user interfaces.
- **Electron**: Framework for building cross-platform desktop apps with web technologies.
- **Material UI**: React components that implement Google's Material Design.
- **Redux**: A predictable state container for JavaScript apps.
- **axios**: Promise-based HTTP client for the browser and Node.js.
- **winston**: A logging library for Node.js.
- **python-shell**: A simple way to run Python scripts from Node.js.

## Development Dependencies

- **Vite**: A fast build tool for modern web development.
- **TypeScript**: A superset of JavaScript that adds static types.
- **Electron Builder**: Packaging and distribution for Electron apps.
- **PostCSS**: Tool for transforming CSS with JavaScript plugins.
- **TailwindCSS**: A utility-first CSS framework for rapidly building custom designs.
  -**fastAPI and UVCorn**: A fast (high-performance), web framework for building APIs with Python
  -**Uvicorn**: A lightning-fast ASGI server implementation, using uvloop and httptools. It is designed to be used with ASGI frameworks like FastAPI, Starlette, and others.

# Author

- **TeamVAW**
