export const processUtils = {
    exitListeners: new Set(),
    initExitEventListener() {
        const onExit = async () => {
            for (const callback of processUtils.exitListeners) await callback()
            process.exit()
        }

        process.on('exit', onExit)
        process.on('SIGINT', onExit)
        process.on('SIGUSR1', onExit)
        process.on('SIGUSR2', onExit)
        // process.on('uncaughtException', onExit)
    },
    args: getArgs()
}

function getArgs() {
    const valuableArgs = process.argv.filter((arg) => arg.startsWith('--'))
    const result = {}
    for (const arg of valuableArgs) {
        const [key, value] = arg.split('=', 2)
        result[key] = value ?? true
    }
    return result
}
