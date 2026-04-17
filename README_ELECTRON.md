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
    > **IMPORTANT:** Do NOT run `npm audit fix --force`. This command may upgrade core dependencies to incompatible versions, causing the application to display a blank screen.

3.  **Set up your API Key:**
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```
    **Note:** Without this key, the app will start but AI generation features will not work.

## Troubleshooting (Blank Screen)

If you see a blank screen when running the app:

1.  **Check the Console:** In development mode, the app will automatically open Chrome DevTools. Look for red error messages in the "Console" tab.
2.  **Check .env File:** Ensure your `.env` file exists in the root directory and contains a valid `GEMINI_API_KEY`.
3.  **Reinstall Cleanly:** If you previously ran `npm audit fix --force`, delete your `node_modules` and `package-lock.json`, then run `npm install` again.
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```
4.  **Vite Cache:** Try clearing the Vite cache:
    ```bash
    npx vite optimize --force
    ```

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
