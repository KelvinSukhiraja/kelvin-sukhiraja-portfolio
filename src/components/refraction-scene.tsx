'use client';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
uniform float uTime;
uniform float uScroll;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  p.z += sin(p.y * 1.65 + uTime * .35) * .16;
  p.x += sin(p.y * 1.45 + uTime * .25) * .08 * (1.0 - uv.y);
  p.z += sin(uv.x * 3.14159) * uScroll * .35;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const fragmentShader = `
uniform sampler2D uMap;
uniform sampler2D uAtlas;
uniform float uTime;
uniform float uScroll;
uniform vec2 uPointer;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  float field = exp(-length(uv - (uPointer * .3 + .5)) * 6.0);
  uv.x += sin(uv.y * 16.0 + uTime * .6) * .012 * field;
  uv.y += cos(uv.x * 12.0 + uTime * .45) * .009 * field;
  vec3 photo = texture2D(uMap, clamp(uv, .001, .999)).rgb;
  float luminance = dot(photo, vec3(.299, .587, .114));
  vec2 grid = vec2(65.0, 90.0);
  vec2 cell = floor(uv * grid);
  vec2 local = fract(uv * grid);
  vec3 cellPhoto = texture2D(uMap, (cell + .5) / grid).rgb;
  float brightness = dot(cellPhoto, vec3(.299, .587, .114));
  float glyph = floor(clamp(brightness, 0.0, .999) * 9.0);
  vec2 glyphUv = vec2((glyph + local.x) / 9.0, local.y);
  float ink = texture2D(uAtlas, glyphUv).r;
  float boundary = .32 + sin(uv.x * 4.0 + uTime * .3) * .055 + uScroll * .2;
  float dissolve = 1.0 - smoothstep(boundary - .06, boundary + .06, uv.y);
  float edge = smoothstep(0.0, .12, uv.y);
  vec3 color = mix(vec3(luminance * .77), vec3(ink * (.35 + brightness * .55)), dissolve);
  float alpha = mix(1.0, ink * edge, dissolve);
  if (alpha < .12) discard;
  gl_FragColor = vec4(color * edge, 1.0);
}`;

const glassVertex = `
varying vec3 vNormal;
varying vec3 vView;
varying vec2 vPhotoUv;
void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-viewPosition.xyz);
  vPhotoUv = vec2((position.x - .91) / 2.35 + .5, position.y / 3.55 + .5);
  gl_Position = projectionMatrix * viewPosition;
}`;
const glassFragment = `
uniform sampler2D uMap;
varying vec3 vNormal;
varying vec3 vView;
varying vec2 vPhotoUv;
void main() {
  vec3 n = normalize(vNormal);
  float fresnel = pow(1.0 - abs(dot(n, normalize(vView))), 3.5);
  vec2 uv = vPhotoUv + n.xy * .105;
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec3 refracted = vec3(texture2D(uMap, uv + vec2(.003,0.)).r, texture2D(uMap, uv).g, texture2D(uMap, uv - vec2(.003,0.)).b);
  refracted *= inside * .55 * smoothstep(.05, .4, uv.y);
  float highlight = pow(max(0.0, dot(n, normalize(vec3(-.8, .35, .5)))), 70.0);
  float rim = fresnel * .72 + highlight * .7;
  vec3 color = mix(vec3(.019), refracted, inside) + vec3(.91, .95, 1.0) * rim;
  gl_FragColor = vec4(color, 1.0);
}`;

function Sculpture({ src, onReady }: { src: string; onReady: () => void }) {
  const texture = useLoader(THREE.TextureLoader, src);
  const group = useRef<THREE.Group>(null);
  const lens = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2());
  const started = useRef(false);
  const atlas = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 9 * 32; canvas.height = 40;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white'; ctx.font = '25px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ' .:+=x%#@'.split('').forEach((glyph, i) => ctx.fillText(glyph, i * 32 + 16, 20));
    return new THREE.CanvasTexture(canvas);
  }, []);
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 64, 96);
    const points = geo.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i), y = points.getY(i), z = points.getZ(i);
      points.setXYZ(i, x * (.13 + .04 * Math.cos(y * 4)) + Math.sin(y * 3.8) * .24, y * 1.8, z * .1 + Math.cos(y * 2.2) * .08);
    }
    geo.computeVertexNormals(); return geo;
  }, []);
  const uniforms = useMemo(() => ({ uMap: { value: texture }, uAtlas: { value: atlas }, uTime: { value: 0 }, uScroll: { value: 0 }, uPointer: { value: new THREE.Vector2() } }), [texture, atlas]);
  const glassUniforms = useMemo(() => ({ uMap: { value: texture } }), [texture]);
  useEffect(() => {
    const move = (event: PointerEvent) => pointer.current.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight * 2 - 1));
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointermove', move); };
  }, []);
  useEffect(() => () => { atlas.dispose(); geometry.dispose(); }, [atlas, geometry]);
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const scroll = Math.min(window.scrollY / window.innerHeight, 1);
    if (material.current) {
      const live = material.current.uniforms;
      live.uTime.value = time;
      live.uScroll.value = THREE.MathUtils.damp(live.uScroll.value, scroll, 3, delta);
      live.uPointer.value.lerp(pointer.current, 1 - Math.exp(-delta * 3));
    }
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -.17 + pointer.current.x * .17 + Math.sin(time * .18) * .06, 3, delta);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.current.y * .07, 3, delta);
      group.current.rotation.z = -.09 + Math.sin(time * .15) * .025;
    }
    if (lens.current) lens.current.position.x = -.91 + Math.sin(time * .3) * .04;
    if (!started.current) { started.current = true; onReady(); }
  });
  return <group ref={group} position={[0, .15, 0]}>
    <mesh><planeGeometry args={[2.35, 3.55, 48, 64]} /><shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} side={THREE.DoubleSide} /></mesh>
    <mesh ref={lens} geometry={geometry} position={[-.91, -.02, .3]}>
      <shaderMaterial vertexShader={glassVertex} fragmentShader={glassFragment} uniforms={glassUniforms} />
    </mesh>
  </group>;
}
export default function RefractionScene({ src, active, onReady, onFailure }: { src: string; active: boolean; onReady: () => void; onFailure: () => void }) {
  return <Canvas camera={{ position: [0, 0, 7], fov: 38 }} dpr={[1, 1.5]} frameloop={active ? 'always' : 'never'} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }} onCreated={({ gl }) => { gl.setClearColor('#050505', 0); gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true }); }} fallback={null}>
    <Suspense fallback={null}><Sculpture src={src} onReady={onReady} /></Suspense>
  </Canvas>;
}
