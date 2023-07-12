const isDev = location.hostname === 'localhost'

export const env = isDev ?
    {
        isDev,
        mainServerUrl: 'http://localhost:8080',

        /** @type {RendererOptions} */
        rendererOptions: {
            camera: {
                near: 0.1,
                far: 500,
                fov: 50,
            },
            draw: {
                particlesEnabled: true,
                depthFrameBuffer: true,
                resolutionFactor: 1,
            },
            renderer: {
                alpha: true,
                depth: true,
                stencil: false,
                antialias: true,
                premultipliedAlpha: true,
                preserveDrawingBuffer: false,
                powerPreference: 'default',
                failIfMajorPerformanceCaveat: false,
            },
            lights: {
                directionalLightMaxCount: 2,
                pointLightMaxCount: 20,
                pointLightFadeTime: 0.2,
            },
            particles: {
                count: 10e4,
                frequency: 10,
            }
        }
    }
    :
    {
        isDev,
        mainServerUrl: 'https://pyompystudio.com',
        /** @type {RendererOptions} */
        rendererOptions: {
            camera: {
                near: 0.1,
                far: 500,
                fov: 50,
            },
            draw: {
                particlesEnabled: true,
                depthFrameBuffer: true,
                resolutionFactor: 1,
            },
            renderer: {
                alpha: true,
                depth: true,
                stencil: false,
                antialias: true,
                premultipliedAlpha: true,
                preserveDrawingBuffer: false,
                powerPreference: 'default',
                failIfMajorPerformanceCaveat: false,
            },
            lights: {
                directionalLightMaxCount: 2,
                pointLightMaxCount: 20,
                pointLightFadeTime: 0.2,
            },
            particles: {
                count: 1_000,
                frequency: 20,
            }
        }
    }

