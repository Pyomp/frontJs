import { appTestUtils } from "../front/appTestUtils.js"
import { Expect, getValuableStack } from "../modules/Expect.js"

function runTest(test) {
    return new Promise(
        async (resolve) => {
            const timeout = setTimeout(() => {
                resolve({ success: false, error: new Error('timeout'), time: performance.now() - t0 })
            }, config.maxUnitTestDuration)

            const t0 = performance.now()
            try {
                await test()
                resolve({ success: true, time: performance.now() - t0 })
            } catch (error) {
                if (error instanceof Error) {
                    error.stack = getValuableStack(error.stack)
                }
                resolve({ success: false, error: error.stack?? error.toString(), time: performance.now() - t0 })
            } finally {
                clearTimeout(timeout)
            }
        })
}

/** @type {TestConfig} */
let config

async function init() {
    config = await (await fetch('/test.config.json')).json()

    localStorage.clear()
    sessionStorage.clear()

    window.expect = (value) => {
        return new Expect(value).execute()
    }

    window._runTest = async (testUrl, testIndex) => {
        const tests = await appTestUtils.getTestCallbacks(testUrl)
        return runTest(tests[testIndex])
    }
}

init()
