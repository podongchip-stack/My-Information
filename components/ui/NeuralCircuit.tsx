"use client";

import { useEffect, useRef } from "react";
import {
  buildAtom,
  buildCircuit,
  buildCoins,
  buildNetwork,
  buildPhasor,
  staticPattern,
  type Pattern,
} from "@/lib/neuralCircuit";

type Three = typeof import("three");

/** 한 패턴을 유지하는 시간과 다음 패턴으로 변하는 시간(초). 클릭하면 유지 시간을 건너뛴다. */
const HOLD = 4;
const MORPH = 2.5;

const VERTEX = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aRand;
  uniform float uMorph;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uCamZ;
  varying float vGlow;
  varying float vRand;

  void main() {
    float m = smoothstep(aRand * 0.4, aRand * 0.4 + 0.6, uMorph);
    vec3 p = mix(aFrom, aTo, m);
    p.z += sin(m * 3.14159) * (aRand - 0.5) * 1.2;

    float pulse = pow(0.5 + 0.5 * sin(p.x * 1.2 - uTime * 2.2 + aRand * 1.5), 6.0);
    vGlow = pulse;
    vRand = aRand;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * uPixelRatio * (1.0 + pulse * 0.8) * (uCamZ / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorBase;
  uniform vec3 uColorAccent;
  varying float vGlow;
  varying float vRand;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.2, d);
    vec3 col = mix(uColorBase, uColorAccent, max(vGlow, step(0.88, vRand)));
    gl_FragColor = vec4(col, edge * (0.55 + 0.45 * vGlow));
    #include <colorspace_fragment>
  }
`;

function start(THREE: Three, host: HTMLElement): () => void {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 767px)").matches;
  const count = mobile ? 900 : 2000;

  let renderer: InstanceType<Three["WebGLRenderer"]>;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  } catch {
    return () => {};
  }
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
  host.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.BufferGeometry();
  const patterns: Pattern[] = [
    staticPattern(buildNetwork(count)),
    staticPattern(buildCircuit(count)),
    buildPhasor(count),
    buildCoins(count),
    buildAtom(count),
  ];
  const rand = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const v = Math.sin(i * 12.9898) * 43758.5453;
    rand[i] = v - Math.floor(v);
  }
  // three가 그릴 점 개수를 position에서 읽으므로 자리만 잡아 둔다(실제 위치는 셰이더가 계산)
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const fromArray = new Float32Array(count * 3);
  const toArray = new Float32Array(count * 3);
  patterns[0].write(0, fromArray);
  const from = new THREE.BufferAttribute(fromArray, 3);
  const to = new THREE.BufferAttribute(toArray, 3);
  geometry.setAttribute("aFrom", from);
  geometry.setAttribute("aTo", to);
  geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: mobile ? 3.2 : 3.6 },
      uPixelRatio: { value: pixelRatio },
      uCamZ: { value: 8 },
      uColorBase: { value: new THREE.Color() },
      uColorAccent: { value: new THREE.Color() },
    },
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  group.add(points);

  const readColors = () => {
    const css = getComputedStyle(document.documentElement);
    material.uniforms.uColorBase.value.set(css.getPropertyValue("--color-muted").trim());
    material.uniforms.uColorAccent.value.set(css.getPropertyValue("--color-accent").trim());
  };

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    // 가로 ±4.4, 세로 ±2.2가 모두 보이는 거리
    const z = Math.max(4.4 / (tan * camera.aspect), 2.2 / tan);
    camera.position.set(0, 0, z);
    camera.updateProjectionMatrix();
    material.uniforms.uCamZ.value = z;
    if (!looping) draw();
  };

  const draw = () => renderer.render(scene, camera);

  let index = 0;
  let next = 0;
  let time = 0;
  let last = 0;
  let frame = 0;
  let looping = false;
  let morphing = false;
  let morphTime = 0;
  let holdTime = 0;

  const writeFrom = () => {
    patterns[index].write(time, fromArray);
    from.needsUpdate = true;
  };
  const writeTo = () => {
    patterns[next].write(time, toArray);
    to.needsUpdate = true;
  };

  const startMorph = () => {
    next = (index + 1) % patterns.length;
    writeTo();
    morphing = true;
    morphTime = 0;
  };

  const finishMorph = () => {
    index = next;
    writeFrom();
    material.uniforms.uMorph.value = 0;
    morphing = false;
    holdTime = 0;
  };

  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    time += dt;
    material.uniforms.uTime.value = time;
    if (morphing) {
      morphTime += dt;
      material.uniforms.uMorph.value = Math.min(morphTime / MORPH, 1);
      if (morphTime >= MORPH) finishMorph();
    } else {
      holdTime += dt;
      if (holdTime >= HOLD) startMorph();
    }
    if (patterns[index].animated) writeFrom();
    if (morphing && patterns[next].animated) writeTo();
    group.rotation.y = Math.sin(time * 0.3) * 0.08;
    draw();
    frame = requestAnimationFrame(tick);
  };

  const run = () => {
    if (looping) return;
    looping = true;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    looping = false;
    cancelAnimationFrame(frame);
  };

  const onClick = () => {
    if (reduceMotion) {
      index = (index + 1) % patterns.length;
      writeFrom();
      draw();
    } else if (!morphing) {
      startMorph();
    }
  };

  readColors();
  resize();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  const themeObserver = new MutationObserver(() => {
    readColors();
    if (!looping) draw();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  const scheme = matchMedia("(prefers-color-scheme: dark)");
  const onScheme = () => {
    readColors();
    if (!looping) draw();
  };
  scheme.addEventListener("change", onScheme);

  let visible = false;
  const sync = () => (visible && !document.hidden ? run() : stop());
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!reduceMotion) sync();
  });
  intersection.observe(host);
  document.addEventListener("visibilitychange", sync);

  host.addEventListener("click", onClick);

  return () => {
    stop();
    intersection.disconnect();
    resizeObserver.disconnect();
    themeObserver.disconnect();
    scheme.removeEventListener("change", onScheme);
    document.removeEventListener("visibilitychange", sync);
    host.removeEventListener("click", onClick);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}

/**
 * 신경망·회로·페이저·DB 코인·원자 패턴으로 변하는 파티클 3D. 클릭하면 다음 패턴, 가만두면 자동 순환.
 * 화면에 보일 때만 그리고, 모션 줄이기 설정이면 정지 화면만 그리며 클릭 시 바로 바뀐다.
 * three는 마운트 후 동적으로 불러와 초기 번들에 넣지 않는다.
 */
export default function NeuralCircuit({
  className = "h-[300px] md:h-[440px]",
}: {
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    import("three").then((THREE) => {
      if (!disposed) cleanup = start(THREE, host);
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return <div ref={ref} aria-hidden className={`w-full cursor-pointer ${className}`} />;
}
