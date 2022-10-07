/**
 * @template {{}} T
 * @param {T} object 
 * @returns {T & TestMetadata}
 */
export function mock(object) {
    const proxy = new Proxy(
        Object.assign(object, new TestMetadata()),
        {
            get(target, p, receiver) {
                const type = typeof target[p]

                if (type === 'function') {
                    const fn = Reflect.get(target, p, receiver).bind(target)
                    incrFunctionCall(p, target.testMetadata.functionCall)
                    // countPrivateCall(fn, target.testMetadata.functionCall)
                    return fn
                }

                return Reflect.get(target, p, receiver)
            },
        }
    )

    return proxy
}

class TestMetadata {
    testMetadata = new Metadata()
}

class Metadata {
    functionCall = {}
    takeSnapshot() {
        this.snapshots[performance.now()] = {
            functionCall: { ...this.functionCall }
        }
    }
    snapshots = {}
}

/** TODO */
function countPrivateCall(fn, target) {
    // const regex = /this\.#[^\(]*\([^\)]*\)/g
    // console.log(regex.exec(A.prototype.b.toString()))
    // console.log(regex.exec(A.prototype.b.toString()))
    incrFunctionCall('#?', target)
}

function incrFunctionCall(functionName, target) {
    if (!target[functionName]) {
        target[functionName] = 1
    } else {
        target[functionName]++
    }
}