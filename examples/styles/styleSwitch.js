import { StyleVar } from "../../dom/styleVar.js"
import { EventSet } from "../../models/Events.js"

const darkStyle = {
    '--background1': 'hsl(0, 0%, 4%)',
    '--background2': 'hsl(0, 0%, 8%)',
    '--background3': 'hsl(0, 0%, 12%)',
    '--background-transparent': 'hsla(0, 0%, 0%, 0.5)',
    '--color1': 'hsl(0, 0%, 95%)',
    '--color2': 'hsl(0, 0%, 85%)',
    '--color3': 'hsl(0, 0%, 75%)',
}

const lightStyle = {
    '--background1': 'hsl(0, 0%, 100%)',
    '--background2': 'hsl(0, 0%, 90%)',
    '--background3': 'hsl(0, 0%, 80%)',
    '--background-transparent': 'hsla(0, 0%, 0%, 0.5)',
    '--color1': 'hsl(0, 0%, 0%)',
    '--color2': 'hsl(0, 0%, 5%)',
    '--color3': 'hsl(0, 0%, 10%)',
}
const styleVar = new StyleVar(darkStyle)

let onChange = new EventSet()
let isDark = true

export const styleSwitch = {
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
    font-family: Comfortaa, sans-serif;
    -webkit-user-drag: none;
    background: ${styleSwitch.vars["--background1"]};
    color: ${styleSwitch.vars["--color1"]};

    line-height: 1.4;
    
    touch-action: none;
    transition: filter 1s;
    font-size: 14px;

    -webkit-tap-highlight-color: transparent;
    scrollbar-color: var(--color-scroll-bar) var(--color-background-scroll-bar);
    scrollbar-width: thin;
}

select,
option {
    background: var(--color-background);
    color: var(--color-text);
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
    border: solid 1px var(--color-line);

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
    border: solid 1px var(--color-line);
}

textarea {
    margin: 0;
    padding: 0;
    border-style: none;
    background: none;
    color: var(--color-text);
}

textarea:focus {
    outline: none;
}

button {
    width: calc(100% - var(--padding-button) * 2);
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
    background: var(--color-background-popup);
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