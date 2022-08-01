const { app, BrowserWindow, ipcMain} = require("electron");
const{ NFCService } = require("./services/NFCService")
try {
    require('electron-reloader')(module)
} catch (_) {}
const path = require("path");
app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        webPreferences: {

            preload: path.join(process.cwd(), 'preload.js')
        },
        width:1360,
        height:768,
        frame: false});
    mainWindow.loadFile(path.join(__dirname, "public/index.html"));
    mainWindow.webContents.openDevTools();
});


ipcMain.handle('login', async (event,payload)=>{
    const login = () => {
        return new Promise((resolve, reject) => {

            console.log(payload)
            resolve()
            // Close and set current active window
            // ipcMain.emit('renew-active-win', 'HomeWindow', {
            //     'user.name' :  Store.get('user').name??null,
            //     'user.shift' :  Store.get('user').description??null,
            // })
        })
    }

    await login()

    return payload;
})

ipcMain.handle('getMemberCardUid', async (event,payload)=>{
    const login = () => {
        return new Promise((resolve, reject) => {
            console.log('expose to main word', NFCService.card)

            resolve()
            // Close and set current active window
            // ipcMain.emit('renew-active-win', 'HomeWindow', {
            //     'user.name' :  Store.get('user').name??null,
            //     'user.shift' :  Store.get('user').description??null,
            // })
        })
    }

    await login()
    if(NFCService.card == null){
        return  NFCService.card
    } else {
        return  NFCService.card.uid;
    }

})


ipcMain.on('renew-active-win', async ( currentWindow,response) => {
    console.log('show : ' + currentWindow)
    currentWindow = windows[currentWindow]
    if (currentWindow == activeWindow){
        activeWindow.win.reload(response);
    } else {
        if(response){
            currentWindow.createWindows(response)
        }
        activeWindow.win.close();
        activeWindow = currentWindow
    }
})