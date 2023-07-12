import { WebSocket } from 'ws'
import { execSync, spawn } from 'child_process'
import { chromeHttp } from './chromeHttp.js'
import { consoleUtils } from '../consoleUtils.js'

export class Chrome {
    #browserWsUrl = ''
    #chromeDebugPort = 9222
    /** @type {ReturnType<typeof spawn>} */ #chrome
    /** @type {WebsocketManager} */ wsBrowser
    /** @type {Record<string, WebsocketManager>} */ wsTabs = {}

    constructor() { }

    init(chromeDebugPort = 9222) {
        return new Promise((resolve) => {
            this.#chromeDebugPort = chromeDebugPort

            execSync('rm -rf .chromeTestDataDir')

            this.#chrome = spawn('google-chrome', [
                '--headless=new',
                `--remote-debugging-port=${chromeDebugPort}`,
                '--user-data-dir=.chromeTestDataDir'
            ])

            const stringToMatch = 'DevTools listening on '

            const setBrowserWsUrlListener = async (/** @type {string} */ data) => {
                const lines = data.toString().split('\n')
                for (const line of lines) {
                    consoleUtils.log(line)
                    if (!this.#browserWsUrl && line.slice(0, stringToMatch.length) === stringToMatch) {

                        this.#browserWsUrl = line.slice(stringToMatch.length)

                        this.#chrome.stdout.off('data', setBrowserWsUrlListener)
                        this.#chrome.stderr.off('data', setBrowserWsUrlListener)

                        this.wsBrowser = new WebsocketManager(this.#browserWsUrl)
                        await this.wsBrowser.init()
                        resolve()
                    }
                }
            }
            this.#chrome.stdout.on('data', setBrowserWsUrlListener)
            this.#chrome.stderr.on('data', setBrowserWsUrlListener)
        })
    }

    async openNewTab(url) {
        const response = await chromeHttp.putNewTab(this.#chromeDebugPort, url)
        this.wsTabs[url] = new WebsocketManager(response.webSocketDebuggerUrl)
        await this.wsTabs[url].init()
        return this.wsTabs[url]
    }

    getChromeDebugList() { return chromeHttp.getDebugList(this.#chromeDebugPort) }

    dispose() {
        return new Promise((resolve) => {
            this.wsBrowser?.close()
            for (const wsManager of Object.values(this.wsTabs)) {
                wsManager.close()
            }
            this.#chrome.kill()
            this.#chrome.on('close', () => {
                execSync('rm -rf .chromeTestDataDir')
                resolve()
            })
        })
    }
}

/**
 * @description
 * - init() will resolve after open
 * - auto reconnect on close
 * - close() will stop reconnection
*/
class WebsocketManager {
    #url = ''
    /** @type {WebSocket} */ ws

    constructor(url) {
        this.#url = url
    }

    #initBound = this.init.bind(this)
    init() {
        if (this.#closeRequest) return

        return new Promise((resolve) => {
            this.ws = new WebSocket(this.#url)
            this.ws.addEventListener('close', this.#closeListenerBound)
            this.ws.addEventListener('open', resolve)
        })
    }

    #closeListenerBound = this.#closeListener.bind(this)
    #reconnectTimeout
    #closeListener() {
        if (this.#closeRequest) return
        clearTimeout(this.#reconnectTimeout)
        this.#reconnectTimeout = setTimeout(this.#initBound, 1000)
    }

    #closeRequest = false
    close() {
        this.#closeRequest = true
        clearTimeout(this.#reconnectTimeout)
        this.ws.close()
    }
}
