const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron')
const path = require('path')
const AutoLaunch = require('auto-launch')
const { exec } = require('child_process')

// Auto-launch configuration
const deepseekAutoLauncher = new AutoLaunch({
  name: 'DeepSeek QuickTab',
  path: app.getPath('exe'),
})

let mainWindow
let tray = null
let popupWindow = null

// Configure auto-start
async function configureAutoLaunch() {
  try {
    const isEnabled = await deepseekAutoLauncher.isEnabled()
    if (!isEnabled) {
      await deepseekAutoLauncher.enable()
    }
    // Windows registry fallback
    addToStartup()
  } catch (error) {
    console.error('Auto-launch configuration failed:', error)
  }
}

// Windows registry method
function addToStartup() {
  const appPath = process.execPath
  const regKey = `REG ADD HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run /v "DeepSeek QuickTab" /t REG_SZ /d "${appPath}" /f`
  
  exec(regKey, (error) => {
    if (error) console.error('Failed to add to startup:', error)
  })
}

function createWindow() {
  // Main hidden window
  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:deepseek-session',
      persistent: true
    }
  })
  mainWindow.loadURL('https://chat.deepseek.com/')

  // Tray icon setup
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png')
  tray = new Tray(nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 }))
  tray.setToolTip('DeepSeek Chat')

  // Tray click handler
  tray.on('click', (event, bounds) => {
    togglePopupWindow(bounds)
  })

  // Context menu
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open', click: () => mainWindow.show() },
    { 
      label: 'Start on Login', 
      type: 'checkbox',
      checked: true,
      click: () => toggleAutoLaunch()
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ])
  tray.setContextMenu(contextMenu)
}

async function toggleAutoLaunch() {
  try {
    const isEnabled = await deepseekAutoLauncher.isEnabled()
    if (isEnabled) {
      await deepseekAutoLauncher.disable()
    } else {
      await deepseekAutoLauncher.enable()
    }
  } catch (error) {
    console.error('Error toggling auto-launch:', error)
  }
}

function togglePopupWindow(bounds) {
  if (popupWindow && popupWindow.isVisible()) {
    popupWindow.hide()
    return
  }
  createPopupWindow(bounds)
}

function createPopupWindow(bounds) {
  if (popupWindow) {
    popupWindow.show()
    return
  }

  popupWindow = new BrowserWindow({
    width: 500,
    height: 730,
    x: bounds.x - 310,
    y: bounds.y - 740,
    frame: false,
    resizable: false,
    show: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:deepseek-session'
    }
  })

  popupWindow.loadURL('https://chat.deepseek.com/')

  popupWindow.on('closed', () => {
    popupWindow = null
  })

  popupWindow.on('blur', () => {
    if (popupWindow) popupWindow.hide()
  })
}

// Handle single instance
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    await configureAutoLaunch()
    createWindow()
  })
}

// Save state before quitting
app.on('before-quit', async () => {
  try {
    if (mainWindow) {
      await mainWindow.webContents.session.flushStorageData()
    }
  } catch (error) {
    console.error('Failed to save state:', error)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})