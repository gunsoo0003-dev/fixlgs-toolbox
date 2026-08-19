export const TOOL052_TZ_DATASET = {
  source: 'IANA Time Zone Database',
  release: '2026c',
  releaseDate: '2026-07-08',
  runtime: 'Browser Intl.DateTimeFormat IANA rules',
} as const;

export type Tool052City = {
  id: string;
  city: { ko: string; en: string; ja: string };
  country: { ko: string; en: string; ja: string };
  zone: string;
};

export const TOOL052_CITIES: readonly Tool052City[] = [
  { id: 'seoul', city: { ko: '서울', en: 'Seoul', ja: 'ソウル' }, country: { ko: '대한민국', en: 'South Korea', ja: '韓国' }, zone: 'Asia/Seoul' },
  { id: 'tokyo', city: { ko: '도쿄', en: 'Tokyo', ja: '東京' }, country: { ko: '일본', en: 'Japan', ja: '日本' }, zone: 'Asia/Tokyo' },
  { id: 'new-york', city: { ko: '뉴욕', en: 'New York', ja: 'ニューヨーク' }, country: { ko: '미국', en: 'United States', ja: '米国' }, zone: 'America/New_York' },
  { id: 'los-angeles', city: { ko: '로스앤젤레스', en: 'Los Angeles', ja: 'ロサンゼルス' }, country: { ko: '미국', en: 'United States', ja: '米国' }, zone: 'America/Los_Angeles' },
  { id: 'chicago', city: { ko: '시카고', en: 'Chicago', ja: 'シカゴ' }, country: { ko: '미국', en: 'United States', ja: '米国' }, zone: 'America/Chicago' },
  { id: 'denver', city: { ko: '덴버', en: 'Denver', ja: 'デンバー' }, country: { ko: '미국', en: 'United States', ja: '米国' }, zone: 'America/Denver' },
  { id: 'london', city: { ko: '런던', en: 'London', ja: 'ロンドン' }, country: { ko: '영국', en: 'United Kingdom', ja: '英国' }, zone: 'Europe/London' },
  { id: 'paris', city: { ko: '파리', en: 'Paris', ja: 'パリ' }, country: { ko: '프랑스', en: 'France', ja: 'フランス' }, zone: 'Europe/Paris' },
  { id: 'berlin', city: { ko: '베를린', en: 'Berlin', ja: 'ベルリン' }, country: { ko: '독일', en: 'Germany', ja: 'ドイツ' }, zone: 'Europe/Berlin' },
  { id: 'madrid', city: { ko: '마드리드', en: 'Madrid', ja: 'マドリード' }, country: { ko: '스페인', en: 'Spain', ja: 'スペイン' }, zone: 'Europe/Madrid' },
  { id: 'rome', city: { ko: '로마', en: 'Rome', ja: 'ローマ' }, country: { ko: '이탈리아', en: 'Italy', ja: 'イタリア' }, zone: 'Europe/Rome' },
  { id: 'moscow', city: { ko: '모스크바', en: 'Moscow', ja: 'モスクワ' }, country: { ko: '러시아', en: 'Russia', ja: 'ロシア' }, zone: 'Europe/Moscow' },
  { id: 'dubai', city: { ko: '두바이', en: 'Dubai', ja: 'ドバイ' }, country: { ko: '아랍에미리트', en: 'United Arab Emirates', ja: 'アラブ首長国連邦' }, zone: 'Asia/Dubai' },
  { id: 'singapore', city: { ko: '싱가포르', en: 'Singapore', ja: 'シンガポール' }, country: { ko: '싱가포르', en: 'Singapore', ja: 'シンガポール' }, zone: 'Asia/Singapore' },
  { id: 'hong-kong', city: { ko: '홍콩', en: 'Hong Kong', ja: '香港' }, country: { ko: '홍콩', en: 'Hong Kong', ja: '香港' }, zone: 'Asia/Hong_Kong' },
  { id: 'shanghai', city: { ko: '상하이', en: 'Shanghai', ja: '上海' }, country: { ko: '중국', en: 'China', ja: '中国' }, zone: 'Asia/Shanghai' },
  { id: 'taipei', city: { ko: '타이베이', en: 'Taipei', ja: '台北' }, country: { ko: '대만', en: 'Taiwan', ja: '台湾' }, zone: 'Asia/Taipei' },
  { id: 'bangkok', city: { ko: '방콕', en: 'Bangkok', ja: 'バンコク' }, country: { ko: '태국', en: 'Thailand', ja: 'タイ' }, zone: 'Asia/Bangkok' },
  { id: 'jakarta', city: { ko: '자카르타', en: 'Jakarta', ja: 'ジャカルタ' }, country: { ko: '인도네시아', en: 'Indonesia', ja: 'インドネシア' }, zone: 'Asia/Jakarta' },
  { id: 'delhi', city: { ko: '델리', en: 'Delhi', ja: 'デリー' }, country: { ko: '인도', en: 'India', ja: 'インド' }, zone: 'Asia/Kolkata' },
  { id: 'kathmandu', city: { ko: '카트만두', en: 'Kathmandu', ja: 'カトマンズ' }, country: { ko: '네팔', en: 'Nepal', ja: 'ネパール' }, zone: 'Asia/Kathmandu' },
  { id: 'sydney', city: { ko: '시드니', en: 'Sydney', ja: 'シドニー' }, country: { ko: '호주', en: 'Australia', ja: 'オーストラリア' }, zone: 'Australia/Sydney' },
  { id: 'melbourne', city: { ko: '멜버른', en: 'Melbourne', ja: 'メルボルン' }, country: { ko: '호주', en: 'Australia', ja: 'オーストラリア' }, zone: 'Australia/Melbourne' },
  { id: 'perth', city: { ko: '퍼스', en: 'Perth', ja: 'パース' }, country: { ko: '호주', en: 'Australia', ja: 'オーストラリア' }, zone: 'Australia/Perth' },
  { id: 'eucla', city: { ko: '유클라', en: 'Eucla', ja: 'ユークラ' }, country: { ko: '호주', en: 'Australia', ja: 'オーストラリア' }, zone: 'Australia/Eucla' },
  { id: 'auckland', city: { ko: '오클랜드', en: 'Auckland', ja: 'オークランド' }, country: { ko: '뉴질랜드', en: 'New Zealand', ja: 'ニュージーランド' }, zone: 'Pacific/Auckland' },
  { id: 'chatham', city: { ko: '채텀 제도', en: 'Chatham Islands', ja: 'チャタム諸島' }, country: { ko: '뉴질랜드', en: 'New Zealand', ja: 'ニュージーランド' }, zone: 'Pacific/Chatham' },
  { id: 'honolulu', city: { ko: '호놀룰루', en: 'Honolulu', ja: 'ホノルル' }, country: { ko: '미국', en: 'United States', ja: '米国' }, zone: 'Pacific/Honolulu' },
  { id: 'sao-paulo', city: { ko: '상파울루', en: 'São Paulo', ja: 'サンパウロ' }, country: { ko: '브라질', en: 'Brazil', ja: 'ブラジル' }, zone: 'America/Sao_Paulo' },
  { id: 'mexico-city', city: { ko: '멕시코시티', en: 'Mexico City', ja: 'メキシコシティ' }, country: { ko: '멕시코', en: 'Mexico', ja: 'メキシコ' }, zone: 'America/Mexico_City' },
  { id: 'toronto', city: { ko: '토론토', en: 'Toronto', ja: 'トロント' }, country: { ko: '캐나다', en: 'Canada', ja: 'カナダ' }, zone: 'America/Toronto' },
  { id: 'vancouver', city: { ko: '밴쿠버', en: 'Vancouver', ja: 'バンクーバー' }, country: { ko: '캐나다', en: 'Canada', ja: 'カナダ' }, zone: 'America/Vancouver' },
  { id: 'johannesburg', city: { ko: '요하네스버그', en: 'Johannesburg', ja: 'ヨハネスブルグ' }, country: { ko: '남아프리카공화국', en: 'South Africa', ja: '南アフリカ' }, zone: 'Africa/Johannesburg' },
  { id: 'cairo', city: { ko: '카이로', en: 'Cairo', ja: 'カイロ' }, country: { ko: '이집트', en: 'Egypt', ja: 'エジプト' }, zone: 'Africa/Cairo' },
] as const;
