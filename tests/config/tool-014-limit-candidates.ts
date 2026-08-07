export const MiB = 1024 * 1024;

export const TOOL014_LIMIT_CANDIDATES = {
  // 최종 제작 전달서에서 이미 확정된 계약값. 후보가 아님.
  layoutCells: {
    normal: 4,
    before: 8,
    candidate: 9,
    above: 10,
    confidence: 'high',
    kind: 'confirmed-contract',
  },

  // 아래는 서비스 유효상한 후보이며 제품의 최종 제한값이 아니다.
  selectedFiles: {
    normal: 9,
    before: 11,
    candidate: 12,
    above: 13,
    confidence: 'high',
    kind: 'service-candidate',
  },
  perFileBytes: {
    normal: 5 * MiB,
    before: 14 * MiB,
    candidate: 15 * MiB,
    above: 16 * MiB,
    confidence: 'medium',
    kind: 'service-candidate',
  },
  totalBytes: {
    normal: 45 * MiB,
    before: 75 * MiB,
    candidate: 80 * MiB,
    above: 85 * MiB,
    confidence: 'medium',
    kind: 'service-candidate',
  },
  sourcePixels: {
    normal: 12_000_000,
    before: 23_000_000,
    candidate: 24_000_000,
    above: 25_000_000,
    confidence: 'medium',
    kind: 'service-candidate',
  },
  outputMaxSide: {
    normal: 1600,
    before: 2999,
    candidate: 3000,
    above: 3001,
    confidence: 'high',
    kind: 'service-candidate',
  },
  outputPixels: {
    normal: 4_000_000,
    before: 8_900_000,
    candidate: 9_000_000,
    above: 9_100_000,
    confidence: 'medium',
    kind: 'service-candidate',
  },
} as const;

// 실제 메모리·대형 해상도 probe는 주작업장 환경에서 명시적으로 켠다.
// false는 SKIP 숨김이 아니라 "고부하 후보 탐색을 아직 실행하지 않는다"는 실행 정책이다.
export const TOOL014_HEAVY_PROBES_DEFAULT = false;
