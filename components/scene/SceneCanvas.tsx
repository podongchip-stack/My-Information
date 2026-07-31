"use client";

import { useCallback, useRef, useSyncExternalStore, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildShapes, type ShapeData, type ShapeName } from "./shapes";
import { useScrollProgress } from "./useScrollProgress";

/** 형상이 등장하는 순서 — 스크롤 0 → 1이 이 순서로 매핑된다. */
const ORDER: ShapeName[] = ["battery", "neural", "server"];

/** 노드를 한 칸씩 타고 이동하며 선을 순차 점화하는 전파 신호 */
type Signal = {
  node: number;
  stepsLeft: number;
  timer: number;
  interval: number;
};

type LineBuffer = {
  edges: Uint32Array;
  edgeCount: number;
  positions: Float32Array;
};

/**
 * 매 프레임 제자리에서 갱신되는 버퍼 묶음.
 *
 * 이 값은 렌더에서 읽히기도 하고(지오메트리 구성) 프레임 루프에서 변형되기도
 * 한다. useMemo나 ref로 들고 있으면 React Compiler가 각각 "렌더 산출물 변형",
 * "렌더 중 ref 접근"으로 잡는다 — 애초에 React가 관리할 상태가 아니라
 * WebGL 쪽 리소스이므로 모듈 캐시에 두고 React 바깥에서 관리한다.
 */
type Scene = {
  count: number;
  shapes: ShapeData;
  /** 세 형상 사이를 보간한 현재 좌표 */
  positions: Float32Array;
  nodeColors: Float32Array;
  lines: Record<ShapeName, LineBuffer>;
  /** 방전 신호가 타고 다닐 신경망 인접 그래프 */
  adjacency: { edge: number; other: number }[][];
  neuralEdgeCount: number;
  charges: Float32Array;
  neuralColors: Float32Array;
  circleTexture: THREE.CanvasTexture;
};

const smoothstep = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** 노드를 동그랗게 찍기 위한 원형 텍스처 */
function makeCircleTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.75, "rgba(255,255,255,1)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function createScene(count: number): Scene {
  const shapes = buildShapes(count);

  const positions = new Float32Array(count * 3);
  positions.set(shapes.positions.battery);

  // 노드 색 — 시안에서 인디고로 세로 그라디언트
  const cyan = new THREE.Color("#22d3ee");
  const indigo = new THREE.Color("#6366f1");
  const nodeColors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = shapes.positions.neural[i * 3 + 1];
    const c = cyan.clone().lerp(indigo, clamp01((y / 6.4 + 1) / 2));
    nodeColors.set([c.r, c.g, c.b], i * 3);
  }

  const makeLine = (name: ShapeName): LineBuffer => {
    const edges = shapes.edges[name];
    const edgeCount = edges.length / 2;
    return { edges, edgeCount, positions: new Float32Array(edgeCount * 6) };
  };

  const neuralEdges = shapes.edges.neural;
  const neuralEdgeCount = neuralEdges.length / 2;
  const adjacency: { edge: number; other: number }[][] = Array.from(
    { length: count },
    () => []
  );
  for (let e = 0; e < neuralEdgeCount; e++) {
    const a = neuralEdges[e * 2];
    const b = neuralEdges[e * 2 + 1];
    adjacency[a].push({ edge: e, other: b });
    adjacency[b].push({ edge: e, other: a });
  }

  return {
    count,
    shapes,
    positions,
    nodeColors,
    lines: {
      battery: makeLine("battery"),
      neural: makeLine("neural"),
      server: makeLine("server"),
    },
    adjacency,
    neuralEdgeCount,
    charges: new Float32Array(neuralEdgeCount),
    neuralColors: new Float32Array(neuralEdgeCount * 6),
    circleTexture: makeCircleTexture(),
  };
}

/**
 * 노드 수별 씬 캐시. 가능한 값이 두 개(240 / 430)뿐이라 상한이 분명하고,
 * 재마운트 시 O(n²) 엣지 계산을 다시 하지 않아도 된다.
 */
const sceneCache = new Map<number, Scene>();

function getScene(count: number): Scene {
  let scene = sceneCache.get(count);
  if (!scene) {
    scene = createScene(count);
    sceneCache.set(count, scene);
  }
  return scene;
}

const BASE = new THREE.Color("#0e5a6b").multiplyScalar(0.3);
const FLASH = new THREE.Color("#22d3ee");
const MAX_SIGNALS = 70;

function ParticleField({
  count,
  progress,
}: {
  count: number;
  progress: RefObject<number>;
}) {
  const scene = getScene(count);

  const group = useRef<THREE.Group>(null);
  const posAttr = useRef<THREE.BufferAttribute>(null);
  const neuralColorAttr = useRef<THREE.BufferAttribute>(null);

  const batteryPos = useRef<THREE.BufferAttribute>(null);
  const serverPos = useRef<THREE.BufferAttribute>(null);
  const neuralPos = useRef<THREE.BufferAttribute>(null);

  const batteryMat = useRef<THREE.LineBasicMaterial>(null);
  const serverMat = useRef<THREE.LineBasicMaterial>(null);
  const neuralMat = useRef<THREE.LineBasicMaterial>(null);

  const eased = useRef(0);
  const strikeTimer = useRef(0);
  const signals = useRef<Signal[]>([]);

  useFrame((_, rawDelta) => {
    // 렌더 스코프의 scene을 그대로 변형하면 React Compiler가 "렌더 산출물을
    // 나중에 수정한다"고 잡는다. 캐시에서 다시 꺼내 쓴다 (같은 객체).
    const s = getScene(count);

    // 탭이 백그라운드에 있다 돌아오면 delta가 튀므로 상한을 둔다
    const delta = Math.min(rawDelta, 0.05);

    /** 현재 노드 위치에서 선분 양 끝 좌표를 다시 채운다 */
    const fillLines = (
      buf: LineBuffer,
      attr: RefObject<THREE.BufferAttribute | null>
    ) => {
      const { edges, edgeCount, positions: linePos } = buf;
      for (let e = 0; e < edgeCount; e++) {
        const a = edges[e * 2] * 3;
        const b = edges[e * 2 + 1] * 3;
        const o = e * 6;
        linePos[o] = s.positions[a];
        linePos[o + 1] = s.positions[a + 1];
        linePos[o + 2] = s.positions[a + 2];
        linePos[o + 3] = s.positions[b];
        linePos[o + 4] = s.positions[b + 1];
        linePos[o + 5] = s.positions[b + 2];
      }
      if (attr.current) attr.current.needsUpdate = true;
    };

    // 스크롤 진행도를 0~2 구간(형상 3개)으로 펴고 관성을 준다
    const target = progress.current * (ORDER.length - 1);
    eased.current += (target - eased.current) * Math.min(1, delta * 3.5);
    const t = eased.current;

    const seg = t < 1 ? 0 : 1;
    const mix = smoothstep(clamp01(t - seg));
    const from = s.shapes.positions[ORDER[seg]];
    const to = s.shapes.positions[ORDER[seg + 1]];

    for (let i = 0, n = s.count * 3; i < n; i++) {
      s.positions[i] = from[i] + (to[i] - from[i]) * mix;
    }
    if (posAttr.current) posAttr.current.needsUpdate = true;

    const wBattery = seg === 0 ? 1 - mix : 0;
    const wNeural = seg === 0 ? mix : 1 - mix;
    const wServer = seg === 1 ? mix : 0;

    // 신경망일 때 가장 빠르게 돌고, 격자·랙 단계에서는 거의 멈춘다
    if (group.current) {
      group.current.rotation.z += delta * (0.008 + 0.042 * wNeural);
      group.current.rotation.x = 0.18 * wNeural;
    }

    if (batteryMat.current) batteryMat.current.opacity = wBattery * 0.32;
    if (wBattery > 0.01) fillLines(s.lines.battery, batteryPos);

    if (serverMat.current) serverMat.current.opacity = wServer * 0.34;
    if (wServer > 0.01) fillLines(s.lines.server, serverPos);

    if (neuralMat.current) neuralMat.current.opacity = wNeural * 0.6;
    if (wNeural > 0.01) fillLines(s.lines.neural, neuralPos);

    // ── 방전 ───────────────────────────────────────────────────
    if (wNeural > 0.15) {
      strikeTimer.current -= delta;
      if (strikeTimer.current <= 0) {
        const bolts = 2 + Math.floor(Math.random() * 3);
        for (let b = 0; b < bolts; b++) {
          if (signals.current.length >= MAX_SIGNALS) break;
          signals.current.push({
            node: Math.floor(Math.random() * s.count),
            stepsLeft: 6 + Math.floor(Math.random() * 14),
            timer: 0,
            interval: 0.14 + Math.random() * 0.14,
          });
        }
        const u = Math.random();
        strikeTimer.current = (0.02 + u * u * u * 0.7) * 0.87;
      }
    }

    const active = signals.current;
    for (let i = active.length - 1; i >= 0; i--) {
      const sig = active[i];
      sig.timer -= delta;
      let hops = 0;
      while (sig.timer <= 0 && sig.stepsLeft > 0 && hops < 4) {
        const neighbors = s.adjacency[sig.node];
        if (neighbors.length === 0) {
          sig.stepsLeft = 0;
          break;
        }
        const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
        s.charges[pick.edge] = 1;
        // 가끔 곁가지: 별도 신호로 갈라져 함께 전파
        if (Math.random() < 0.35 && active.length < MAX_SIGNALS) {
          active.push({
            node: pick.other,
            stepsLeft: 2 + Math.floor(Math.random() * 5),
            timer: sig.interval,
            interval: sig.interval,
          });
        }
        sig.node = pick.other;
        sig.stepsLeft -= 1;
        sig.timer += sig.interval;
        hops += 1;
      }
      if (sig.stepsLeft <= 0) active.splice(i, 1);
    }

    // 감쇠 + 매 프레임 랜덤한 속도로 지지직 잔떨림
    for (let e = 0; e < s.neuralEdgeCount; e++) {
      if (s.charges[e] > 0) {
        s.charges[e] -= delta * (0.8 + Math.random() * 1.5);
        if (s.charges[e] < 0) s.charges[e] = 0;
      }
      const c = s.charges[e];
      const r = BASE.r + (FLASH.r - BASE.r) * c;
      const g = BASE.g + (FLASH.g - BASE.g) * c;
      const b = BASE.b + (FLASH.b - BASE.b) * c;
      const o = e * 6;
      s.neuralColors[o] = s.neuralColors[o + 3] = r;
      s.neuralColors[o + 1] = s.neuralColors[o + 4] = g;
      s.neuralColors[o + 2] = s.neuralColors[o + 5] = b;
    }
    if (neuralColorAttr.current) neuralColorAttr.current.needsUpdate = true;
  });

  return (
    <group ref={group} scale={1.15}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            ref={posAttr}
            attach="attributes-position"
            args={[scene.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[scene.nodeColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.11}
          map={scene.circleTexture}
          alphaTest={0.5}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>

      <EdgeLines
        buffer={scene.lines.battery}
        positionRef={batteryPos}
        materialRef={batteryMat}
      />
      <EdgeLines
        buffer={scene.lines.server}
        positionRef={serverPos}
        materialRef={serverMat}
      />

      {/* 신경망만 방전 색을 정점별로 싣는다 */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            ref={neuralPos}
            attach="attributes-position"
            args={[scene.lines.neural.positions, 3]}
          />
          <bufferAttribute
            ref={neuralColorAttr}
            attach="attributes-color"
            args={[scene.neuralColors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          ref={neuralMat}
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

function EdgeLines({
  buffer,
  positionRef,
  materialRef,
}: {
  buffer: LineBuffer;
  positionRef: RefObject<THREE.BufferAttribute | null>;
  materialRef: RefObject<THREE.LineBasicMaterial | null>;
}) {
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          ref={positionRef}
          attach="attributes-position"
          args={[buffer.positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        ref={materialRef}
        color="#0e7490"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/**
 * 띄울 노드 수를 결정한다. 0이면 3D를 아예 렌더링하지 않는다.
 *
 * 서버에서는 항상 0을 돌려주고(=정적 배경), 클라이언트에서 환경을 보고
 * 다시 정한다. useEffect + setState로 하면 "이펙트 안 동기 setState" 린트에
 * 걸리므로 외부 스토어 구독 형태로 읽는다.
 */
function useNodeCount(): number {
  const subscribe = useCallback((onChange: () => void) => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const getSnapshot = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
    // 엣지 계산이 O(n²)이라 좁은 화면·저사양에서는 노드를 줄인다
    const small = window.innerWidth < 768;
    const lowCore = (navigator.hardwareConcurrency ?? 8) <= 4;
    return small || lowCore ? 240 : 430;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

export default function SceneCanvas() {
  const progress = useScrollProgress();
  const nodes = useNodeCount();

  if (nodes === 0) {
    // SSR·reduced-motion 대체 배경 — 정적 광원만 남긴다
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.10),transparent_60%)]"
      />
    );
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0, 8.2], fov: 80 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <ParticleField count={nodes} progress={progress} />
      </Canvas>
    </div>
  );
}
