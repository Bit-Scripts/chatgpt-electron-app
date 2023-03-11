const { ipcRenderer } = require('electron')
const ipc = ipcRenderer
const marked = require('marked')
const DOMPurify = require('dompurify');
const fs = require('fs');
const path = require('path');
const { BlockList } = require('net');

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

let launch = true;

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
    if (!launch) {
        question = DOMPurify.sanitize(marked.parse(question));
        if (messages.innerHTML !== '') {
            messages.innerHTML += "<br><br><div id='Utilisateur'>Utilisateur : </div>" + question;
        } else {
            messages.innerHTML = "<div id='Utilisateur'>Utilisateur : </div>" + question;
        }
    }
    launch = false;
    // receive message from main.js
    ipc.on('asynchronous-reply', (event, responseGPT) => {
        if (first) {
            responseGPT = DOMPurify.sanitize(marked.parse(responseGPT));
            if (messages.innerHTML !== '') {
                messages.innerHTML += "<br><br><div id='chatGPT'>Marv : </div>" + responseGPT;
            } else {
                messages.innerHTML += "<div id='chatGPT'>Marv : </div>" + responseGPT;
            }            
            first = false;
        }
    })
    messages.scrollTop = messages.scrollHeight;
}

exchangeMessages();

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


const settings = document.getElementById('settings');
const close = document.getElementById('close');
let myModal = document.getElementById('myModal');

settings.addEventListener('click', (event) => {
    showModal();
});

close.addEventListener('click', (event) => {
    showModal();
});

function showModal() {
    if (myModal.style.display === 'none') {
        myModal.style.display = 'block';
    } else {
        myModal.style.display = 'none'
    }
}