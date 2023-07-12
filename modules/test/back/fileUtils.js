import path, { relative, resolve } from 'path'
import fs from 'fs'
import fsPromises from 'node:fs/promises'

function hasDirectoryToIgnore(url, foldersToBeIgnored) {
    const pathSplits = url.split(path.sep)

    for (const ignoredFolder of foldersToBeIgnored) {
        if (pathSplits.includes(ignoredFolder)) {
            return true
        }
    }

    return false
}

function getTestFiles(rootPath, foldersToBeIgnored) {
    const result = []
    const dirs = fs.readdirSync(rootPath, { encoding: 'utf-8' })
    for (const name of dirs) {
        if (!foldersToBeIgnored.some((folderToBeIgnored) => name.endsWith(folderToBeIgnored))) {
            const fullPath = resolve(rootPath, name)
            if (fs.statSync(fullPath).isDirectory()) {
                result.push(...getTestFiles(fullPath, foldersToBeIgnored))
            } else if (name.endsWith('.test.js')) {
                result.push(relative('.', fullPath))
            }
        }
    }
    return result
}

export const fileUtils = {
    getTestFiles(rootPath, foldersToBeIgnored) {
        return getTestFiles(rootPath, foldersToBeIgnored)
    },
    currentUrlWatched: '',
    watchFiles(rootPath, foldersToBeIgnored, /** @type {(url: string)=>void} */ callbackOnFileChange) {
        const currentImportFileWatchers = []
        const fileTestsWatchers = []

        let disposed = false

        const fileUrls = fileUtils.getTestFiles(rootPath, foldersToBeIgnored)
        for (const url of fileUrls) {
            const callback = () => { callbackOnFileChange(url) }
            fileTestsWatchers.push(
                fs.watch(url, {}, async () => {
                    if (this.currentUrlWatched !== url) {
                        this.currentUrlWatched = url
                        for (const watcher of currentImportFileWatchers) watcher.close()
                        currentImportFileWatchers.length = 0

                        const importedFileUrls = await fileUtils.getImportedFileUrls(url)

                        if (disposed) return
                        for (const importedFileUrl of importedFileUrls) {
                            currentImportFileWatchers.push(
                                fs.watch(importedFileUrl, {}, callback))
                        }

                    }
                    callback()
                })
            )
        }

        const dispose = () => {
            disposed = true
            for (const watcher of fileTestsWatchers) watcher.close()
            for (const watcher of currentImportFileWatchers) watcher.close()
        }

        return dispose
    },
    async getImportedFileUrls(fileUrl, result = []) {
        const testFile = await fsPromises.open(fileUrl)

        for await (const line of testFile.readLines()) {
            const split = line.split(' ')
            if (split[0] === 'import' && split[split.length - 2] === 'from') {
                const last = split[split.length - 1]
                const moduleRelativeUrl = last.slice(1, last[last.length - 1] === ';' ? -2 : - 1)
                const moduleUrl = path.resolve(path.dirname(fileUrl), moduleRelativeUrl)
                result.push(moduleUrl)
                fileUtils.getImportedFileUrls(moduleUrl, result)
            }
        }

        return result
    }
}
