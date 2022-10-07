import { localstorageProvidersKey } from '../../../config.js'

export const twitchView = `<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
        content="width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <title>Twitch</title>
</head>
<body></body>
<script>
    function hashMatch(key) {
        var match = location.hash.match(new RegExp(key + '=([^&]*)'))
        return match ? match[1] : null
    }

    const state = sessionStorage.getItem('${localstorageProvidersKey.state}')
    sessionStorage.removeItem('${localstorageProvidersKey.state}')
    const hashState = hashMatch('state')
    const hashToken = hashMatch('access_token')

    if (
        window.opener
        && hashToken
        && state
        && state === hashState
    ) {
        localStorage.setItem('${localstorageProvidersKey.twitch}', hashToken)
        window.close()
    } else {
        console.log(window.opener)
        console.log(state_matched)
        console.log(state)
        document.body.innerHTML = 'Retry or Contact admin :('

        console.warn('state not matched')
        document.body.innerHTML = 'Retry or Contact admin :('
    }
</script>
</html>`