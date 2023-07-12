declare type Program = import("./Program.js").Program;
declare type Vao = import("./Vao.js").Vao;
declare type Renderer = import("./Renderer.js").Renderer;

declare type LightsOptions = {
  directionalLightMaxCount: number;
  pointLightMaxCount: number;
  pointLightFadeTime: number;
};

declare type ParticleOptions = {
  count: number;
  frequency: number;
};

declare type DrawOptions = {
  particlesEnabled: boolean;
  depthFrameBuffer: boolean;
  resolutionFactor: number;
};

declare type CameraOptions = {
  near: number;
  far: number;
  fov: number;
};

declare type RendererOptions = {
  camera: CameraOptions;
  draw: DrawOptions;
  renderer: WebGLContextAttributes;
  lights: LightsOptions;
  particles: ParticleOptions;
};

declare type TypedArray =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | Int16Array
  | Int32Array;

declare type WebGlAttributeUsage = 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW' | 'STATIC_READ' | 'DYNAMIC_READ' | 'STREAM_READ' | 'STATIC_COPY' | 'DYNAMIC_COPY' | 'STREAM_COPY'

declare namespace WebGl {
  namespace Texture {
    type Target = 'TEXTURE_2D' | 'TEXTURE_CUBE_MAP_POSITIVE_X' | 'TEXTURE_CUBE_MAP_NEGATIVE_X' | 'TEXTURE_CUBE_MAP_POSITIVE_Y' | 'TEXTURE_CUBE_MAP_NEGATIVE_Y' | 'TEXTURE_CUBE_MAP_POSITIVE_Z' | 'TEXTURE_CUBE_MAP_NEGATIVE_Z'

    type Wrap = 'CLAMP_TO_EDGE' | 'REPEAT' | 'MIRRORED_REPEAT'

    type MinFilter = 'LINEAR' | 'NEAREST' | 'NEAREST_MIPMAP_NEAREST' | 'LINEAR_MIPMAP_NEAREST' | 'NEAREST_MIPMAP_LINEAR' | 'LINEAR_MIPMAP_LINEAR'

    type MagFilter = 'LINEAR' | 'NEAREST'

    type InternalFormat = 'DEPTH_COMPONENT24' | 'DEPTH_COMPONENT16' | 'ALPHA' | 'RGB' | 'RGBA' | 'LUMINANCE' | 'LUMINANCE_ALPHA' | 'DEPTH_COMPONENT' | 'DEPTH_STENCIL' | 'R8' | 'R16F' | 'R32F' | 'R8UI' | 'RG8' | 'RG16F' | 'RG32F' | 'RG8UI' | 'RG16UI' | 'RG32UI' | 'RGB8' | 'SRGB8' | 'RGB565' | 'R11F_G11F_B10F' | 'RGB9_E5' | 'RGB16F' | 'RGB32F' | 'RGB8UI' | 'RGBA8' | 'SRGB8_APLHA8' | 'RGB5_A1' | 'RGB10_A2' | 'RGBA4' | 'RGBA16F' | 'RGBA32F' | 'RGBA8UI'

    type Format = 'DEPTH_COMPONENT' | 'RGB' | 'RGBA' | 'LUMINANCE_ALPHA' | 'LUMINANCE' | 'ALPHA' | 'RED' | 'RED_INTEGER' | 'RG' | 'RG_INTEGER' | 'RGB_INTEGER' | 'RGBA_INTEGER'

    type Type = 'UNSIGNED_INT' | 'UNSIGNED_SHORT' | 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT_5_6_5' | 'UNSIGNED_SHORT_4_4_4_4' | 'UNSIGNED_SHORT_5_5_5_1' | 'HALF_FLOAT' | 'FLOAT' | 'UNSIGNED_INT_10F_11F_11F_REV' | 'HALF_FLOAT' | 'UNSIGNED_INT_2_10_10_10_REV'


  }
}
