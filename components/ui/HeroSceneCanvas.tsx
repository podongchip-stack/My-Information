"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/** 결정적 의사난수 — 매 로드마다 같은 필드가 나온다 */
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

const COLS = 96; // 가로 = 시간축 — 32:9 초광폭에서도 화면 양끝을 넘도록 넓게
const ROWS = 12; // 세로 = 깊이
const GAP = 0.56;
const SIZE = 0.44;
const RISE = 0.5; // 큐브 하나가 솟아오르는 데 걸리는 시간(초)
const BASE_Y = -4.7; // 필드 바닥의 월드 y — 클릭 파동 평면과 공유

// 클릭 파동 — 크레스트 뒤에 얕은 골이 따라오는 감쇠 링
const WAVE_SPEED = 5.5; // 링이 퍼지는 속도(유닛/초)
const WAVE_SIGMA = 0.9; // 링 두께
const WAVE_FREQ = 1.8; // 크레스트·골 진동수
const WAVE_AMP = 1.6; // 최대 높이 변화
const WAVE_DAMP = 0.8; // 시간 감쇠
const WAVE_LIFE = 3.5; // 이 시간이 지나면 파동 제거(초)

/** 잔디 레벨 팔레트 — 어두운 바닥부터 accent까지 그린 단계 */
const LEVEL_COLORS = [0x143a24, 0x0e5f33, 0x0e8a44, 0x03c75a, 0x45e08a];
const LEVEL_HEIGHTS = [0.05, 0.35, 0.7, 1.1, 1.6];

/**
 * GitHub 컨트리뷰션 잔디를 3D 바 필드로 —
 * 열(시간축)별 활동량에 셀 노이즈를 섞고 이웃 평활화로
 * 실제 잔디처럼 연속된 스트릭·공백 클러스터를 만든다.
 */
function buildField() {
  const rnd = mulberry32(20260801);
  const count = COLS * ROWS;

  const colAct = new Float32Array(COLS);
  for (let c = 0; c < COLS; c++) colAct[c] = rnd();

  const raw = new Float32Array(count);
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS; r++)
      raw[c * ROWS + r] = 0.55 * colAct[c] + 0.45 * rnd();

  // 4방향 이웃 평활화 — 고립된 튐 없이 덩어리진 패턴
  const val = new Float32Array(count);
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      let sum = raw[c * ROWS + r] * 0.5;
      let w = 0.5;
      const near: [number, number][] = [
        [c - 1, r],
        [c + 1, r],
        [c, r - 1],
        [c, r + 1],
      ];
      for (const [nc, nr] of near) {
        if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) {
          sum += raw[nc * ROWS + nr] * 0.125;
          w += 0.125;
        }
      }
      val[c * ROWS + r] = sum / w;
    }
  }

  const x = new Float32Array(count);
  const z = new Float32Array(count);
  const heights = new Float32Array(count);
  const t0 = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  let maxT = 0;
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const i = c * ROWS + r;
      const v = val[i];
      const lv = v < 0.42 ? 0 : v < 0.55 ? 1 : v < 0.68 ? 2 : v < 0.8 ? 3 : 4;
      heights[i] = LEVEL_HEIGHTS[lv];
      x[i] = (c - (COLS - 1) / 2) * GAP;
      z[i] = (r - (ROWS - 1) / 2) * GAP;
      // 깊이 페이드는 fog 대신 행별로 색에 굽는다 — 거리 기반 fog는
      // 좌우 끝(카메라에서 멂)까지 지워서 와이드 화면에서 밴드가 끊겨 보인다
      const fade = 0.35 + 0.65 * (r / (ROWS - 1));
      color.setHex(LEVEL_COLORS[lv]).multiplyScalar(fade);
      colors.set([color.r, color.g, color.b], i * 3);
      // 시간축(왼→오)으로 스윕하며 셀마다 살짝 어긋나게 솟는다
      t0[i] = 0.1 + (c / (COLS - 1)) * 1.7 + rnd() * 0.3;
      if (t0[i] > maxT) maxT = t0[i];
    }
  }

  return { count, x, z, heights, t0, colors, maxT: maxT + RISE + 0.2 };
}

/**
 * 애니메이션 진행 상태 — WebGL 리소스와 마찬가지로 React 상태가 아니라
 * 모듈 캐시에 둔다. 언어 전환으로 리마운트돼도 연출이 재생되지 않는다(의도).
 */
type FxState = {
  field: ReturnType<typeof buildField>;
  time: number;
  settled: boolean;
  waves: { x: number; z: number; t0: number }[];
};

let cached: FxState | null = null;

function getState(): FxState {
  if (cached) return cached;
  cached = { field: buildField(), time: 0, settled: false, waves: [] };
  return cached;
}

const dummy = new THREE.Object3D();
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const hitPoint = new THREE.Vector3();
const fieldPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BASE_Y);

function ContributionField() {
  const state = getState();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  // 리마운트 시 settled 상태여도 최종 형상을 한 번은 버퍼에 써야 한다
  const hydrated = useRef(false);

  // 클릭 → 필드 평면에 투영해 그 지점에서 파동을 일으킨다.
  // 캔버스는 pointer-events-none이라 window에서 받되 캔버스 영역만 반응.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const rect = gl.domElement.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      )
        return;
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(fieldPlane, hitPoint)) return;
      const s = getState();
      s.waves.push({ x: hitPoint.x, z: hitPoint.z, t0: s.time });
      if (s.waves.length > 4) s.waves.shift();
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, [camera, gl]);

  useFrame((_, rawDelta) => {
    const s = getState();
    const m = mesh.current;
    if (!m) return;
    if (s.settled && s.waves.length === 0 && hydrated.current) return;
    s.time += Math.min(rawDelta, 0.05);
    s.waves = s.waves.filter((w) => s.time - w.t0 < WAVE_LIFE);

    const f = s.field;
    for (let i = 0; i < f.count; i++) {
      const p = s.settled ? 1 : clamp01((s.time - f.t0[i]) / RISE);
      const e = 1 - (1 - p) ** 3;
      let h = f.heights[i] * e;
      for (const w of s.waves) {
        const t = s.time - w.t0;
        const dx = f.x[i] - w.x;
        const dz = f.z[i] - w.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        const rel = d - WAVE_SPEED * t;
        h +=
          WAVE_AMP *
          Math.cos(rel * WAVE_FREQ) *
          Math.exp(-(rel * rel) / (2 * WAVE_SIGMA * WAVE_SIGMA)) *
          Math.exp(-0.05 * d) *
          Math.exp(-WAVE_DAMP * t);
      }
      h = Math.max(h, 0.02);
      dummy.position.set(f.x[i], h / 2, f.z[i]);
      dummy.scale.set(SIZE, h, SIZE);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    if (!s.settled && s.time >= f.maxT) s.settled = true;
    if (s.settled) hydrated.current = true;
  });

  return (
    <group position={[0, BASE_Y, 0]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, state.field.count]}>
        {/* 인스턴스 색은 정적 — setColorAt은 첫 컴파일과 경합하므로 선언적으로 붙인다 */}
        <instancedBufferAttribute
          attach="instanceColor"
          args={[state.field.colors, 3]}
        />
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

export default function HeroSceneCanvas() {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 1.6, 11], fov: 50 }}
      onCreated={({ camera }) => camera.lookAt(0, -2.6, 0)}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 9, 5]} intensity={1.2} />
      <ContributionField />
    </Canvas>
  );
}
