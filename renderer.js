const { ipcRenderer } = require('electron')
const ipc = ipcRenderer
const marked = require('marked')
const DOMPurify = require('dompurify');
const fs = require('fs');
const path = require('path');

let userDataPath = process.env.APPDATA;

if (process.platform == 'darwin') {
    userDataPath = process.env.HOME + '/Library/Preferences/'
} else if (process.platform == 'linux') {
    userDataPath = process.env.HOME + '/.local/share/';
}

const minimizeButton = document.getElementById("minimize-btn");
const maxUnmaxButton = document.getElementById("maximize-btn");
const closeButton = document.getElementById("close-btn");
const iconMax = document.getElementById('icons-btn-max');

minimizeButton.addEventListener('click', ()=>{
    ipc.send('minimizeApp')
})

maxUnmaxButton.addEventListener('click', ()=>{
    ipc.send('maximizeRestoreApp')
})

function changeMaxResBtn(isMaximizedApp){
    if(isMaximizedApp){
        iconMax.classList.remove("fa-window-maximize");
        iconMax.classList.add("fa-window-restore");
        maxUnmaxButton.title = 'Restaurer'
    } else {
        iconMax.classList.add("fa-window-maximize");
        iconMax.classList.remove("fa-window-restore");
        maxUnmaxButton.title = 'Maximiser'
    }
}

ipc.on('isMaximized', ()=>{ changeMaxResBtn(true) })
ipc.on('isRestored', ()=>{ changeMaxResBtn(false) })

closeButton.addEventListener('click', ()=>{
    ipc.send('closeApp')
})

const titreApp = document.getElementById('titreApp')

if (titreApp !== null) {
    titreApp.addEventListener('click', ()=>{
        ipc.send('titreApp')
    })
}



function exchangeMessages() {
    marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function(code, lang) {
            const hljs = require('highlight.js');
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
        pedantic: false,
        gfm: true,
        breaks: false,
        sanitize: false,
        smartypants: false,
        xhtml: false
    });
    let first = true
    let messages = document.getElementById("messages");
    let question = document.getElementById("question").value;
    document.getElementById("question").setAttribute('value', '');
    document.getElementById("question").value = "";


    // send username to main.js 
    ipc.send('asynchronous-message', question)
    question = DOMPurify.sanitize(marked.parse(question));
    if (messages.innerHTML !== '') {
        messages.innerHTML += "<br><br>Utilisateur : " + question;
    } else {
        messages.innerHTML = "Utilisateur : " + question;
    }
    
    // receive message from main.js
    ipc.on('asynchronous-reply', (event, responseGPT) => {
        if (first) {
            responseGPT = DOMPurify.sanitize(marked.parse(responseGPT));
            messages.innerHTML += "<br><br>chatGPT : " + responseGPT;
            first = false;
        }
    })
    messages.scrollTop = messages.scrollHeight;
}


const submit = document.getElementById("submitButton");
submit.addEventListener('click', (event) => {
    exchangeMessages();
});

const textarea = document.getElementById("question");
textarea.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
        exchangeMessages(); 
    }
});