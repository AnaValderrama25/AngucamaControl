// Declaring Electron dependencies
const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set environment
//process.env.NODE_ENV = 'production';

// Declaring windows
let mainWindow;

// Declaring time arrays


// Listen for app to be ready
app.on('ready', function(){
    // Create new window and Set tittle
    mainWindow = new BrowserWindow({
            show: false,
            width: 600 ,
            height: 600,
            title: 'Angucama',
            //resizable: false,
            x: 0,
            y: 0
        });

    // Open after load  
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    //Load HTML into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
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


// Create menu template
const mainMenuTemplate = [
    // Each object is a dropdown
    {
        label: 'Ajustes',
        submenu: [
            {
                label: 'Configurar Restricción',
                
            }
        ]
    },
    {
        label: 'Ayuda',
        submenu: [
            {
                label: 'Acerca de Angucama',
                
            }
        ]
    }
];

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