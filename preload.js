const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
        login: async (payload) => {
            return await ipcRenderer.invoke('login', payload)
                .then((result) => {
                console.log(payload,result)
                return result
            })
        },
        getMemberCardUid: async (payload) => {
            return await ipcRenderer.invoke('getMemberCardUid', payload)
                .then((result) => {
                    console.log(payload,result)
                    return result
                })
        },
    }
);