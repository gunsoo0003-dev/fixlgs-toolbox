export type Tool022PresetId = 'naver' | 'blogger' | 'website' | 'og';
export type Tool022SourceType = 'project-fixed' | 'official-recommended' | 'toolbox-recommended';

export type Tool022Preset = {
  id: Tool022PresetId;
  width: number;
  height: number;
  suffix: string;
  sourceType: Tool022SourceType;
  label: { ko: string; en: string; ja: string };
  note: { ko: string; en: string; ja: string };
};

export const TOOL022_LIMITS = {
  maxBackgroundBytes: 20 * 1024 * 1024,
  compareBackgroundBytes: 30 * 1024 * 1024,
  maxPixels: 40_000_000,
  comparePixels: 48_000_000,
  maxTitleChars: 140,
  maxDescriptionChars: 280,
  maxHistory: 24,
} as const;

export const TOOL022_PRESETS: readonly Tool022Preset[] = [
  { id:'naver', width:1200, height:675, suffix:'naver-blog', sourceType:'toolbox-recommended', label:{ko:'네이버 블로그',en:'Naver Blog',ja:'NAVER ブログ'}, note:{ko:'TOOLBOX 권장 · 16:9',en:'TOOLBOX recommendation · 16:9',ja:'TOOLBOX 推奨 · 16:9'} },
  { id:'blogger', width:1200, height:675, suffix:'blogger', sourceType:'toolbox-recommended', label:{ko:'Google 블로그',en:'Google Blog',ja:'Google ブログ'}, note:{ko:'TOOLBOX 권장 · 1200px · 16:9',en:'TOOLBOX recommendation · 1200px · 16:9',ja:'TOOLBOX 推奨 · 1200px · 16:9'} },
  { id:'website', width:1200, height:630, suffix:'website-featured', sourceType:'project-fixed', label:{ko:'웹사이트 대표 이미지',en:'Website Featured Image',ja:'Web サイト代表画像'}, note:{ko:'TOOLBOX 기본 · 1.91:1',en:'TOOLBOX default · 1.91:1',ja:'TOOLBOX 基本 · 1.91:1'} },
  { id:'og', width:1200, height:630, suffix:'open-graph', sourceType:'official-recommended', label:{ko:'Open Graph 1200×630',en:'Open Graph 1200×630',ja:'Open Graph 1200×630'}, note:{ko:'프로젝트 확정 + Meta 권장',en:'Project fixed + Meta recommendation',ja:'プロジェクト確定 + Meta 推奨'} },
] as const;

export const TOOL022_GUIDELINES = {
  verifiedAt: '2026-08-09',
  naver: { sourceType:'toolbox-recommended', officialFixedPixels:false },
  blogger: { sourceType:'toolbox-recommended', officialFixedPixels:false, discoverReference:'1200px+ / 16:9' },
  og: { sourceType:'official-recommended', recommendedWidth:1200, recommendedHeight:630, warningBytes:8 * 1024 * 1024 },
} as const;
