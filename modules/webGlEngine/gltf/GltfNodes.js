import { Texture } from "../renderer/models/Texture.js"

const TYPE_CLASS = {
    '5120': Int8Array,    // gl.BYTE
    '5121': Uint8Array,   // gl.UNSIGNED_BYTE
    '5122': Int16Array,   // gl.SHORT
    '5123': Uint16Array,  // gl.UNSIGNED_SHORT
    '5124': Int32Array,   // gl.INT
    '5125': Uint32Array,  // gl.UNSIGNED_INT
    '5126': Float32Array, // gl.FLOAT
}

export function getGltfData(gltf) {
    const body = gltf.body
    const content = gltf.content
    const nodes = content.nodes
    const materials = content.materials

    // accessors
    const accessors = content.accessors
    const bufferViews = content.bufferViews
    for (const accessor of accessors) {
        const bufferView = bufferViews[accessor.bufferView]
        accessor.buffer = new TYPE_CLASS[accessor.componentType](
            body.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength)
        )
        delete accessor.componentType
        delete accessor.bufferView
    }

    // animation
    if (content.animations) {
        const animations = {}
        for (const animation of content.animations) {
            const channels = animation.channels
            const samplers = animation.samplers

            const bones = {}
            for (const channel of channels) {
                const sampler = samplers[channel.sampler]

                const name = nodes[channel.target.node].name
                if (bones[name] === undefined) bones[name] = {}
                bones[name][channel.target.path] = {
                    key: accessors[sampler.input].buffer,
                    frame: accessors[sampler.output].buffer,
                    frameType: accessors[sampler.output].type,
                    interpolation: sampler.interpolation,
                }
            }

            animations[animation.name] = bones
            delete animation.samplers
        }
        content.animations = animations
    }

    // meshes
    for (const mesh of content.meshes) {
        const primitives = mesh.primitives
        for (const primitive of primitives) {
            if (primitive.material !== undefined) {
                primitive.material = materials[primitive.material]
                primitive.material.textures = {}
            }
            const attributes = primitive.attributes
            for (const key in attributes) {
                const accessorID = attributes[key]
                attributes[key] = accessors[accessorID]
            }
            primitive.indices = accessors[primitive.indices]

        }
    }

    //skins
    const skins = content.skins

    if (skins) {
        for (const skin of skins) {
            skin.animations = {}
            skin.inverseBindMatrices = accessors[skin.inverseBindMatrices]

            const joints = skin.joints.map(a => nodes[a])

            for (let i = 0; i < joints.length; i++) {
                const joint = joints[i]
                joint.id = i

                for (const animationName in content.animations) {
                    const animation = content.animations[animationName]
                    for (const boneName in animation) {
                        if (boneName === joint.name) {
                            skin.animations[animationName] = animation
                            break
                        }
                    }
                }
            }

            skin.root = joints[0]
            skin.bonesCount = joints.length
            delete skin.joints
            delete skin.name
        }
    }

    // nodes
    for (const node of nodes) {
        if (node.mesh !== undefined) node.mesh = content.meshes[node.mesh]
        if (node.children !== undefined) node.children = node.children.map(a => nodes[a])
        if (node.skin !== undefined) node.skin = skins[node.skin]
    }

    /** @type {Object.<string, GltfNode>} */
    const gltfNodes = {}

    for (const key in nodes) {
        const node = nodes[key]
        if (node.mesh) {
            gltfNodes[node.name] = node
        }
    }

    return gltfNodes
}

export function addTexture(node, u_textureName, url) {
    const texture = new Texture({})
    texture.data.src = url.href

    for (const primitive of node.mesh.primitives) {
        primitive.material.textures[u_textureName] = texture
    }
}


