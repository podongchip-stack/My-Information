import * as THREE from "three";

/**
 * 스크롤에 따라 파티클이 옮겨 다닐 세 가지 형상.
 *
 *   0. battery — 배터리 셀 격자 (BMS 연구)
 *   1. neural  — 신경망 디스크 (AI)
 *   2. server  — 서버 랙 (백엔드)
 *
 * 세 배열은 모두 같은 인덱스 개수를 갖고, 인덱스별로 대응하는 점끼리
 * 보간되어 모핑된다. 대응이 무작위면 점들이 서로를 가로질러 지저분해지므로
 * 각 형상을 XY 평면 기준 각도로 정렬해 회전에 가까운 변형이 되도록 맞춘다.
 */

export type ShapeName = "battery" | "neural" | "server";

/** 각도 정렬 — 형상 간 인덱스 대응을 만들어 모핑 경로가 꼬이지 않게 한다. */
function sortByAngle(points: THREE.Vector3[]): THREE.Vector3[] {
  return [...points].sort(
    (a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x)
  );
}

function toArray(points: THREE.Vector3[]): Float32Array {
  const out = new Float32Array(points.length * 3);
  points.forEach((p, i) => out.set([p.x, p.y, p.z], i * 3));
  return out;
}

/** 3×2로 놓인 원통형 셀 6개의 표면에 점을 뿌린다. */
function batteryPoints(count: number): THREE.Vector3[] {
  const COLS = 3;
  const ROWS = 2;
  const CELLS = COLS * ROWS;
  const R = 2.1;
  const H = 5.4;
  const GAP_X = 6.2;
  const GAP_Y = 7.0;

  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const cell = i % CELLS;
    const cx = ((cell % COLS) - (COLS - 1) / 2) * GAP_X;
    const cy = (Math.floor(cell / COLS) - (ROWS - 1) / 2) * GAP_Y;

    const theta = Math.random() * Math.PI * 2;
    // 열의 20%는 위·아래 뚜껑에 배치해 원통 끝이 닫혀 보이도록
    const onCap = Math.random() < 0.2;
    const r = onCap ? R * Math.sqrt(Math.random()) : R;
    const h = onCap ? (Math.random() < 0.5 ? -H / 2 : H / 2) : (Math.random() - 0.5) * H;

    pts.push(new THREE.Vector3(cx + r * Math.cos(theta), cy + h, r * Math.sin(theta)));
  }
  return pts;
}

/** 납작한 타원 디스크 안에 균일 분포 — 기존 히어로의 신경망 필드. */
function neuralPoints(count: number): THREE.Vector3[] {
  const RX = 9.0;
  const RY = 6.4;
  const RZ = 1.8;

  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.cbrt(Math.random());
    pts.push(
      new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta) * RX,
        r * Math.sin(phi) * Math.sin(theta) * RY,
        r * Math.cos(phi) * RZ
      )
    );
  }
  return pts;
}

/** 랙 4열 × 유닛 14단. 각 유닛은 가로로 뻗은 짧은 점열이다. */
function serverPoints(count: number): THREE.Vector3[] {
  const COLS = 4;
  const ROWS = 14;
  const COL_GAP = 5.4;
  const ROW_GAP = 0.92;
  const UNIT_W = 3.9;

  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS) % ROWS;
    const slot = Math.floor(i / (COLS * ROWS));

    const baseX = (col - (COLS - 1) / 2) * COL_GAP;
    // 같은 유닛에 여러 점이 겹치지 않도록 slot으로 가로 위치를 흩는다
    const jitter = ((slot * 0.37 + Math.random() * 0.63) % 1) - 0.5;

    pts.push(
      new THREE.Vector3(
        baseX + jitter * UNIT_W,
        (row - (ROWS - 1) / 2) * ROW_GAP,
        (Math.random() - 0.5) * 1.4
      )
    );
  }
  return pts;
}

export interface ShapeData {
  /** 형상별 정점 좌표 (인덱스 대응됨) */
  positions: Record<ShapeName, Float32Array>;
  /** 형상별 근접 노드 연결 (a, b 인덱스 쌍) */
  edges: Record<ShapeName, Uint32Array>;
}

/** 가까운 점끼리 이어 엣지 목록을 만든다. 상한을 넘으면 균등하게 솎아낸다. */
function buildEdges(
  points: THREE.Vector3[],
  maxDistance: number,
  maxEdges: number
): Uint32Array {
  const pairs: number[] = [];
  const n = points.length;
  const limit = maxDistance * maxDistance;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (points[i].distanceToSquared(points[j]) < limit) pairs.push(i, j);
    }
  }

  const total = pairs.length / 2;
  if (total <= maxEdges) return new Uint32Array(pairs);

  // 앞에서부터 자르면 안 된다 — 점이 각도순으로 정렬돼 있어서
  // 한쪽 부채꼴에만 선이 몰린 그물이 된다. 일정 간격으로 골라낸다.
  const step = total / maxEdges;
  const out = new Uint32Array(maxEdges * 2);
  for (let k = 0; k < maxEdges; k++) {
    const src = Math.floor(k * step) * 2;
    out[k * 2] = pairs[src];
    out[k * 2 + 1] = pairs[src + 1];
  }
  return out;
}

export function buildShapes(count: number): ShapeData {
  const battery = sortByAngle(batteryPoints(count));
  const neural = sortByAngle(neuralPoints(count));
  const server = sortByAngle(serverPoints(count));

  // 밀도가 형상마다 달라 연결 거리도 따로 잡는다.
  // 배터리는 표면에만, 서버는 유닛 안에서만 이어져야 실루엣이 산다.
  const maxEdges = Math.round(count * 2.2);

  return {
    positions: {
      battery: toArray(battery),
      neural: toArray(neural),
      server: toArray(server),
    },
    edges: {
      // 배터리는 원통 표면에만 점이 있어 넓게 잡아야 와이어프레임이 보이고,
      // 서버는 유닛(가로줄) 안에서만 이어져야 랙처럼 읽힌다.
      battery: buildEdges(battery, 1.0, maxEdges),
      neural: buildEdges(neural, 0.95, maxEdges),
      server: buildEdges(server, 0.9, maxEdges),
    },
  };
}
