// Declaring Electron dependencies
const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set environment
//process.env.NODE_ENV = 'production';

// Declaring windows
global.mainWindow = null;
global.brokerSettingsWindow = null;

// Listen for app to be ready
app.on('ready', function(){
    // Create new window and Set tittle
    mainWindow = new BrowserWindow({
            show: false,
            width: 300 ,
            height: 300,
            title: 'Angucama',
            resizable: true,
            show : false
        });

    // Open after load  
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    //Load HTML into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './html/mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Close app when close
    mainWindow.on('closed', function(){
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle createBrokerSettingsWindow
function createBrokerSettingsWindow(){
    // Create new window
    brokerSettingsWindow = new BrowserWindow({
    show: false,
    width: 290,
    height: 120,
    title: 'Configurar IP broker',
    parent: mainWindow,
    modal: true,
    resizable: true,
    });
    // Load html into window
    brokerSettingsWindow.loadURL(url.format({
        pathname: path.join(__dirname, './html/brokerSettingsWindow.html'),
        protocol: 'file:',
        slashes: true
        }));

    // Remove menu bar
    brokerSettingsWindow.setMenu(null);
    
    // Open after load
    brokerSettingsWindow.once('ready-to-show', () => {
        brokerSettingsWindow.show();
    });
        
    //Garbage collection handle
    brokerSettingsWindow.on('closed', function(){
        brokerSettingsWindow = null;
    });
}

// Create menu template
const mainMenuTemplate = [
// Each object is a dropdown
{
label: 'Ajustes',
submenu: [
    {
        label: 'Configurar IP del broker',
        click(){
            createBrokerSettingsWindow();
        }
    }
]
}];

// If MAC, add an empty objet to menu
if(process.platform == 'darwin'){
mainMenuTemplate.unshift({});
}

// Add DevTools if not in production
if(process.env.NODE_ENV != 'production'){
mainMenuTemplate.push({
label: 'Developer Tools',
submenu: [
    {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
            focusedWindow.toggleDevTools();
            }
    },
    {
        role: 'reload'
    }
]
});
}