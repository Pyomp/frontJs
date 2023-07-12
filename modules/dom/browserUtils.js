
/** return the color of the word O.o */
export const colorWord = (strP) => {
    const str = /[a-zA-Z]{1,2}/.exec(strP)[0]
    let hue = parseInt(str, 36)
    if (!(hue > 0 && hue < Infinity)) {
        hue = Math.random() * 360
    }
    hue %= 360
    return hue.toFixed(0)
}

const div = document.createElement('div')

export const stringToSvgElement = (svgString, width, height) => {
    div.innerHTML = svgString

    if (div.firstElementChild instanceof SVGElement) {
        const svg = div.firstElementChild
        svg.style.width = width + 'px'
        svg.style.height = height + 'px'
        svg.setAttribute('width', width)
        svg.setAttribute('height', height)
        return svg
    } else {
        return null
    }

}

/** @return {Promise<SVGElement | null>} */
export async function createSvgElement(url) {
    const svgString = await (await fetch(url)).text()
    div.innerHTML = svgString
    return div.firstElementChild instanceof SVGElement ? div.firstElementChild : null
}

export const loadSvg = async (url, width, height) => {
    const file = await fetch(url)
    if (file.ok === false) return
    const svg = await file.text()
    return stringToSvgElement(svg, width, height)
}

export const svgToImg = (svgString, width = 64, height = 64, img = new Image()) => {
    img.width = width
    img.height = height
    return new Promise((resolve) => {
        img.onload = () => {
            resolve(img)
        }
        img.onerror = (err) => {
            console.log(err)
            resolve()
        }
        img.src = "data:image/svg+xml;base64," + btoa(svgString)
    })
}


export const svgToCanvas = async (svgString, width = 64, height = 64, canvas = document.createElement('canvas')) => {
    const buffImage = await svgToImg(svgString, width, height)
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(buffImage, 0, 0)
    return canvas
}

/** @param {Array} array */
export const arrayToModuleJS = (array) => {
    return new Promise(async (resolve) => {
        try {
            const blob = new Blob([new Uint8Array(array)], { type: 'text/javascript' })
            const url = URL.createObjectURL(blob)
            const module = await import(url)
            URL.revokeObjectURL(url)
            resolve(module)
        } catch { resolve() }
    })
}

export const uint8arrayToBase64 = (uint8array) => {
    return btoa(String.fromCharCode(...uint8array))
}

export const base64ToUint8array = (base64Str) => {
    try {
        return Uint8Array.from(atob(base64Str), c => c.charCodeAt(0))
    } catch (e) { console.warn(e) }
}

/** @param {Partial<CSSStyleDeclaration> | Record<string, string>} style */
export const setStyle = (element, style = {}) => {
    const s = element.style
    for (const key in style) {
        if (s[key] === undefined) {
            s.setProperty(key, style[key])
        } else {
            s[key] = style[key]
        }
    }
}
