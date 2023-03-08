// preload.js

const { ipcRenderer } = require('electron')
const ipc = ipcRenderer
const fs = require('fs');
const path = require('path');

let userDataPath = process.env.APPDATA;

if (process.platform == 'darwin') {
  userDataPath = process.env.HOME + '/Library/Preferences/'
} else if (process.platform == 'linux') {
  userDataPath = process.env.HOME + '/.local/share/';
}

// Toutes les API Node.js sont disponibles dans le processus de pchargement.
// Il a la me sandbox qu'une extension Chrome.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
