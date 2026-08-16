// TOOL035 mobile-real-device runner registration payload.
// This is intentionally tool-local in the auxiliary workspace; the main workspace
// can import/copy this contract into the current shared mobile runner after integration.
export const tool035MobileRunnerEntry = {
  tool: 35,
  slug: 'pdf-text-image-extractor',
  inputKind: 'pdf-document',
  input: '[data-testid="tool035-file-input"]',
  ready: ['[data-testid="tool035-workspace"]'],
  action: '[data-testid="tool035-extract"]',
  result: '[data-testid="tool035-results"]',
  success: ['[data-testid="tool035-text-results"]','[data-testid="tool035-image-results"]'],
  error: '[data-testid="tool035-error"]',
  userPath: ['PDF 선택','모드 선택','추출','페이지별 결과 확인','TXT 또는 ZIP 다운로드'],
};
