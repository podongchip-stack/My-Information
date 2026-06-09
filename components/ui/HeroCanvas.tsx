"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 노드를 한 칸씩 타고 이동하며 선을 순차 점화하는 전파 신호
type Signal = {
  node: number; // 현재 머무는 노드
  stepsLeft: number; // 남은 이동 횟수
  timer: number; // 다음 점프까지 남은 시간(초)
  interval: number; // 한 칸 이동에 걸리는 시간(초)
};

function NeuralNetwork() {
  const group = useRef<THREE.Group>(null);
  const lineColorAttr = useRef<THREE.BufferAttribute>(null);
  const strikeTimer = useRef(0);
  const signals = useRef<Signal[]>([]);

  const NODES = 430;
  // 넓고 납작한 타원(디스크) 필드: X·Y는 크게, Z(깊이)는 얇게.
  // 시선축(Z)으로 자전시키면 얇은 옆면이 안 보이고 항상 '가득 찬 면'만 정면으로 보인다.
  const RX = 9.0;
  const RY = 6.4;
  const RZ = 1.8;
  const CONNECT_DIST = 0.95; // 이 거리 안의 노드끼리 선으로 연결

  const data = useMemo(() => {
    const blue = new THREE.Color("#3B82F6");
    const purple = new THREE.Color("#A855F7");

    // 단위 구 안에 균일 분포(cbrt) 후 축별로 늘려 타원형 필드로 분산
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < NODES; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random());
      pts.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta) * RX,
          r * Math.sin(phi) * Math.sin(theta) * RY,
          r * Math.cos(phi) * RZ,
        ),
      );
    }

    const nodePositions = new Float32Array(NODES * 3);
    const nodeColors = new Float32Array(NODES * 3);
    pts.forEach((p, i) => {
      nodePositions.set([p.x, p.y, p.z], i * 3);
      const c = blue.clone().lerp(purple, (p.y / RY + 1) / 2);
      nodeColors.set([c.r, c.g, c.b], i * 3);
    });

    // 가까운 노드 쌍을 선분으로 연결 (+ 인접 그래프 구성)
    const linePts: number[] = [];
    const edgeA: number[] = [];
    const edgeB: number[] = [];
    for (let i = 0; i < NODES; i++) {
      for (let j = i + 1; j < NODES; j++) {
        if (pts[i].distanceTo(pts[j]) < CONNECT_DIST) {
          linePts.push(pts[i].x, pts[i].y, pts[i].z);
          linePts.push(pts[j].x, pts[j].y, pts[j].z);
          edgeA.push(i);
          edgeB.push(j);
        }
      }
    }

    const edgeCount = edgeA.length;
    const adjacency: { edge: number; other: number }[][] = Array.from(
      { length: NODES },
      () => [],
    );
    for (let e = 0; e < edgeCount; e++) {
      adjacency[edgeA[e]].push({ edge: e, other: edgeB[e] });
      adjacency[edgeB[e]].push({ edge: e, other: edgeA[e] });
    }

    return {
      nodePositions,
      nodeColors,
      linePositions: new Float32Array(linePts),
      lineColors: new Float32Array(edgeCount * 6), // 엣지당 정점 2개 × rgb
      charges: new Float32Array(edgeCount), // 각 엣지의 방전 충전값 (0~1)
      adjacency,
      edgeCount,
    };
  }, []);

  // 노드를 동그라미로 그리기 위한 원형 텍스처 (캔버스)
  const circleTexture = useMemo(() => {
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
  }, []);

  // 방전 색상: 평소엔 어두운 시안, 점화되면 밝은 일렉트릭 시안
  const BASE = useMemo(() => new THREE.Color("#0e5a6b").multiplyScalar(0.22), []);
  const FLASH = useMemo(() => new THREE.Color("#22d3ee"), []);

  // 한 번의 번개: 임의 노드에서 출발하는 전파 신호를 2~4개 생성.
  // 신호는 매 프레임이 아니라 interval 간격으로 한 칸씩 이동하며 선을 순차 점화한다.
  const MAX_SIGNALS = 80;
  const triggerStrike = () => {
    const bolts = 2 + Math.floor(Math.random() * 3); // 2~4 줄기 동시 출발
    for (let b = 0; b < bolts; b++) {
      if (signals.current.length >= MAX_SIGNALS) break;
      signals.current.push({
        node: Math.floor(Math.random() * NODES),
        stepsLeft: 6 + Math.floor(Math.random() * 14), // 더 긴 줄기
        timer: 0,
        interval: 0.14 + Math.random() * 0.14, // 한 칸당 140~280ms → 2배 더 느긋한 전파
      });
    }
  };

  useFrame((_, delta) => {
    if (group.current) {
      // 시선축(Z) 기준 자전 → 납작한 타원 면이 항상 정면, 은하처럼 빙글빙글
      group.current.rotation.z += delta * 0.05;
    }

    // 불규칙한 간격으로 번개 발생: u^3 분포라 대부분 짧게 몰리다 가끔 길게 쉼
    strikeTimer.current -= delta;
    if (strikeTimer.current <= 0) {
      triggerStrike();
      const u = Math.random();
      // 대기시간을 0.87배(≈1/1.15)로 줄여 번개 빈도 약 15% ↑
      strikeTimer.current = (0.02 + u * u * u * 0.7) * 0.87;
    }

    // 전파 신호 전진: 각 신호는 interval 간격으로 한 칸씩 이동하며 선을 점화
    const { adjacency, charges, lineColors, edgeCount } = data;
    const active = signals.current;
    for (let i = active.length - 1; i >= 0; i--) {
      const sig = active[i];
      sig.timer -= delta;
      let hops = 0; // 프레임당 과도한 점프 방지(큰 delta 보정)
      while (sig.timer <= 0 && sig.stepsLeft > 0 && hops < 4) {
        const neighbors = adjacency[sig.node];
        if (neighbors.length === 0) {
          sig.stepsLeft = 0;
          break;
        }
        const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
        charges[pick.edge] = 1; // 이번 칸 점화
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
    for (let e = 0; e < edgeCount; e++) {
      if (charges[e] > 0) {
        charges[e] -= delta * (0.8 + Math.random() * 1.5);
        if (charges[e] < 0) charges[e] = 0;
      }
      const c = charges[e];
      const r = BASE.r + (FLASH.r - BASE.r) * c;
      const g = BASE.g + (FLASH.g - BASE.g) * c;
      const bb = BASE.b + (FLASH.b - BASE.b) * c;

      const o = e * 6;
      lineColors[o] = r;
      lineColors[o + 1] = g;
      lineColors[o + 2] = bb;
      lineColors[o + 3] = r;
      lineColors[o + 4] = g;
      lineColors[o + 5] = bb;
    }
    if (lineColorAttr.current) lineColorAttr.current.needsUpdate = true;
  });

  return (
    // X축으로 살짝만 기울여 입체감. 자전(Z축)은 useFrame이 담당. 전체 2배 확대.
    <group ref={group} rotation={[0.18, 0, 0]} scale={2}>
      {/* 노드 (점) */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.nodePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[data.nodeColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          map={circleTexture}
          alphaTest={0.5}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </points>

      {/* 엣지 (번개 방전 연결선) */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.linePositions, 3]} />
          <bufferAttribute
            ref={lineColorAttr}
            attach="attributes-color"
            args={[data.lineColors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas className="h-full w-full" camera={{ position: [0, 0, 8.2], fov: 80 }}>
      <NeuralNetwork />
    </Canvas>
  );
}
