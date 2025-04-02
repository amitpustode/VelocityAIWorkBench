# Changelog

All notable changes to GlobalLogic's VelocityAI Workbench (VAW)project will be documented in this file.

The current version is of VAW 2.0.0 (MVP Release) is released on 10th March 2025 for the selected teams.

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
- OLAMA support across all use cases
- Linux support for VAW is now available
- Code-signed apps for Mac, Windows, and Linux
- Stabilization and Bug Fixes as reported by users, PS team and QA team
- **Release Artifacts**: Updated the following documents as part of the release process:
  - `ReadME.md` to include release notes
  - `CHANGELOG.md` to maintain the release history
  - `LICENSE.md` to update the list of used packages' licenses
  - `help.html` to update the support and troubleshooting details for the new features

##  VelocityAI Workbench 1.0.0 Beta Release: 26th January 2025

### Added
- Initial MVP release of the VMW app for internal use.
- Initial framework setup with VMW and core dependencies.
- Main window with a responsive user interface.
- Integrated navigation for key sections.
- Integration of majority of key AI innvotaions as part of this package.
- Placeholder logo and branding.

### Features
- **Core Functionality**:
- Settings panel with limited configuration options.
- Quick and Advanced Menu for Users
- Ability to execute various tools as part of this workbench.
- Integrated lightweight notification system.
- Integrated requirement genreration for teams to generate detailed, actionable requirements collaboratively.
- Requirement generation enabled integration with Jira, bridging the gap between planning and execution.
- Added capability to generate various types of diagrams.
- Added knowledge Hub to upload files, currently supportign PDF files.
- Added chat interaction with an AI ecosystem for technical queries and advice.
- Added Knowledge Hub chat for semantic  search in uploaded documents.
- Added prompt library to create and store custom prompts in the library for frequent use.

### Known Issues
- Some features are under construction or marked as work-in-progress (WIP).

### Upcoming Features (Planned for Future Versions)
- Support embeddings for other file types other than pdf.
- Robust logging support.
- Additional documentation for troubleshooting.
- [Additional planned feature].

## How to Report Issues
For bug reports or feature requests, please contact gl.vaw.support@globallogic.com.
