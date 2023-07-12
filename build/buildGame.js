#!/usr/bin/env node
"use strict"

import { rollup } from 'rollup'
import { terser } from 'rollup-plugin-minification'
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets'
import svgo from 'svgo'
import fs from 'fs'
import { execSync } from 'child_process'

export default async function build() {
    fs.rmSync(`./dist`, { recursive: true, force: true })
    fs.mkdirSync(`./dist`, {}, console.log)

    // version
    const versionFile = fs.readFileSync('./game/version.txt')
    const versionFileNumber = +versionFile.toString('utf-8') + 1
    fs.writeFileSync('./game/version.txt', versionFileNumber.toFixed())
    fs.writeFileSync('./dist/version.txt', versionFileNumber.toFixed())

    function getBundle(url) {
        return rollup({
            input: url,
            plugins: [
                importMetaAssets({
                    transform: async (assetBuffer, assetPath) => {
                        if (assetPath.endsWith('.js')) {
                            const bundle = await getBundle(assetPath)
                            const generateBundle = await bundle.generate({ plugins: [terser()] })
                            return generateBundle.output[0].code
                        } else if (assetPath.endsWith('.svg')) {
                            return svgo.optimize(assetBuffer.toString(), {
                                multipass: true,
                                plugins: [
                                    // disable plugins
                                    'cleanupAttrs',
                                    'mergeStyles',
                                    'inlineStyles',
                                    'removeDoctype',
                                    'removeXMLProcInst',
                                    'removeComments',
                                    'removeMetadata',
                                    'removeTitle',
                                    'removeDesc',
                                    'removeUselessDefs',
                                    // 'removeXMLNS',
                                    'removeEditorsNSData',
                                    'removeEmptyAttrs',
                                    'removeHiddenElems',
                                    'removeEmptyText',
                                    'removeEmptyContainers',
                                    // 'removeViewBox',
                                    'cleanupEnableBackground',
                                    'minifyStyles',
                                    // 'convertStyleToAttrs',
                                    'convertColors',
                                    'convertPathData',
                                    'convertTransform',
                                    'removeUnknownsAndDefaults',
                                    'removeNonInheritableGroupAttrs',
                                    'removeUselessStrokeAndFill',
                                    // 'prefixIds',
                                    'cleanupNumericValues',
                                    'cleanupListOfValues',
                                    'moveElemsAttrsToGroup',
                                    'moveGroupAttrsToElems',
                                    'collapseGroups',
                                    'removeRasterImages',
                                    'mergePaths',
                                    'convertShapeToPath',
                                    'convertEllipseToCircle',
                                    'sortAttrs',
                                    'sortDefsChildren',
                                    // 'removeDimensions',
                                    // 'removeAttrs',
                                    // 'removeAttributesBySelector',
                                    // 'removeElementsByAttr',
                                    // 'addClassesToSVGElement',
                                    // 'addAttributesToSVGElement',
                                    'removeOffCanvasPaths',
                                    // 'removeStyleElement',
                                    'removeScriptElement',
                                    'reusePaths',
                                ]
                            }).data
                        } else {
                            return assetBuffer
                        }
                    },
                }),
            ]
        })
    }

    async function writeBundle(bundle) {
        await bundle.write({
            dir: `./dist`,
            format: 'es',
            plugins: [terser()]
        })

        await bundle.close()
    }

    await writeBundle(await getBundle('./game/main.js'))
    await writeBundle(await getBundle('./game/serviceWorker.js'))

    fs.copyFile('./game/index.html', './dist/index.html', console.log)
    fs.copyFile('./game/manifest.json', './dist/manifest.json', console.log)
    fs.copyFile('./game/logo.svg', './dist/logo.svg', console.log)
    fs.mkdirSync(`./dist/logo`, {}, console.log)
    execSync('cp -r ./game/logo ./dist/logo')
    execSync('cp -r ./assets/skills ./dist/assets/skills')
}

await build()
