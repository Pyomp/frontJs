const devConsole = {
    yo() { return 'hey' }
}

Object.defineProperty(window, 'c', {
    get: () => devConsole
})
