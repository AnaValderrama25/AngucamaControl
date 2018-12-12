const electron = require('electron');
const { remote, ipcRenderer } = electron;

const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

function submitForm(e){
    e.preventDefault();
    const ip = document.querySelector('#ip').value;
    let mainWindow = remote.getGlobal ('mainWindow');
    mainWindow.webContents.send ('ip:set', ip);
}