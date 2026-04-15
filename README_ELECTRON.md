# AI Video Prompt Director - Desktop Build Guide

This project is configured to be packaged as a desktop application for Windows (.exe) and macOS (.dmg) using Electron and Electron Builder.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)

## Local Setup

1.  **Download the project source code.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up your API Key:**
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

## Development

To run the app in development mode with Electron:
```bash
npm run dev
```
(The Electron window will open automatically once the Vite server is ready).

## Packaging (EXE / DMG)

To package the application for your current operating system:

### For Windows (EXE):
```bash
npm run electron:build
```
The output will be in the `release/` directory as a portable `.exe` file.

### For macOS (DMG):
```bash
npm run electron:build
```
The output will be in the `release/` directory as a `.dmg` file.

## Configuration Notes

- The build configuration is located in `package.json` under the `"build"` key.
- Electron main process logic is in `electron/main.ts`.
- Preload scripts are in `electron/preload.ts`.
- Vite is configured to handle the Electron build via `vite-plugin-electron`.
