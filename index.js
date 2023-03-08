// main.js

// Modules de controle du cycle de vie de l'application et de cation 
// de fetre native de navigateur
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

if(require('electron-squirrel-startup')) app.quit();

const ipc = ipcMain;

const fs = require('fs'); // used for caching

const cp = require('child_process');

const { ElectronBlocker, fullLists, Request } = require('@cliqz/adblocker-electron');

//process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

var handleSquirrelEvent = function() {
  if (process.platform != 'win32') {
     return false;
  }

  function executeSquirrelCommand(args, done) {
     var updateDotExe = path.resolve(path.dirname(process.execPath), 
        '..', 'update.exe');
     var child = cp.spawn(updateDotExe, args, { detached: true });

     child.on('close', function(code) {
        done();
     });
  };

  function install(done) {
     var target = path.basename(process.execPath);
     executeSquirrelCommand(["--createShortcut", target], done);
  };

  function uninstall(done) {
     var target = path.basename(process.execPath);
     executeSquirrelCommand(["--removeShortcut", target], done);
  };

  var squirrelEvent = process.argv[1];

  switch (squirrelEvent) {

     case '--squirrel-install':
        install(app.quit);
        return true;

     case '--squirrel-updated':
        install(app.quit);
        return true;

     case '--squirrel-obsolete':
        app.quit();
        return true;

     case '--squirrel-uninstall':
        uninstall(app.quit);
        return true;
  }

  return false;
};

if (handleSquirrelEvent()) {
  app.quit();
}

async function createWindow() {
  const win = new BrowserWindow({
      width: 1080,
      height: 608,
      icon: path.resolve(__dirname, 'chatgpt.ico'),
      frame: false,
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
  });

  win.setResizable(true)
  win.setContentSize(1080, 608)
  win.setMinimumSize(1080, 608)
  win.center()

  if (process.platform == 'darwin') {
    win.setWindowButtonVisibility(false);
  }

  const blocker = await ElectronBlocker.fromLists(fetch, fullLists, {
    enableCompression: true,
  });

  blocker.enableBlockingInSession(win.webContents.session);

  blocker.on('request-blocked', (request) => {
    console.log('blocked', request.tabId, request.url);
  });

  blocker.on('request-redirected', (request) => {
    console.log('redirected', request.tabId, request.url);
  });

  blocker.on('request-whitelisted', (request) => {
    console.log('whitelisted', request.tabId, request.url);
  });

  blocker.on('csp-injected', (request) => {
    console.log('csp', request.url);
  });

  win.setBackgroundColor('#202020')

  win.loadFile('index.html')
  win.setResizable(true)

  ipc.on('loaded', ()=>{
    launchIndex()
  })

  /*function launchIndex() {
    win.loadFile('index.html')
    win.setResizable(true)
    win.setContentSize(1080, 608)
    win.setMinimumSize(1080, 608)
    win.center()
  }*/

  win.webContents.send('isMaximized')

  ipc.on('minimizeApp', ()=>{
    win.minimize()
  })

  ipc.on('maximizeRestoreApp', ()=>{
    if (win.isMaximized()) {
      win.restore()
    } else {
      win.maximize()
    }
  })

  win.on('maximize', ()=>{
    win.webContents.send('isMaximized')
  })

  win.on('unmaximize', ()=>{
    win.webContents.send('isRestored')
  })

  ipc.on('closeApp', ()=>{
    win.close()
  })

}

app.whenReady().then(() => {
  createWindow();
});

function loadBlocklist(file) {
throw new Error('Function not implemented.');
}

