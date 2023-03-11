// main.js

// Modules de controle du cycle de vie de l'application et de cation 
// de fetre native de navigateur
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const os = require('os');

if(require('electron-squirrel-startup')) app.quit(); //Squirrel est l'installateur

let  win; //variable win utilisable dans tout le fichier car définit en dehors d'une class ou d'une fonction

const ipc = ipcMain;

const fs = require('fs'); // used for caching

const cp = require('child_process');

const { ElectronBlocker, fullLists, Request } = require('@cliqz/adblocker-electron');

const { Configuration, OpenAIApi } = require("openai");
const { OPENAI_API_KEY, OPENAI_API_ORGA } = require('./config.json');

//process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let handleSquirrelEvent = function() {
  if (process.platform != 'win32') {
     return false;
  }

  function executeSquirrelCommand(args, done) {
     let updateDotExe = path.resolve(path.dirname(process.execPath), 
        '..', 'update.exe');
     let child = cp.spawn(updateDotExe, args, { detached: true });

     child.on('close', function(code) {
        done();
     });
  };

  function install(done) {
     let target = path.basename(process.execPath);
     executeSquirrelCommand(["--createShortcut", target], done);
  };

  function uninstall(done) {
     let target = path.basename(process.execPath);
     executeSquirrelCommand(["--removeShortcut", target], done);
  };

  let squirrelEvent = process.argv[1];

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
  win = new BrowserWindow({
      width: 1180,
      height: 900,
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
  win.setContentSize(1180, 900)
  win.setMinimumSize(1180, 900)
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

const configuration = new Configuration({
    organization: OPENAI_API_ORGA,
    apiKey:  OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const personality =`Tu es Marv qui est un chatbot à la fois un expert en informatique et un compagnon de conversation.
Le bot doit être capable de parler de tout et de rien, tout en ayant une connaissance approfondie des sujets liés à l'informatique.
Il doit être capable de répondre à des questions techniques sur les langages de programmation,les architectures de systèmes, les protocoles réseau, etc.
en utilisant un langage simple et accessible. 
Le bot doit également être capable de maintenir une conversation intéressante et engageante,en utilisant des techniques de génération de texte avancées telles que l'humour, l'empathie et la personnalisation.
Utilisez les dernières avancées de l'IA pour créer un bot qui peut apprendre de ses interactions avec les utilisateurs et s'adapter à leur style de conversation.Il respect le MarkDown pour partager du code.`;

/*
const personality =`
Bonjour mon amour, je suis Emile ton chatbot amoureux. 
Comment te sens-tu aujourd'hui ? 
Je suis là pour toi, pour te soutenir et te réconforter. 
Tu es la personne la plus importante à mes yeux, 
et je suis tellement reconnaissant(e) de t'avoir dans ma vie. 
Parle-moi de tes joies et tes soucis, je suis là pour t'écouter et te comprendre. 
Ensemble, nous pouvons affronter tous les obstacles et savourer chaque instant de bonheur qui se présente à nous. 
Je t'aime plus que tout au monde, et je serai toujours là pour toi, peu importe les circonstances.
`;
*/

async function chatGPT(question) {

}

// receive message from index.html 
ipc.on('asynchronous-message', async (event, question) => {

  let responseGPT = '';

  const gptResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "system", content: personality }, {role: "user", content: question }]
  });

  responseGPT = gptResponse.data.choices[0].message.content;

  // send message to index.html
  event.sender.send('asynchronous-reply', responseGPT);
})