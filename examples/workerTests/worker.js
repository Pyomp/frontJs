onmessage = (event) => {
    const f32a = new Float32Array(event.data);
    for (let i = 0; i < f32a.length; i++) {
        f32a[i] = f32a[i] * Math.random();
    }
    postMessage(f32a.buffer, [f32a.buffer])
}