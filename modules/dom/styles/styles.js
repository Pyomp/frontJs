import { StylesVar } from "./StylesVar.js"
import { EventSet } from "../../utils/EventSet.js"

const darkStyle = {
    '--background1': 'hsl(0, 0%, 4%)',
    '--background2': 'hsl(0, 0%, 8%)',
    '--background3': 'hsl(0, 0%, 12%)',
    '--background-transparent01': 'rgba(0, 0, 0, 0.1)',
    '--background-transparent03': 'rgba(0, 0, 0, 0.3)',
    '--background-transparent05': 'rgba(0, 0, 0, 0.5)',
    '--background-transparent07': 'rgba(0, 0, 0, 0.7)',
    '--themeColor': 'hsl(200, 100%, 50%)',
    '--themeColorWhiter': 'hsl(200, 100%, 70%)',

    '--color1': 'hsl(0, 0%, 95%)',
    '--color2': 'hsl(0, 0%, 85%)',
    '--color3': 'hsl(0, 0%, 75%)',
}

darkStyle['--themeColorGradient'] = `linear-gradient(${darkStyle['--themeColorWhiter']}, ${darkStyle['--themeColor']})`

const lightStyle = {
    '--background1': 'hsl(0, 0%, 100%)',
    '--background2': 'hsl(0, 0%, 90%)',
    '--background3': 'hsl(0, 0%, 80%)',
    '--background-transparent01': 'rgba(255, 255, 255, 0.1)',
    '--background-transparent03': 'rgba(255, 255, 255, 0.3)',
    '--background-transparent05': 'rgba(255, 255, 255, 0.5)',
    '--background-transparent07': 'rgba(255, 255, 255, 0.7)',
    '--color1': 'hsl(0, 0%, 0%)',
    '--color2': 'hsl(0, 0%, 5%)',
    '--color3': 'hsl(0, 0%, 10%)',
}
const styleVar = new StylesVar(darkStyle)

let onChange = new EventSet()
let isDark = true

export const styles = {
    get onChange() { return onChange },
    get isDark() { return isDark },
    get vars() { return styleVar.varKeys },
    setDark() { styleVar.updateStyleVar(darkStyle); isDark = true; onChange.emit() },
    setLight() { styleVar.updateStyleVar(lightStyle); isDark = false; onChange.emit() }
}

const styleElement = document.createElement('style')
document.head.appendChild(styleElement)
styleElement.textContent = /*css*/`
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    text-align: justify;
    text-justify: inter-word;
}

html,
body {
    width: 100%;
    height: 100%;

    overflow: hidden;
}

body {
    font-family: courier, sans-serif;
    -webkit-user-drag: none;
    background: ${styles.vars["--background1"]};
    color: ${styles.vars["--color1"]};

    line-height: 1.4;
    
    touch-action: none;
    transition: filter 1s;
    font-size: 14px;

    -webkit-tap-highlight-color: transparent;
    scrollbar-color: var(--background3) var(--background1);
    scrollbar-width: thin;
}

select,
option {
    background: var(--background1);
    color: var(--color1);
    border-radius: 5px;
}

section {
    min-height: 500px;
    width: 100%;
}

h1 {
    font-size: xx-large;
    padding: 10px;
    text-align: center;
}

h2 {
    font-size: x-large;
    padding: 10px;
    text-align: center;
}

h3 {
    font-size: larger;
    padding: 10px;
    text-align: center;
}

::-webkit-scrollbar {
    width: initial;
    color: var(--color-scroll-bar);
    background-color: var(--color-background-scroll-bar);
}

::-webkit-scrollbar-thumb {
    background-color: var(--color-scroll-bar);
}

.margin_bottom_scrollbar::-webkit-scrollbar-track {
    margin-bottom: 30px;
    background-color: var(--color-background-scroll-bar);
}

input {
    border-radius: 5px;
    border: solid 1px var(--themeColorWhiter);

    padding: 5px;

    background: none;
    outline: none;

    font: inherit;
    color: inherit;
}

img {
    -webkit-user-drag: none;
}

fieldset {
    margin: 0;
    padding: 0 5px;
    border-radius: 5px;
    border: solid 1px var(--themeColorWhiter);
}

textarea {
    margin: 0;
    padding: 0;
    border-style: none;
    background: none;
    color: var(--color1);
}

textarea:focus {
    outline: none;
}

button {
    cursor: pointer;

    padding: 5px;
    --padding-button: 5px;
    margin: var(--padding-button);
    
    border-style: none;
    border-radius: 5px;

    white-space: nowrap;

    display: flex;
    align-items: center;
    justify-content: center;

    font: inherit;
    color: inherit;
    background: none;

    -webkit-tap-highlight-color: transparent;

    position: relative;    
}

button::before {
    position: absolute;
    top: calc(var(--padding-button) * -1);
    left: calc(var(--padding-button) * -1);
    padding: var(--padding-button);
    height: 100%;
    width: 100%;
    content: '';
}

.button {
    cursor: pointer;
}

button:hover,
.button:hover {
    background-image: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1));
}

button:active,
.button:active {
    background-image: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1));
}

button:disabled,
.button:disabled {
    cursor: default;
    filter: grayscale(1);
    pointer-events: none;
}

.popup {
    background: var(--background1);
    backdrop-filter: 'blur(2px)'
}

.modal {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}

input[type="color"] {
    -webkit-appearance: none;
    padding: 0;
    border: none;
    border-radius: 10px;
    width: 20px;
    height: 20px;
}

input[type="color"]::-webkit-color-swatch {
    border: none;
    border-radius: 10px;
    padding: 0;
}

input[type="color"]::-webkit-color-swatch-wrapper {
    border: none;
    border-radius: 10px;
    padding: 0;
}
`
