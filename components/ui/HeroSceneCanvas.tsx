"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** 결정적 의사난수 — 매 로드마다 같은 그래프가 나온다 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/**
 * 3D git 그래프 — 세로 main 줄기에서 브랜치가 갈라졌다 머지되는 형상.
 * 각 노드·엣지에 등장 시각(t0)을 부여해, 로드 후 약 3초 동안
 * 아래에서 위로 "그려진" 뒤 정지한다.
 */
function buildGraph() {
  const rnd = mulberry32(20260801);
  const nodes: number[] = [];
  const nodeT0: number[] = [];
  const edges: { a: number; b: number }[] = [];
  const trunkIdx: number[] = [];
  let idx = 0;

  const TRUNK = 14;
  for (let i = 0; i < TRUNK; i++) {
    const y = -6.5 + (13 * i) / (TRUNK - 1);
    nodes.push((rnd() - 0.5) * 0.6, y, (rnd() - 0.5) * 0.6);
    nodeT0.push(0.15 + i * 0.13);
    trunkIdx.push(idx++);
    if (i > 0) edges.push({ a: trunkIdx[i - 1], b: trunkIdx[i] });
  }

  for (let b = 0; b < 8; b++) {
    const startT = 1 + Math.floor(rnd() * (TRUNK - 4));
    const dir = b % 2 === 0 ? 1 : -1;
    const len = 3 + Math.floor(rnd() * 4);
    const reach = 2.2 + rnd() * 2;
    const zBase = (rnd() - 0.5) * 4;
    let prev = trunkIdx[startT];
    const baseY = nodes[trunkIdx[startT] * 3 + 1];
    const baseT = nodeT0[trunkIdx[startT]] + 0.3;
    let last = prev;

    for (let j = 1; j <= len; j++) {
      const t = j / len;
      nodes.push(
        dir * Math.sin(t * Math.PI * 0.65) * reach,
        baseY + t * (1.6 + rnd() * 1.6),
        zBase * t + (rnd() - 0.5) * 0.5
      );
      nodeT0.push(baseT + j * 0.16);
      last = idx++;
      edges.push({ a: prev, b: last });
      prev = last;
    }

    // 일부 브랜치는 위쪽 main으로 머지
    if (rnd() < 0.65) {
      const mergeT = Math.min(TRUNK - 1, startT + 2 + Math.floor(rnd() * 3));
      edges.push({ a: last, b: trunkIdx[mergeT] });
    }
  }

  const count = nodes.length / 3;
  const positions = new Float32Array(nodes);

  // 노드 최종 색 — 그린 두 단계를 섞어 깊이감을 준다
  const bright = new THREE.Color("#03c75a");
  const dim = new THREE.Color("#0e8a44");
  const baseColors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const c = rnd() < 0.4 ? bright : dim;
    baseColors.set([c.r, c.g, c.b], i * 3);
  }

  // 엣지 시작·끝 시각 — 출발 노드에서 자라나 도착 노드 등장에 맞춰 닿는다
  const edgeT = edges.map((e) => {
    const start = nodeT0[e.a];
    const end = Math.max(nodeT0[e.b], start + 0.12);
    return { start, end };
  });

  const maxT =
    Math.max(...nodeT0, ...edgeT.map((t) => t.end)) + 0.4;

  return {
    count,
    positions,
    baseColors,
    nodeT0: Float32Array.from(nodeT0),
    edges,
    edgeT,
    maxT,
  };
}

/** 노드를 동그랗게 찍기 위한 원형 텍스처 */
function makeCircleTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/**
 * 프레임마다 제자리 갱신되는 버퍼 — React가 관리할 상태가 아니라
 * WebGL 리소스이므로 모듈 캐시에 두고 React 바깥에서 관리한다.
 */
type FxState = {
  graph: ReturnType<typeof buildGraph>;
  colors: Float32Array;
  linePositions: Float32Array;
  texture: THREE.CanvasTexture;
  time: number;
  settled: boolean;
};

let cached: FxState | null = null;

function getState(): FxState {
  if (cached) return cached;
  const graph = buildGraph();
  cached = {
    graph,
    colors: new Float32Array(graph.count * 3),
    linePositions: new Float32Array(graph.edges.length * 6),
    texture: makeCircleTexture(),
    time: 0,
    settled: false,
  };
  return cached;
}

function GitGraph3D() {
  const state = getState();
  const tilt = useRef<THREE.Group>(null);
  const colAttr = useRef<THREE.BufferAttribute>(null);
  const lineAttr = useRef<THREE.BufferAttribute>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((_, rawDelta) => {
    const s = getState();
    const dt = Math.min(rawDelta, 0.05);

    // 마우스를 따라 아주 살짝 기운다 — 유일한 상시 모션
    if (tilt.current) {
      const k = Math.min(1, dt * 2.5);
      tilt.current.rotation.x +=
        (pointer.current.y * 0.14 - tilt.current.rotation.x) * k;
      tilt.current.rotation.y +=
        (pointer.current.x * 0.18 - tilt.current.rotation.y) * k;
    }

    // 그리기 연출은 완성되면 더 이상 버퍼를 만지지 않는다
    if (s.settled) return;
    s.time += dt;
    const now = s.time;
    const g = s.graph;

    for (let i = 0; i < g.count; i++) {
      const a = clamp01((now - g.nodeT0[i]) / 0.35);
      s.colors[i * 3] = g.baseColors[i * 3] * a;
      s.colors[i * 3 + 1] = g.baseColors[i * 3 + 1] * a;
      s.colors[i * 3 + 2] = g.baseColors[i * 3 + 2] * a;
    }

    for (let e = 0; e < g.edges.length; e++) {
      const { a, b } = g.edges[e];
      const { start, end } = g.edgeT[e];
      const p = clamp01((now - start) / (end - start));
      const o = e * 6;
      const a3 = a * 3;
      const b3 = b * 3;
      s.linePositions[o] = g.positions[a3];
      s.linePositions[o + 1] = g.positions[a3 + 1];
      s.linePositions[o + 2] = g.positions[a3 + 2];
      s.linePositions[o + 3] =
        g.positions[a3] + (g.positions[b3] - g.positions[a3]) * p;
      s.linePositions[o + 4] =
        g.positions[a3 + 1] + (g.positions[b3 + 1] - g.positions[a3 + 1]) * p;
      s.linePositions[o + 5] =
        g.positions[a3 + 2] + (g.positions[b3 + 2] - g.positions[a3 + 2]) * p;
    }

    if (colAttr.current) colAttr.current.needsUpdate = true;
    if (lineAttr.current) lineAttr.current.needsUpdate = true;
    if (now >= g.maxT) s.settled = true;
  });

  return (
    <group ref={tilt}>
      <group scale={0.92}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[state.graph.positions, 3]}
            />
            <bufferAttribute
              ref={colAttr}
              attach="attributes-color"
              args={[state.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.16}
            map={state.texture}
            vertexColors
            sizeAttenuation
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              ref={lineAttr}
              attach="attributes-position"
              args={[state.linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#0e8a44"
            transparent
            opacity={0.35}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      </group>
    </group>
  );
}

export default function HeroSceneCanvas() {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0.4, 10.5], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <GitGraph3D />
    </Canvas>
  );
}
