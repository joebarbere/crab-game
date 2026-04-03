import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, MAP_SIZE, getFloodLine } from '../store/gameStore';
import { TideFoamParticles } from './TideFoamParticles';
import * as THREE from 'three';

const HALF_MAP = MAP_SIZE / 2;

// Custom wave shader material for natural-looking ocean
const waveVertexShader = `
  uniform float uTime;
  uniform float uAmplitude;
  varying vec2 vUv;
  varying float vWaveHeight;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Multiple overlapping sine waves for natural look
    float wave1 = sin(pos.x * 1.5 + uTime * 2.0) * 0.3;
    float wave2 = sin(pos.y * 2.0 + uTime * 1.5 + 1.0) * 0.2;
    float wave3 = sin((pos.x + pos.y) * 1.0 + uTime * 2.5) * 0.15;
    float wave4 = sin(pos.x * 3.0 - uTime * 1.8) * 0.1;

    float waveHeight = (wave1 + wave2 + wave3 + wave4) * uAmplitude;
    // Amplify at the leading edge (high UV.y)
    waveHeight *= (0.5 + vUv.y * 0.5);

    pos.z += waveHeight;
    vWaveHeight = waveHeight;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const waveFragmentShader = `
  uniform vec3 uDeepColor;
  uniform vec3 uShallowColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vWaveHeight;

  void main() {
    // Gradient from deep to shallow based on UV and wave height
    float mixFactor = vUv.y * 0.7 + vWaveHeight * 0.5 + 0.15;
    mixFactor = clamp(mixFactor, 0.0, 1.0);

    vec3 color = mix(uDeepColor, uShallowColor, mixFactor);

    // Cel-shading: quantize the brightness into steps
    float brightness = dot(color, vec3(0.299, 0.587, 0.114));
    float quantized = floor(brightness * 4.0) / 4.0;
    float adjust = quantized - brightness;
    color += adjust * 0.3;

    gl_FragColor = vec4(color, uOpacity);
  }
`;

const foamVertexShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Foam has smaller, choppier waves
    float wave = sin(pos.x * 4.0 + uTime * 3.0) * 0.15
               + sin(pos.y * 3.0 + uTime * 2.0) * 0.1;
    pos.z += wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const foamFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    // Animated foam pattern
    float foam = sin(vUv.x * 20.0 + uTime * 2.0) * 0.5 + 0.5;
    foam = smoothstep(0.3, 0.7, foam);
    float alpha = mix(0.6, 0.95, foam);

    gl_FragColor = vec4(0.95, 0.97, 1.0, alpha);
  }
`;

export function Tide() {
  const waterRef = useRef<THREE.Mesh>(null!);
  const foamRef = useRef<THREE.Mesh>(null!);

  const waterUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: 0.4 },
      uDeepColor: { value: new THREE.Color('#1565C0') },
      uShallowColor: { value: new THREE.Color('#4FC3F7') },
      uOpacity: { value: 0.65 },
    }),
    []
  );

  const foamUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const { gamePhase, demoSubPhase, tideProgress, tideDirection } =
      useGameStore.getState();

    const showTide =
      ((gamePhase === 'tideActive' || gamePhase === 'gameOver') ||
        (gamePhase === 'demo' && demoSubPhase === 'tideActive')) &&
      tideProgress > 0.001;

    waterRef.current.visible = showTide;
    foamRef.current.visible = showTide;

    if (!showTide) return;

    const time = state.clock.elapsedTime;
    waterUniforms.uTime.value = time;
    foamUniforms.uTime.value = time;

    const depth = tideProgress * MAP_SIZE;
    const floodLine = getFloodLine(tideProgress, tideDirection);
    const foamWidth = 0.8;

    switch (tideDirection) {
      case 'south':
        waterRef.current.position.set(0, 0.06, (HALF_MAP + floodLine) / 2);
        waterRef.current.scale.set(MAP_SIZE, depth, 1);
        foamRef.current.position.set(0, 0.08, floodLine);
        foamRef.current.scale.set(MAP_SIZE, foamWidth, 1);
        break;
      case 'north':
        waterRef.current.position.set(0, 0.06, (-HALF_MAP + floodLine) / 2);
        waterRef.current.scale.set(MAP_SIZE, depth, 1);
        foamRef.current.position.set(0, 0.08, floodLine);
        foamRef.current.scale.set(MAP_SIZE, foamWidth, 1);
        break;
      case 'east':
        waterRef.current.position.set((HALF_MAP + floodLine) / 2, 0.06, 0);
        waterRef.current.scale.set(depth, MAP_SIZE, 1);
        foamRef.current.position.set(floodLine, 0.08, 0);
        foamRef.current.scale.set(foamWidth, MAP_SIZE, 1);
        break;
      case 'west':
        waterRef.current.position.set((-HALF_MAP + floodLine) / 2, 0.06, 0);
        waterRef.current.scale.set(depth, MAP_SIZE, 1);
        foamRef.current.position.set(floodLine, 0.08, 0);
        foamRef.current.scale.set(foamWidth, MAP_SIZE, 1);
        break;
    }
  });

  return (
    <>
      {/* Water body with wave displacement */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[1, 1, 32, 32]} />
        <shaderMaterial
          vertexShader={waveVertexShader}
          fragmentShader={waveFragmentShader}
          uniforms={waterUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Foam leading edge */}
      <mesh ref={foamRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[1, 1, 16, 4]} />
        <shaderMaterial
          vertexShader={foamVertexShader}
          fragmentShader={foamFragmentShader}
          uniforms={foamUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <TideFoamParticles />
    </>
  );
}
