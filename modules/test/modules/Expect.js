export function getValuableStack(stack) {

    /** @type {string[]} */
    const errorStackSplit = stack.split('\n')

    const indexToStop = errorStackSplit
        .findIndex((trace) => trace.includes('.test.js'))

    return errorStackSplit.slice(0, indexToStop + 1).join('\n')
}

export class Expect {
    constructor(value) {
        this.value = value
    }

    execute() {
        if (typeof this.value === 'function') {
            try {
                const result = this.value()

                if (result.constructor === Promise) {
                    this.value = result.catch((error) => error)
                } else {
                    this.value = result
                }
            } catch (error) {
                this.value = error
            }
        }

        return this
    }

    #throwError(expectedValue) {
        const error = new Error(`\nValue: ${stringifyWithUndefined(this.value)}\nExpected: ${stringifyWithUndefined(expectedValue)}`)
        error.stack = getValuableStack(error.stack)
        throw error
    }


    toBe(expectedValue) {
        if (this.value?.constructor === Promise) {
            return this.value.then((awaitedValue) => {
                this.value = awaitedValue
                this.toBe(expectedValue)
            })
        } else if (this.value !== expectedValue) {
            this.#throwError(expectedValue)
        }
    }

    toEqual(expectedValue) {
        if (this.value.constructor === Promise) {
            return this.value.then((awaitedValue) => {
                this.value = awaitedValue
                this.toEqual(expectedValue)
            })
        } else if (!isObjectsEqual(this.value, expectedValue) || !isObjectsEqual(expectedValue, this.value)) {
            this.#throwError(expectedValue)
        }
    }
}


function stringifyReplacer(key, value) { return value === undefined ? '__undefined__' : value }
function stringifyWithUndefined(object) {
    return JSON.stringify(object, stringifyReplacer, '  ').replaceAll('"__undefined__"', 'undefined')
}

function isObjectsEqual(o1, o2) {
    for (const key in o1) {
        if (o1[key] !== o2[key]) {
            if (
                typeof o1[key] === 'object'
                && typeof o2[key] === 'object'
            ) {
                return isObjectsEqual(o1[key], o2[key])
            } if (typeof o1[key] === 'undefined') {
                if (typeof o2[key] !== 'undefined') return false
            } else {
                return false
            }
        }
    }
    return true
}
