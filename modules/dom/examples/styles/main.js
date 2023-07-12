import { styles } from '../../styles/styles.js'

const button = document.createElement('button')
button.style.background = styles.vars['--background1']
button.style.color = styles.vars['--color1']
button.textContent = 'Switch Preference'

document.body.appendChild(button) 

button.addEventListener('click', () => {
    (styles.isDark ? styles.setLight : styles.setDark)()
})
