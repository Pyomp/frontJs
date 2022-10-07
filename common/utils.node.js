import { request as httpsRequest } from 'https'
import { exec } from 'child_process'

export function fetch(options) {
    return new Promise((resolve, reject) => {
        const req = httpsRequest(options, (res) => {
            let data = ''
            res.on('data', (d) => { data += d.toString() })
            res.on('end', () => { resolve(data) })
        })
        req.on('error', (e) => { reject() })
        req.end()
    })
}

const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open')
export function openDefault(path) {
    exec(start + ' ' + path)
}
