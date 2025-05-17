const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron')
const path = require('path')

let mainWindow
let tray = null
let popupWindow = null

function createWindow() {
  // Main hidden window
  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:deepseek-session'
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
    { label: 'Quit', click: () => app.quit() }
  ])
  tray.setContextMenu(contextMenu)
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
    width: 450,
    height: 500,
    x: bounds.x - 225, // Center above tray icon
    y: bounds.y - 510, // Position above taskbar
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

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})