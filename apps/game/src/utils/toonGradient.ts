import { DataTexture, NearestFilter, RedFormat } from 'three';

const STEPS = 5;
const data = new Uint8Array([60, 100, 140, 190, 255]);

export const toonGradientMap = new DataTexture(data, STEPS, 1, RedFormat);
toonGradientMap.minFilter = NearestFilter;
toonGradientMap.magFilter = NearestFilter;
toonGradientMap.generateMipmaps = false;
toonGradientMap.needsUpdate = true;
