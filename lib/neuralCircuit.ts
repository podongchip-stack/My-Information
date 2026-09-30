/** 신경망 ↔ 회로 모프용 파티클 위치 생성. 시드 고정이라 매번 같은 모양이 나온다. */

type Vec3 = [number, number, number];
type Segment = [Vec3, Vec3];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 길이에 비례해 선분을 고르고 그 위의 한 점을 뽑는다. */
function sampleSegments(segments: Segment[], count: number, rand: () => number) {
  const lengths = segments.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  const total = lengths.reduce((s, l) => s + l, 0);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    let pick = rand() * total;
    let s = 0;
    while (s < segments.length - 1 && pick > lengths[s]) pick -= lengths[s++];
    const [a, b] = segments[s];
    const t = rand();
    for (let k = 0; k < 3; k++) out[i * 3 + k] = a[k] + (b[k] - a[k]) * t;
  }
  return out;
}

/** 신경망: 4개 레이어의 노드 위(30%)와 인접 레이어 사이 연결선 위(70%)에 점을 뿌린다. */
export function buildNetwork(count: number, seed = 7): Float32Array {
  const rand = mulberry32(seed);
  const layerX = [-3.2, -1.1, 1.1, 3.2];
  const layerSize = [4, 6, 6, 4];
  const layers: Vec3[][] = layerX.map((x, l) =>
    Array.from({ length: layerSize[l] }, (_, i): Vec3 => [
      x,
      (i - (layerSize[l] - 1) / 2) * 0.62,
      (rand() - 0.5) * 1.0,
    ])
  );

  const edges: Segment[] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    for (const a of layers[l]) for (const b of layers[l + 1]) edges.push([a, b]);
  }

  const nodes = layers.flat();
  const out = sampleSegments(edges, count, rand);
  for (let i = 0; i < count; i++) {
    if (rand() < 0.3) {
      const n = nodes[Math.floor(rand() * nodes.length)];
      for (let k = 0; k < 3; k++) out[i * 3 + k] = n[k] + (rand() - 0.5) * 0.14;
    } else {
      for (let k = 0; k < 3; k++) out[i * 3 + k] += (rand() - 0.5) * 0.03;
    }
  }
  return out;
}

/** 회로: 격자에 맞춘 직각 트레이스 + 가운데 칩(외곽선과 핀). 평면(z=0)에 놓인다. */
export function buildCircuit(count: number, seed = 13): Float32Array {
  const rand = mulberry32(seed);
  const grid = 0.4;
  const segments: Segment[] = [];

  const half = 0.8;
  const corners: Vec3[] = [
    [-half, -half, 0],
    [half, -half, 0],
    [half, half, 0],
    [-half, half, 0],
  ];
  for (let i = 0; i < 4; i++) segments.push([corners[i], corners[(i + 1) % 4]]);
  for (const p of [-0.4, 0, 0.4]) {
    segments.push([[p, half, 0], [p, half + 0.5, 0]]);
    segments.push([[p, -half, 0], [p, -half - 0.5, 0]]);
    segments.push([[half, p, 0], [half + 0.5, p, 0]]);
    segments.push([[-half, p, 0], [-half - 0.5, p, 0]]);
  }

  const cols = 9;
  const rows = 4;
  for (let n = 0; n < 34; n++) {
    const horizontal = rand() < 0.6;
    const len = (2 + Math.floor(rand() * 5)) * grid;
    const x = Math.round((rand() * 2 - 1) * cols) * grid;
    const y = Math.round((rand() * 2 - 1) * rows) * grid;
    const seg: Segment = horizontal
      ? [[x, y, 0], [Math.min(x + len, cols * grid), y, 0]]
      : [[x, y, 0], [x, Math.min(y + len, rows * grid), 0]];
    const inChip = seg.some(([px, py]) => Math.abs(px) < half + 0.5 && Math.abs(py) < half + 0.5);
    if (!inChip) segments.push(seg);
  }

  const out = sampleSegments(segments, count, rand);
  for (let i = 0; i < count; i++) {
    out[i * 3] += (rand() - 0.5) * 0.02;
    out[i * 3 + 1] += (rand() - 0.5) * 0.02;
  }
  return out;
}

/** 시각 t(초)의 파티클 위치를 out에 쓰는 패턴. animated가 false면 t와 무관하게 늘 같다. */
export type Pattern = {
  animated: boolean;
  write: (t: number, out: Float32Array) => void;
};

export function staticPattern(points: Float32Array): Pattern {
  return { animated: false, write: (_, out) => out.set(points) };
}

/** 반지름 r인 원을 이루는 선분들. plane은 원이 놓이는 평면, 중심은 c. */
function circleSegments(c: Vec3, r: number, plane: "xy" | "yz", steps = 48): Segment[] {
  const at = (a: number): Vec3 =>
    plane === "xy"
      ? [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]]
      : [c[0], c[1] + Math.cos(a) * r, c[2] + Math.sin(a) * r];
  return Array.from({ length: steps }, (_, i): Segment => [
    at((Math.PI * 2 * i) / steps),
    at((Math.PI * 2 * (i + 1)) / steps),
  ]);
}

const PhasorPart = {
  Static: 0,
  Helix: 1,
  SinWall: 2,
  CosFloor: 3,
  Vector: 4,
  Tip: 5,
  DropWall: 6,
  DropFloor: 7,
} as const;

/**
 * 페이저(3D): x=x0의 YZ 원 위에서 점이 돌고, 그 궤적이 x축을 따라 흘러가는 헬릭스가 된다.
 * 헬릭스를 뒷벽(z=-W)에 투영하면 sin, 바닥(y=-W)에 투영하면 cos — 두 파형은 90° 위상차로 함께 흐른다.
 * 벽·바닥 테두리와 원은 고정, 나머지는 매 프레임 t로 계산한다. 전체를 비스듬히 내려다보게 돌려 둔다.
 */
export function buildPhasor(count: number, seed = 21): Pattern {
  const rand = mulberry32(seed);
  const r = 0.95;
  const W = 1.4;
  const x0 = -3.4;
  const x1 = 3.4;
  const k = 1.7;
  const omega = 1.4;

  const yaw = -0.55;
  const pitch = 0.32;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const view = (out: Float32Array, i: number, x: number, y: number, z: number) => {
    const vx = x * cy + z * sy;
    const vz = -x * sy + z * cy;
    out[i * 3] = vx;
    out[i * 3 + 1] = y * cp - vz * sp;
    out[i * 3 + 2] = y * sp + vz * cp;
  };

  const part = new Uint8Array(count);
  const u = new Float32Array(count);
  const jitter = new Float32Array(count * 3);
  let staticCount = 0;
  for (let i = 0; i < count; i++) {
    const roll = rand();
    part[i] =
      roll < 0.24 ? PhasorPart.Helix
      : roll < 0.4 ? PhasorPart.SinWall
      : roll < 0.56 ? PhasorPart.CosFloor
      : roll < 0.61 ? PhasorPart.Vector
      : roll < 0.65 ? PhasorPart.Tip
      : roll < 0.69 ? PhasorPart.DropWall
      : roll < 0.73 ? PhasorPart.DropFloor
      : PhasorPart.Static;
    if (part[i] === PhasorPart.Static) staticCount++;
    u[i] = rand();
    const spread = part[i] === PhasorPart.Tip ? 0.1 : 0.02;
    for (let c = 0; c < 3; c++) jitter[i * 3 + c] = (rand() - 0.5) * spread;
  }

  const frame: Segment[] = [
    ...circleSegments([x0, 0, 0], r, "yz"),
    [[x0 - 0.4, 0, 0], [x1 + 0.2, 0, 0]],
    // 뒷벽 (sin)
    [[x0, -W, -W], [x1, -W, -W]],
    [[x0, W, -W], [x1, W, -W]],
    [[x0, 0, -W], [x1, 0, -W]],
    [[x0, -W, -W], [x0, W, -W]],
    [[x1, -W, -W], [x1, W, -W]],
    // 바닥 (cos)
    [[x0, -W, W], [x1, -W, W]],
    [[x0, -W, 0], [x1, -W, 0]],
    [[x0, -W, -W], [x0, -W, W]],
    [[x1, -W, -W], [x1, -W, W]],
  ];
  const statics = sampleSegments(frame, staticCount, rand);
  const base = new Float32Array(count * 3);
  for (let i = 0, s = 0; i < count; i++) {
    if (part[i] !== PhasorPart.Static) continue;
    view(base, i, statics[s * 3], statics[s * 3 + 1], statics[s * 3 + 2]);
    s++;
  }

  return {
    animated: true,
    write(t, out) {
      const phi = omega * t;
      const ty = r * Math.sin(phi);
      const tz = r * Math.cos(phi);
      for (let i = 0; i < count; i++) {
        let x = x0;
        let y = 0;
        let z = 0;
        switch (part[i]) {
          case PhasorPart.Static:
            out[i * 3] = base[i * 3];
            out[i * 3 + 1] = base[i * 3 + 1];
            out[i * 3 + 2] = base[i * 3 + 2];
            continue;
          case PhasorPart.Helix:
          case PhasorPart.SinWall:
          case PhasorPart.CosFloor: {
            x = x0 + u[i] * (x1 - x0);
            const a = phi - k * (x - x0);
            y = part[i] === PhasorPart.CosFloor ? -W : r * Math.sin(a);
            z = part[i] === PhasorPart.SinWall ? -W : r * Math.cos(a);
            break;
          }
          case PhasorPart.Vector:
            y = ty * u[i];
            z = tz * u[i];
            break;
          case PhasorPart.Tip:
            y = ty;
            z = tz;
            break;
          case PhasorPart.DropWall:
            y = ty;
            z = tz + (-W - tz) * u[i];
            break;
          case PhasorPart.DropFloor:
            y = ty + (-W - ty) * u[i];
            z = tz;
            break;
        }
        view(out, i, x + jitter[i * 3], y + jitter[i * 3 + 1], z + jitter[i * 3 + 2]);
      }
    },
  };
}

/**
 * DB 코인 스택: 비스듬히 본 원기둥 동전이 층층이 쌓인 실린더 3개.
 * 데이터 노드(작은 점 덩어리)가 차례로 위에서 떨어져 윗면을 지나 한 층까지 내려간 뒤
 * 그 동전 테두리로 퍼져 흡수되고, 흡수된 동전은 잠깐 부풀었다 돌아온다.
 */
export function buildCoins(count: number, seed = 33): Pattern {
  const rand = mulberry32(seed);
  const tilt = 0.55;
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);

  const stacks: { x: number; r: number; coins: number }[] = [
    { x: -2.5, r: 0.85, coins: 4 },
    { x: 0, r: 1.05, coins: 6 },
    { x: 2.5, r: 0.85, coins: 5 },
  ];
  const coinH = 0.24;
  const gap = 0.07;
  const bottom = (s: number) => (-stacks[s].coins * (coinH + gap)) / 2;
  const coinY = (s: number, c: number) => bottom(s) + c * (coinH + gap);
  const firstCoin = stacks.map((_, s) => stacks.slice(0, s).reduce((n, st) => n + st.coins, 0));
  const bump = new Float32Array(stacks.reduce((n, st) => n + st.coins, 0));

  const PACKETS = 12;
  const PERIOD = 3.2;
  const FALL = 0.55;
  const SPREAD = 0.8;
  const packetCount = Math.floor(count * 0.2);
  const rimCount = count - packetCount;

  // 동전 테두리 파티클: 둘레에 비례해 동전을 고르고, 윗원·아랫원·세로 기둥 위에 놓는다
  const rimStack = new Uint8Array(rimCount);
  const rimCoin = new Uint8Array(rimCount);
  const rimAngle = new Float32Array(rimCount);
  const rimY = new Float32Array(rimCount);
  const weights = stacks.map((st) => st.r * st.coins);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < rimCount; i++) {
    let pick = rand() * weightSum;
    let s = 0;
    while (s < stacks.length - 1 && pick > weights[s]) pick -= weights[s++];
    const c = Math.floor(rand() * stacks[s].coins);
    const roll = rand();
    rimStack[i] = s;
    rimCoin[i] = c;
    if (roll < 0.88) {
      rimAngle[i] = rand() * Math.PI * 2;
      rimY[i] = coinY(s, c) + (roll < 0.44 ? coinH : 0);
    } else {
      rimAngle[i] = (Math.floor(rand() * 10) / 10) * Math.PI * 2;
      rimY[i] = coinY(s, c) + rand() * coinH;
    }
  }

  // 데이터 노드 파티클: 노드 중심에서의 오프셋과, 흡수될 때 향할 테두리 각도
  const packetOffset = new Float32Array(packetCount * 3);
  const packetAngle = new Float32Array(packetCount);
  for (let i = 0; i < packetCount; i++) {
    const u = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const rr = 0.09 * Math.cbrt(rand());
    const sq = Math.sqrt(1 - u * u);
    packetOffset[i * 3] = rr * sq * Math.cos(phi);
    packetOffset[i * 3 + 1] = rr * u;
    packetOffset[i * 3 + 2] = rr * sq * Math.sin(phi);
    packetAngle[i] = rand() * Math.PI * 2;
  }

  const pStack = new Uint8Array(PACKETS);
  const pCoin = new Uint8Array(PACKETS);
  const pPhase = new Float32Array(PACKETS);

  const put = (out: Float32Array, i: number, x: number, y: number, z: number) => {
    out[i * 3] = x;
    out[i * 3 + 1] = y * cos - z * sin;
    out[i * 3 + 2] = y * sin + z * cos;
  };

  return {
    animated: true,
    write(t, out) {
      bump.fill(0);
      for (let j = 0; j < PACKETS; j++) {
        const cycle = t / PERIOD + j / PACKETS;
        const n = Math.floor(cycle);
        // 노드마다, 주기마다 목적지(스택·층)를 새로 뽑되 시드 고정이라 늘 같은 순서
        const pick = mulberry32(j * 7919 + n * 104729 + seed);
        const s = Math.floor(pick() * stacks.length);
        pStack[j] = s;
        pCoin[j] = Math.floor(pick() * stacks[s].coins);
        pPhase[j] = cycle - n;
        if (pPhase[j] > FALL) {
          const since = (pPhase[j] - FALL) * PERIOD;
          bump[firstCoin[s] + pCoin[j]] += 0.14 * Math.exp(-since * 2.5);
        }
      }

      for (let i = 0; i < rimCount; i++) {
        const st = stacks[rimStack[i]];
        const r = st.r * (1 + bump[firstCoin[rimStack[i]] + rimCoin[i]]);
        put(out, i, st.x + Math.cos(rimAngle[i]) * r, rimY[i], Math.sin(rimAngle[i]) * r);
      }

      for (let i = 0; i < packetCount; i++) {
        const j = i % PACKETS;
        const st = stacks[pStack[j]];
        const phase = pPhase[j];
        const targetY = coinY(pStack[j], pCoin[j]) + coinH / 2;
        const startY = -bottom(pStack[j]) + 1.3;
        const grow = Math.min(phase / 0.08, 1);
        const fall = Math.min(phase / FALL, 1);
        const cy = startY + (targetY - startY) * fall * fall;
        const ox = packetOffset[i * 3] * grow;
        const oy = packetOffset[i * 3 + 1] * grow;
        const oz = packetOffset[i * 3 + 2] * grow;
        const r = st.r * (1 + bump[firstCoin[pStack[j]] + pCoin[j]]);
        const rx = st.x + Math.cos(packetAngle[i]) * r;
        const rz = Math.sin(packetAngle[i]) * r;
        const m = phase <= FALL ? 0 : Math.min((phase - FALL) / (SPREAD - FALL), 1);
        const e = m * m * (3 - 2 * m);
        put(
          out,
          rimCount + i,
          st.x + ox + (rx - st.x - ox) * e,
          cy + oy + (targetY - cy - oy) * e,
          oz + (rz - oz) * e
        );
      }
    },
  };
}

/**
 * 보어 원자: 핵과 n=1~4 궤도 링을 비스듬히 눕혔다. 전자는 궤도를 공전하다가(안쪽일수록 빠름)
 * 날아온 광자를 흡수하면 바깥 궤도로 올라가고, 안쪽으로 내려올 때 광자를 내보낸다.
 * 광자는 물결치는 짧은 파동 묶음이고, 두 궤도의 에너지(−1/n²) 차이가 클수록 파장이 짧다.
 */
export function buildAtom(count: number, seed = 45): Pattern {
  const rand = mulberry32(seed);
  const orbits = [0.6, 1.2, 1.85, 2.55];
  const tilt = 1.05;
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const put = (out: Float32Array, i: number, x: number, y: number, z: number) => {
    out[i * 3] = x;
    out[i * 3 + 1] = y * cos - z * sin;
    out[i * 3 + 2] = y * sin + z * cos;
  };

  // [도착 궤도 n, 그 궤도에 머무는 시간(초)]. 마지막(4) 다음은 처음(1)으로 내려오며 한 바퀴.
  const script: [number, number][] = [
    [1, 1.6],
    [3, 1.8],
    [2, 1.4],
    [1, 1.4],
    [4, 1.6],
  ];
  const JUMP = 0.5;
  const SPEED = 4.5;
  const FLIGHT_IN = 1;
  const FLIGHT_OUT = 1.6;
  const omega = (n: number) => 3 / Math.pow(n, 1.2);
  const energy = (n: number) => -1 / (n * n);

  // 각 전이의 시작 시각과 그때까지 돈 각도를 미리 적분해 둔다
  const steps: { start: number; from: number; to: number; theta: number }[] = [];
  let cycle = 0;
  let turn = 0;
  script.forEach(([to, hold], k) => {
    const from = script[(k + script.length - 1) % script.length][0];
    steps.push({ start: cycle, from, to, theta: turn });
    turn += ((omega(from) + omega(to)) / 2) * JUMP + omega(to) * hold;
    cycle += JUMP + hold;
  });

  const electronAt = (t: number): [number, number] => {
    const c = Math.floor(t / cycle);
    const local = t - c * cycle;
    let k = steps.length - 1;
    while (k > 0 && steps[k].start > local) k--;
    const { start, from, to, theta } = steps[k];
    const tau = local - start;
    const w0 = omega(from);
    const w1 = omega(to);
    let angle: number;
    let r: number;
    if (tau < JUMP) {
      const u = tau / JUMP;
      angle = theta + (w0 + ((w1 - w0) * u) / 2) * tau;
      r = orbits[from - 1] + (orbits[to - 1] - orbits[from - 1]) * u * u * (3 - 2 * u);
    } else {
      angle = theta + ((w0 + w1) / 2) * JUMP + w1 * (tau - JUMP);
      r = orbits[to - 1];
    }
    angle += c * turn;
    return [Math.cos(angle) * r, Math.sin(angle) * r];
  };

  const nucleusCount = Math.floor(count * 0.12);
  const electronCount = Math.floor(count * 0.05);
  const photonCount = Math.floor(count * 0.05);
  const photonStart = nucleusCount + electronCount;
  const ringStart = photonStart + photonCount * 2;

  // 핵과 궤도 링은 움직이지 않으므로 기울인 좌표를 한 번만 만든다
  const base = new Float32Array(count * 3);
  for (let i = 0; i < nucleusCount; i++) {
    const u = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const rr = 0.22 * Math.cbrt(rand());
    const sq = Math.sqrt(1 - u * u);
    put(base, i, rr * sq * Math.cos(phi), rr * sq * Math.sin(phi), rr * u);
  }
  const rings = sampleSegments(
    orbits.flatMap((r) => circleSegments([0, 0, 0], r, "xy", 64)),
    count - ringStart,
    rand
  );
  for (let i = ringStart; i < count; i++) {
    const j = (i - ringStart) * 3;
    put(base, i, rings[j], rings[j + 1], rings[j + 2] + (rand() - 0.5) * 0.02);
  }

  // 전자 덩어리 오프셋, 광자 파티클의 파동 묶음 내 위치(0~1)
  const blob = new Float32Array((ringStart - nucleusCount) * 3);
  for (let i = 0; i < blob.length; i++) blob[i] = (rand() - 0.5) * 0.13;
  const along = new Float32Array(photonCount * 2);
  for (let i = 0; i < along.length; i++) along[i] = rand();

  type Photon = { hx: number; hy: number; bx: number; by: number; len: number; waves: number };
  const photons: (Photon | null)[] = [null, null];

  return {
    animated: true,
    write(t, out) {
      out.set(base.subarray(0, nucleusCount * 3));
      out.set(base.subarray(ringStart * 3), ringStart * 3);

      const [ex, ey] = electronAt(t);

      // 전이마다 광자 하나. 인접한 전이끼리 슬롯이 겹치지 않도록 k % 2 슬롯을 쓴다
      photons[0] = photons[1] = null;
      const c = Math.floor(t / cycle);
      for (let cc = c - 1; cc <= c + 1; cc++) {
        steps.forEach(({ start, from, to }, k) => {
          const T = cc * cycle + start;
          const waves = 2 + 6 * Math.abs(energy(to) - energy(from));
          if (to > from && t >= T - FLIGHT_IN && t < T) {
            const dist = SPEED * (T - t);
            const a = 2.5 + k * 1.3;
            const bx = Math.cos(a);
            const by = Math.sin(a);
            photons[k % 2] = { hx: ex + bx * dist, hy: ey + by * dist, bx, by, len: Math.min(dist, 1.1), waves };
          } else if (to < from && t >= T && t < T + FLIGHT_OUT) {
            const dist = SPEED * (t - T);
            const [ox, oy] = electronAt(T);
            const norm = Math.hypot(ox, oy) || 1;
            const bx = -ox / norm;
            const by = -oy / norm;
            photons[k % 2] = { hx: ox - bx * dist, hy: oy - by * dist, bx, by, len: Math.min(dist, 1.1), waves };
          }
        });
      }

      for (let i = nucleusCount; i < ringStart; i++) {
        const j = (i - nucleusCount) * 3;
        const slot = i < photonStart ? -1 : Math.floor((i - photonStart) / photonCount);
        const ph = slot < 0 ? null : photons[slot];
        if (!ph) {
          // 전자, 그리고 쉬고 있는 광자 파티클은 전자 자리에 모여 있다
          put(out, i, ex + blob[j], ey + blob[j + 1], blob[j + 2]);
          continue;
        }
        const u = along[i - photonStart];
        const wave = 0.12 * Math.sin(Math.PI * 2 * u * ph.waves - t * 8) * Math.sin(Math.PI * u);
        put(
          out,
          i,
          ph.hx + ph.bx * u * ph.len - ph.by * wave,
          ph.hy + ph.by * u * ph.len + ph.bx * wave,
          blob[j + 2] * 0.2
        );
      }
    },
  };
}
