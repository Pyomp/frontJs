export const wait = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export const nonce = (length) => {
    let text = ""; const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length))
    return text
}

export const text_decoder = new TextDecoder()
export const text_encoder = new TextEncoder()

export const arrayGetRandom = (array) => {
    return array[Math.floor(array.length * Math.random())]
}

export function parseHash(hash) {
    if (hash?.constructor !== String) return {}
    const params = {}
    for (const hk of hash.substring(1).split('&')) {
        const temp = hk.split('=')
        if (temp.length < 2) return {}
        params[temp[0]] = temp[1]
    }
    return params
}

export class TimeoutAbortController extends AbortController {
    constructor(ms) {
        super()
        setTimeout(() => this.abort(), ms)
    }
}