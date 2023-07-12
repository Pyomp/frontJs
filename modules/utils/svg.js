const xmlns = "http://www.w3.org/2000/svg"

/** @return { SVGElement } */
export function createSvg({
    width = 100,
    height = 100,
}) {
    const svg = document.createElementNS(xmlns, "svg")
    svg.setAttribute('width', `${width}px`)
    svg.setAttribute('height', `${height}px`)
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    return svg
}

const svg = document.createElementNS(xmlns, "svg")

export function svgPath(path = '', attributes = {}) {
    let str = `<path d="${path}"`
    for (const key in attributes) {
        str += ` ${key}="${attributes[key]}" `
    }
    str += '/> '
    svg.innerHTML = str
    return svg.firstElementChild
}

export function svgLine({ x1 = 0, y1 = 0, x2 = 0, y2 = 0, }, attributes = {}) {
    let str = `<line x1="${x1}" x2="${x2}" y1="${y1}" y2="${y2}" `
    for (const key in attributes) {
        str += ` ${key}="${attributes[key]}" `
    }
    str += '/> '
    svg.innerHTML = str
    return svg.firstElementChild
}

