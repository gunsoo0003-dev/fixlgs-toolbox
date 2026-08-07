export const TOOL013_PRODUCT_LIMITS = {
  maxSideWarn: 12_000,
  maxPixelsWarn: 64_000_000,
  maxSideBlock: 16_384,
  maxPixelsBlock: 100_000_000,
  maxCustomSize: 16_384,
  maxGap: 2_000,
  maxPadding: 2_000,
} as const;

// 주작업장 확정 서비스 상한. 일반 사용자 중심 안정선으로 제품 코드와 안내에 적용한다.
export const TOOL013_SERVICE_LIMIT_CANDIDATES = {
  imageCount: 20,
  outputMaxSide: 10_000,
  outputMaxPixels: 25_000_000,
} as const;

// 서비스 후보 탐색 범위를 한 곳에서 조정하기 위한 값.
export const TOOL013_SERVICE_LIMIT_TEST_VALUES = {
  imageCount: {
    normal: 8,
    beforeCandidate: 19,
    candidate: 20,
    nextExploration: 21,
  },
  outputSide: {
    beforeCandidate: 9_999,
    candidate: 10_000,
    nextExploration: 10_001,
  },
  // 2:1 이미지를 두 장 세로 결합하면 customWidth 5,000에서 정확히 5,000 x 5,000 = 25M pixels.
  outputPixels: {
    beforeCandidateWidth: 4_999,
    candidateWidth: 5_000,
    nextExplorationWidth: 5_001,
  },
} as const;
