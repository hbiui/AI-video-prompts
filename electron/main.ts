import { app, BrowserWindow, shell, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ └── dist-electron
// │   └── main.js
//

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true, // Keep security on, use IPC for proxy
    },
    width: 1200,
    height: 800,
    title: 'AI Video Prompt Director',
  })

  win.setMenu(null)

  // Intercept navigation to open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  // Also handle direct navigation attempts (like <a> tags without target="_blank")
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  // Open devtools in development
  if (!app.isPackaged) {
    win.webContents.openDevTools()
  }

  win.webContents.on('did-fail-load', () => {
    console.error('Failed to load window')
    win?.loadFile(path.join(process.env.DIST, 'index.html'))
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// IPC Proxy for Fetch to bypass CORS
ipcMain.handle('fetch-proxy', async (_event, { url, options }) => {
  try {
    const response = await fetch(url, options);
    const status = response.status;
    const statusText = response.statusText;
    const headers = Object.fromEntries(response.headers.entries());
    const data = await response.text();
    
    return {
      ok: response.ok,
      status,
      statusText,
      headers,
      data
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Network request failed'
    };
  }
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
