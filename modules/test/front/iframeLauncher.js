import { appTestUtils } from "./appTestUtils.js"

async function init() {
    // @ts-ignore
    window._runFile = async (fileTestUrl) => {
        const tree = await appTestUtils.getTestTree(fileTestUrl)
        const tests = appTestUtils.getTests(tree)
        const iframeTestUrl = new URL('./iframeTest.html', import.meta.url).href
        for (let testIndex = 0; testIndex < tests.length; testIndex++) {
            tests[testIndex].result = await appTestUtils.runIframeFunction(
                iframeTestUrl,
                '_runTest',
                fileTestUrl,
                testIndex
            )
        }
        return tree
    }
}

init()
