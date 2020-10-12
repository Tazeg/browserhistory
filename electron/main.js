// ------------------------------------------------------------------------------
// Twitter : @JeffProd
// Web     : https://jeffprod.com
// ------------------------------------------------------------------------------

const url = require('url')
const path = require('path')
const { app, BrowserWindow, Menu } = require('electron')

let mainWindow = null

const mainUrl = url.format({ // https://electronjs.org/docs/api/browser-window#winloadurlurl-options
  protocol: 'file',
  slashes: true,
  pathname: path.join(__dirname, 'app/index.html')
})

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  console.log('App already running')
  app.quit()
} else {
  app.on('second-instance', () => { // event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) { mainWindow.restore() }
      mainWindow.focus()
    }
  })

  app.on('ready', function () {
    mainWindow = new BrowserWindow({
      center: true,
      minWidth: 1024,
      minHeight: 768,
      show: false,
      autoHideMenuBar: true, // hide menu bar
      icon: path.join(__dirname, 'app/img/icon_app_64.png'),
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        enableRemoteModule: true // https://www.electronjs.org/docs/breaking-changes#default-changed-enableremotemodule-defaults-to-false
      }
    })

    // remove menus
    Menu.setApplicationMenu(Menu.buildFromTemplate([]))
    mainWindow.loadURL(mainUrl)

    // event on main close
    mainWindow.on('closed', function () {
      mainWindow = null
      app.quit()
    })

    mainWindow.webContents.on('dom-ready', function () { // on windows10: did-finish-load and ready-to-show are not triggered
      // console.log('user-agent:', mainWindow.webContents.getUserAgent());
      if (process.env.ELECTRON_MODE === 'dev') {
        mainWindow.webContents.openDevTools()
      }
      mainWindow.maximize()
      mainWindow.show()
    })
  }) // app.on('ready'

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') { app.exit() }
  }) // app.on('window-all-closed'
} // else
