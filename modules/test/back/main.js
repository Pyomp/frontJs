"use strict"

import fs from 'fs'
import express from 'express'
import { Chrome } from './chromeDevTools/Chrome.js'
import { fileUtils } from './fileUtils.js'
import { processUtils } from './processUtils.js'
import { wsTestServer } from './wsServer.js'
import { consoleUtils } from './consoleUtils.js'
import { WebSocket } from 'ws'

if (+process.version.slice(1, 3) < 20) throw 'Needs node v20'

consoleUtils.clearStdout()

processUtils.initExitEventListener()

/** @type {TestConfig} */
const config = JSON.parse(fs.readFileSync('test.config.json').toString())

const app = express()
const port = processUtils.args['--port'] ?? config['port'] ?? 5588

app.use(express.static('.'))

const server = app.listen(port, async () => {
    if (!processUtils.args['--no-headless']) {
        const chrome = new Chrome()
        processUtils.exitListeners.add(() => chrome.dispose())
        await chrome.init()
        await chrome.openNewTab(`http://localhost:${port}/modules/test/front/index.html`)
        consoleUtils.log('headless chrome ready')
    }

    let busy = false
    const runFileTest = (url) => {
        if (busy) return
        return new Promise((resolve) => {
            if (wsTestServer.client?.OPEN !== WebSocket.OPEN) {
                console.warn('client not connected')
                return
            }
            busy = true
            const t0 = performance.now()
            wsTestServer.client.send(JSON.stringify({ command: 'runUnit', data: url }))
            wsTestServer.client.onmessage = (event) => {

                try {
                    const result = JSON.parse(event.data.toString())
                    if (result.command !== 'result') return
                    wsTestServer.client.onmessage = null
                    busy = false
                    resolve(result)
                    consoleUtils.pprintResult(url, result.data, t0)
                    consoleUtils.displayInput()
                } catch (error) {
                    resolve(error)
                    console.warn(error)
                }
            }
        })
    }
    
    wsTestServer.dispatcher['print'] = (data) => { consoleUtils.log(`client console.${data.type}: `, data.args) }

    consoleUtils.stdinDispatcher['exit'] = () => { process.exit() }
    consoleUtils.stdinDispatcher['test'] = (filename) => {
        const filenameLowerCase = filename.toLowerCase()
        const testFilePaths = fileUtils.getTestFiles('.', config.foldersToBeIgnored)
        const testFile = testFilePaths.find((filePath) => filePath.toLowerCase().includes(filenameLowerCase))
        if (testFile) {
            fileUtils.currentUrlWatched = testFile
            runFileTest(testFile)
        }
    }
    consoleUtils.stdinDispatcher[''] = () => {
        if (fileUtils.currentUrlWatched) return runFileTest(fileUtils.currentUrlWatched)
        else consoleUtils.displayInput()
    }
    consoleUtils.initStdinInput()

    fileUtils.watchFiles('.', config.foldersToBeIgnored, runFileTest)
    consoleUtils.displayInput()
})

wsTestServer.init(server)
wsTestServer.connectionListeners.add(() => {
    consoleUtils.log('websocket new connection')
    consoleUtils.log('ready to test')
})
