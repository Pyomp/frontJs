/** @type {RendererOptions} */
export const rendererDefaultOptions = {
    camera: {
        near: 0.1,
        far: 500,
        fov: 50,
    },
    draw: {
        particlesEnabled: false,
        depthFrameBuffer: false,
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
        directionalLightMaxCount: 1,
        pointLightMaxCount: 5,
        pointLightFadeTime: 0.2,
    },
    particles: {
        count: 1_000,
        frequency: 20,
    }
}
