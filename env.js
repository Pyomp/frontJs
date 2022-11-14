export const env = location.hostname === 'localhost' ?
    {
        mainServerUrl: 'http://localhost:8080'
    }
    :
    {
        mainServerUrl: 'https://obs3d.com'
    }
