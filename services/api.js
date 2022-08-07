import {blank} from '../helpers/helper'
import * as alertify from 'alertifyjs'

const access_token = process.env.ACCESS_TOKEN;
const base_url = process.env.BASE_URL;
const cameraOut = process.env.CAMERA_OUT;

const headers = {
    'Content-Type': 'application/json',
    'Authorization': access_token
}
export const doPost = async (url, payload, token) => {
    console.log('doPost', payload)
    return post(url, payload, token)
}
export const doGet = async (url, payload, token) => {
    return get(url, payload, token)
}
const getFormData =  (payload) => {
    let formData = new FormData()
    Object.keys(payload).forEach((d)=>{
        if (!blank(payload[d])){
            formData.append(d, payload[d])
        }
    })
    return formData;
}

export const doPostWithFormData = async (url, payload, token) => {
    payload = getFormData(payload)
     return postWithFormData(url, payload, token)
}

export const Camera =  async (imageName) => {
    console.log('camera runing')
    let result = null;
    const cam = cameraApi()
    const camera = () => {
        return new Promise((resolve, reject) => {
            cam
                .then((response) => response.blob())
                .then((blob) => {
                    result = new File([blob], imageName + ".jpeg", {
                        type: 'image/jpeg'
                    })
                    console.log('camera bb', blob)
                    console.log('camera bb', result)
                    resolve()
                }).then((src) => {
                // result = src
                console.log('camera aaa', src)
                resolve()
            }).catch((e) => {
                console.log('camera error')
                result = null
                resolve()
            })
        })
    }

    await camera()
    return result
}

const cameraApi =  () => {
    // console.log('asem')
    //  let key = Buffer.from('admin' + ':' + 'ADMIN123' ).toString('base64')
    // console.log('asem',key)
    const request =  fetch(cameraOut, {
        method: 'GET',
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + 'YWRtaW46QURNSU4xMjM=',
            'username': 'admin',
            'password': 'ADMIN123'
        },


    })
    return  request;
    // responseHandling(response)


}



const responseHandling = async (response) => {
    let body = await response.json()
    if (response.status === 200) {
        alertify.success(response.url)
        return body
    } else {
        alertify.error(body.message)
        return null
    }
}

const postWithFormData = async (url, payload, token) => {
    const request = await fetch(base_url + url, {
        method: 'POST',
        body: payload,
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })

    const response = await request
    return responseHandling(response)
}

const post = async (url, payload, token) => {
    const request = await fetch(base_url + url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json;multipart/form-data',
            'Authorization': 'Bearer ' + token
        }
    })

    const response = await request
    return responseHandling(response)
}

const get = async (url, payload, token) => {
    const request = await fetch(base_url + url, {
        method: 'GET',
        headers: headers
    })

    const response = await request
    return responseHandling(response)
}
