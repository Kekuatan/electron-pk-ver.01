import {blank} from '../helpers/helper'

 const access_token = process.env.ACCESS_TOKEN;
 const base_url = process.env.BASE_URL;
const cameraOut = process.env.CAMERA_OUT;
 const headers = {
     'Content-Type' : 'application/json',
     'Authorization' :  access_token
 }
export const doPost = async (url , payload, token) => {
     console.log(payload)
    const response = await fetch(base_url + url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type' : 'application/json;multipart/form-data',
            'Authorization' :  'Bearer ' + token
        }
    })
    if (response.status === 200) {
        return await response.json();
    } else {
        throw new Error(response.statusText);
    }
}

export const doPostWithImage = async (url , payload, token) => {
    console.log(payload)
    const response = await fetch(base_url + url, {
        method: 'POST',
        body: payload,
        headers: {
            'Authorization' :  'Bearer ' + token
        }
    })
    if (response.status === 200) {
        return await response.json();
    } else {
        throw new Error(response.statusText);
    }
}

export const CameraOut = async () => {
    // let key = Buffer.from('admin' + ':' + 'ADMIN123' ).toString('base64')
    // console.log(key)
    const response = await fetch(cameraOut, {
        method: 'GET',
        headers: {
            'Content-Type' : 'multipart/form-data',
            'Accept' : 'application/json',
            'Authorization' :  'Basic ' + 'YWRtaW46QURNSU4xMjM=',
            'username': 'admin',
            'password': 'ADMIN123'
        },



    })
    if (response.status === 200) {
        console.log(response)
        return response
    } else {
        console.log(response)
        throw new Error(response);
    }
}

export const doGet = async (url , payload, token ) => {
    console.log(payload)
    const response = await fetch(base_url + url, {
        method: 'GET',
        headers: headers
    })
    if (response.status === 200) {
        return await response.json();
    } else {
        throw new Error(response.statusText);
    }
}