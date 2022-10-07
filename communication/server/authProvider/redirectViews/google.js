import { localstorageProvidersKey } from '../../../config.js'

export const googleView = `<!DOCTYPE html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport"
        content="width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <title>Google</title>
</head>
<body></body>
<script>
    const hashMatch = (expr) => {
        const match = document.location.hash.match(expr)
        return match ? match[1] : null
    }
    const state = sessionStorage.getItem('state')
    sessionStorage.removeItem('state')

    if (!window.opener
        || !document.location.hash.match(/access_token=(.+)/)
        || !state
    ) {
        document.body.innerHTML = 'Retry or Contact admin :('
    } else {
        const state_matched = hashMatch(/state=(\w+)/)
        if (state === state_matched) {
            const token = hashMatch(/access_token=(.+)/)
            localStorage.setItem('${localstorageProvidersKey.google}', token)

            window.close()
        } else {
            document.body.innerHTML = 'Retry or Contact admin :('
        }
    }
</script>
</html>`