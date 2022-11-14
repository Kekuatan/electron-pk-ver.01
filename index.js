const {app, BrowserWindow, ipcMain} = require("electron");
const {NFCService} = require("./services/NFCService")
const FormData = require("form-data");
const {TicketDataService} = require("./services/TicketDataService")
const {Print} = require("./services/PrintService")
const Axios = require('axios');
const {Camera} = require("./services/CameraService");
const ip = require("ip");
console.dir(ip.address());
const modelParameters = require('./models/parameters')

let a2 = async () => {
    await modelParameters.insertMany([
        {id: 1, name: 'access_token', value: 'access_token'},
        {id: 2, name: 'base_url', value: 'http://parkir-server.test'},
        {id: 5, name: 'camera_url', value: 'http://192.168.110.51//ISAPI/Streaming/channels/1/picture'},
        {id: 6, name: 'camera_username', value: 'admin'},
        {id: 7, name: 'camera_password', value: 'ADMIN123'},
        {id: 8, name: 'area_position', value: '1'},
    ]);
}
a2()

const path = require("path");

app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        webPreferences: {

            preload: path.join(process.cwd(), 'preload.js')
        },
        width: 1360,
        height: 768,
        frame: false
    });

    const printWindow = new BrowserWindow({
        webPreferences: {

            preload: path.join(process.cwd(), 'preload.js')
        },
        width: 1360,
        height: 768,
        frame: false
    });

    mainWindow.loadFile(path.join(__dirname, "public/index.html"));
    mainWindow.webContents.openDevTools();

    printWindow.webContents.openDevTools();
    // printWindow.loadFile(  path.join(process.cwd(), 'public', 'ticket.html'), {
    //     query: {queryKey: JSON.stringify()},
    //     hash: "hashValue",
    // });


    ipcMain.handle('login', async (event, payload) => {
        const base_url = modelParameters.select('base_url')['value'] + '/api/login'
        let access_token = ''
        const login = () => {
            return new Promise((resolve, reject) => {
                Axios.post(base_url, payload, {
                    headers: {'Content-Type': 'application/json;multipart/form-data'}
                }).then(function (response) {
                    access_token = response.data.access_token;
                    modelParameters.update('access_token', access_token)
                    response.data['status_code'] = response.status
                    resolve(resolve({data: response.data, status_code: response.status}))
                }).catch(function (error) {
                    console.log('Error on Authentication');
                    modelParameters.update('access_token', access_token)
                    error.response.data['status_code'] = error.response.status
                    resolve(error.response.data)
                });
            })
        }

        return await login();
    })

    ipcMain.handle('get', async (event, url) => {
        const access_token = modelParameters.select('access_token')['value']
        const base_url = modelParameters.select('base_url')['value'] + url
        let get = () => {

            return new Promise((resolve, reject) => {
                Axios.get(base_url, {}, {
                    headers: {
                        'Authorization': 'Bearer ' + access_token,
                        'Content-Type': 'application/json;multipart/form-data'
                    }
                }).then(function (response) {
                    console.log(response.status)
                    resolve({data: response.data, status_code: response.status})
                }).catch(function (error) {
                    error.response.data['status_code'] = error.response.status
                    resolve(error.response.data)
                });

            })
        }
        return await get()
    })


    ipcMain.handle('post', async (event, payload) => {
        let payloadForm = new FormData();
        console.log(payload)
        let body = payload.data
        let url = payload.url
        for (const d of Object.keys(body)) {
            if (d === 'picture_vehicle_out') {
                body[d] = await Camera.config().takeImage()
                payloadForm.append(d, body[d])
            }
            if(body[d] !== null){
                console.log(d)
                payloadForm.append(d, body[d])
            }
        }
        console.log('sd')
        const access_token = modelParameters.select('access_token')['value']
        const base_url = modelParameters.select('base_url')['value'] + url
        let post = () => {
            return new Promise((resolve, reject) => {
                Axios.post(base_url, payloadForm, {
                    headers: {
                        'Authorization': 'Bearer ' + access_token,
                        'Accept': 'application/json',
                        'Content-Type': `multipart/form-data`,
                    }
                }).then(function (response) {
                    console.log(response.status)
                    resolve({data: response.data, status_code: response.status})
                }).catch(function (error) {
                    error.response.data['status_code'] = error.response.status
                    resolve(error.response.data)
                });

            })
        }
        console.log('dd')
        return await post()
    })

    ipcMain.handle('getParameter', async (event, coloum) => {

        let getParameter = (coloum) => {
            return new Promise((resolve, reject) => {
                let payload = modelParameters.select(coloum)
                resolve(payload)
            })
        }
        return await getParameter(coloum)
    })

    ipcMain.handle('updateParameter', async (event, coloum) => {

        let getParameter = (coloum) => {
            return new Promise((resolve, reject) => {
                let payload = modelParameters.update(coloum[0], coloum[1])
                resolve(payload)
            })
        }
        return await getParameter(coloum)
    })


    ipcMain.handle('camera', async (event, coloum) => {
        let image = await Camera.config().takeImage()
        let camera = (image) => {
            return new Promise((resolve, reject) => {
                image.on('data', data => {
                    resolve('data:image/png;base64,' + data.toString('base64'))
                })

            })
        }
        console.log('index ok')
        return await camera(image)
    })

    ipcMain.handle('getMemberCardUid', async (event, payload) => {
        const getMemberCardUid = () => {
            return new Promise((resolve, reject) => {
                console.log('expose to main word', NFCService.card)
                resolve()
            })
        }

        await getMemberCardUid()
        if (NFCService.card == null) {
            console.log('expose to main word', null)
            return NFCService.card
        } else {
            console.log('expose to main word', NFCService.card.uid)
            return NFCService.card.uid;
        }

    })

    ipcMain.handle('printStruck', async (event, payload) => {
        let html = path.join(process.cwd(), 'public', 'ticket.html')
        await Print.struck(printWindow, html, payload)
        return payload
    })

    ipcMain.on('renew-active-win', async (currentWindow, response) => {
        console.log('show : ' + currentWindow)
        currentWindow = windows[currentWindow]
        if (currentWindow == activeWindow) {
            activeWindow.win.reload(response);
        } else {
            if (response) {
                currentWindow.createWindows(response)
            }
            activeWindow.win.close();
            activeWindow = currentWindow
        }
    })

});