export const appTestUtils = {
    get DESCRIBE() { return 'describe' },
    get END_DESCRIBE() { return 'end_describe' },
    get TEST() { return 'test' },
    async getTestTree(url) {
        const iframe = document.createElement('iframe')
        
        const tree = []
        const describe = (title, callback) => {
            tree.push({ type: this.DESCRIBE, title })
            callback()
            tree.push({ type: this.END_DESCRIBE })
        }
        window.describe = describe

        const test = (title) => {
            tree.push({ type: this.TEST, title })
        }
        window.it = test
        window.test = test

        await import('/' + url)

        return tree
    },
    getTests(tree) {
        return tree.filter((value) => value.type === appTestUtils.TEST)
    },
    async getTestCallbacks(url) {
        const callbacks = []
        const describe = (title, callback) => {
            callback()
        }
        window.describe = describe

        const test = (title, callback) => {
            callbacks.push(callback)
        }
        window.it = test
        window.test = test

        await import('/' + url)

        return callbacks
    },
    pprint(tree) {
        for (const line of tree) {
            if (line.type === this.DESCRIBE) console.group(line.title)
            if (line.type === this.TEST) {
                const result = line.result
                if (result.success === true) {
                    console.log(`✅ ${line.title} (${result.time.toFixed(1)} ms)`)
                } else {
                    console.log(`❌ ${line.title} (${result.time.toFixed(1)} ms)`)
                    console.log(result.error)
                }
            }
            if (line.type === this.END_DESCRIBE) console.groupEnd()
        }
    },
    async runIframeFunction(url, functionName, ...args){
        const iframe = document.createElement('iframe')
        iframe.src = url
        iframe.allow = "display-capture"
        iframe.style.display = 'none'
    
        document.body.append(iframe)
    
        const waitForRunTestLoaded = () => new Promise((resolve) => {
            // @ts-ignore
            if (!iframe.contentWindow[functionName]) {
                setTimeout(() => { resolve(waitForRunTestLoaded()) })
            } else {
                resolve()
            }
        })
    
        const waitForLoad = () => new Promise(resolve => { iframe.contentWindow.onload = resolve })
    
        await waitForLoad()
        await waitForRunTestLoaded()
    
        // @ts-ignore
        const result = await iframe.contentWindow[functionName](...args)
    
        iframe.remove()
        return result
    }
}
