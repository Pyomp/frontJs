export class TestLog {
    logs = {}
    #previousGroup
    #currentGroup = this.logs

    group(str) {
        const newGroup = {}
        this.#currentGroup[str] = newGroup

        this.#previousGroup = this.#currentGroup
        this.#currentGroup = newGroup
    }

    groupEnd() {
        this.#currentGroup = this.#previousGroup
    }

    log(str, error) {
        this.#currentGroup[str] = error ?? 'success'
    }

    toSendable() {
        return this.#toSendableRec(structuredClone(this.logs))
    }

    #toSendableRec(tests) {
        for (const key in tests) {
            const result = tests[key]
            if (result instanceof Error) {
                tests[key] = (result.message + '\n' + result.stack).replaceAll(location.origin, '.')
            } else if (typeof result !== 'string') {
                this.#toSendableRec(result)
            }
        }
        return tests
    }

    toConsole(fileName = 'fileName') {
        this.#toConsole(fileName, this.logs)
    }

    #toConsole(groupeName, tests = this.logs) {
        console.group(groupeName)
        for (const key in tests) {
            const value = tests[key]


            if (value instanceof Error || value.constructor === String) {
                console.log(key)
                if (value !== 'success') console.log(value)
            } else {
                this.#toConsole(key, value)
            }
        }
        console.groupEnd()
    }
}


