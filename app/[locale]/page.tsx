import type { Metadata } from 'next';
import Link from 'next/link';
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { notFound } from 'next/navigation';
import LanguageSwitcher from '@/components/toolbox/LanguageSwitcher';
import ThemeToggle from '@/components/toolbox/ThemeToggle';
import { categories as siteCategories, tool001Slug, tool028Slug, tool036Slug, tool045Slug, tool055Slug, tool066Slug } from '@/lib/site';
import { ToolboxHomeHero } from '@/components/toolbox-home-hero';

type Locale = 'ko' | 'en' | 'ja';

type Copy = {
  metadata: { title: string; description: string };
  nav: [string, string];
  hero: { eyebrow: string; title1: string; title2: string; description: string };
  search: { label: string; placeholder: string; quick: string; links: [string, string, string] };
  popular: { eyebrow: string; title: string; note: string; status: string };
  categories: { eyebrow: string; title: string };
  signature: { line1: string; line2: string; description: string };
  footer: { home: string; privacy: string; terms: string; contact: string };
  faq: { eyebrow: string; title: string; items: [string, string][]; more: string; collapse: string };
  trust: { note: string; privacy: string; contact: string };
};

const copies: Record<Locale, Copy> = {
  ko: {
    metadata: { title: '무료 웹도구 TOOLBOX | FIXLGS', description: '설치와 가입 없이 바로 사용할 수 있는 빠르고 간단한 무료 웹도구 플랫폼입니다.' },
    nav: ['주요 도구', '카테고리'],
    hero: { eyebrow: 'FAST · SIMPLE · PRIVATE', title1: '필요한 순간,', title2: '가장 빠른 도구.', description: '설치와 가입 없이, 찾고 바로 실행하는 웹도구 플랫폼.' },
    search: { label: '도구 검색', placeholder: '필요한 도구를 검색하세요', quick: '인기 검색', links: ['이미지 압축', 'PDF 합치기', '날짜 계산'] },
    popular: { eyebrow: 'POPULAR TOOLS', title: '가장 많이 찾는 도구', note: '도구는 순차적으로 추가됩니다.', status: '준비 중' },
    categories: { eyebrow: 'CATEGORIES', title: '도구를 목적별로 찾기' },
    signature: { line1: 'SIMPLE TO USE.', line2: 'PRIVATE BY DESIGN.', description: '가능한 작업은 브라우저 안에서 처리하고, 사용자의 흐름을 방해하지 않습니다.' },
    footer: { home: 'FIXLGS 홈', privacy: '개인정보처리방침', terms: '이용약관', contact: '문의하기' },
    faq: { eyebrow: 'FAQ', title: '자주 묻는 질문', more: 'FAQ 더보기', collapse: 'FAQ 접기', items: [['TOOLBOX는 무료인가요?', '현재 제공되는 기본 웹도구는 무료로 사용할 수 있습니다.'], ['설치나 회원가입이 필요한가요?', '아니요. TOOLBOX는 별도 설치나 회원가입 없이 브라우저에서 바로 사용할 수 있습니다.'], ['업로드한 파일은 어디에서 처리되나요?', '가능한 도구는 브라우저 내부에서 처리하며, 각 도구 페이지에서 처리 방식을 안내합니다.'], ['모바일에서도 사용할 수 있나요?', '네. 휴대전화와 태블릿에서도 사용할 수 있도록 반응형 화면을 제공합니다.'], ['어떤 브라우저를 지원하나요?', '최신 Chrome, Edge, Safari, Firefox 사용을 권장합니다.'], ['파일 크기나 사용 횟수 제한이 있나요?', '제한은 도구마다 다를 수 있으며 각 도구 화면에서 별도로 안내합니다.'], ['새로운 도구는 계속 추가되나요?', '네. 카테고리별 우선순위에 따라 새로운 도구를 순차적으로 추가합니다.'], ['광고는 왜 표시되나요?', '무료 도구 운영과 지속적인 기능 개선을 위해 일부 페이지에 광고가 표시될 수 있습니다.'], ['문제가 발생하거나 기능을 제안하려면 어떻게 하나요?', '페이지 하단의 문의하기를 통해 오류 내용이나 원하는 기능을 전달할 수 있습니다.']] },
    trust: { note: '빠르고 단순하게, 가능한 작업은 브라우저 안에서 처리합니다.', privacy: '개인정보처리방침', contact: '문의하기' },
  },
  en: {
    metadata: { title: 'Free Online Tools | FIXLGS TOOLBOX', description: 'Fast, simple, privacy-friendly online tools you can use without installing software or creating an account.' },
    nav: ['Featured Tools', 'Categories'],
    hero: { eyebrow: 'FAST · SIMPLE · PRIVATE', title1: 'The right tool,', title2: 'right when you need it.', description: 'Find and use practical web tools instantly—no installation or sign-up.' },
    search: { label: 'Search tools', placeholder: 'Search for the tool you need', quick: 'Popular searches', links: ['Image compressor', 'Merge PDF', 'Date calculator'] },
    popular: { eyebrow: 'POPULAR TOOLS', title: 'Most-used tools', note: 'New tools are being added step by step.', status: 'Coming soon' },
    categories: { eyebrow: 'CATEGORIES', title: 'Find tools by purpose' },
    signature: { line1: 'SIMPLE TO USE.', line2: 'PRIVATE BY DESIGN.', description: 'Whenever possible, processing stays in your browser without interrupting your workflow.' },
    footer: { home: 'FIXLGS HOME', privacy: 'Privacy Policy', terms: 'Terms of Use', contact: 'Contact' },
    faq: { eyebrow: 'FAQ', title: 'Frequently asked questions', more: 'View more FAQs', collapse: 'Show fewer FAQs', items: [['Is TOOLBOX free to use?', 'The basic web tools currently provided are free to use.'], ['Do I need to install anything or create an account?', 'No. TOOLBOX runs directly in your browser without installation or registration.'], ['Where are uploaded files processed?', 'Whenever possible, processing stays in your browser. Each tool page explains its processing method.'], ['Can I use the tools on mobile devices?', 'Yes. The interface is responsive and supports phones and tablets.'], ['Which browsers are supported?', 'We recommend the latest versions of Chrome, Edge, Safari, or Firefox.'], ['Are there file-size or usage limits?', 'Limits may vary by tool and are explained on the individual tool page.'], ['Will more tools be added?', 'Yes. New tools are added step by step across each category.'], ['Why are advertisements displayed?', 'Some pages may show ads to support free operation and continued improvements.'], ['How can I report a problem or suggest a feature?', 'Use the contact link in the footer to send details about an issue or feature request.']] },
    trust: { note: 'Fast, simple, and processed in your browser whenever possible.', privacy: 'Privacy Policy', contact: 'Contact' },
  },
  ja: {
    metadata: { title: '無料Webツール | FIXLGS TOOLBOX', description: 'インストールや会員登録なしですぐに使える、シンプルで実用的な無料Webツール集です。' },
    nav: ['主要ツール', 'カテゴリー'],
    hero: { eyebrow: 'FAST · SIMPLE · PRIVATE', title1: '必要なときに、', title2: 'すぐ使えるツール。', description: 'インストールも会員登録も不要。必要なツールを見つけて、そのまますぐに使えます。' },
    search: { label: 'ツールを検索', placeholder: '必要なツールを検索', quick: '人気の検索ワード', links: ['画像圧縮', 'PDF結合', '日付計算'] },
    popular: { eyebrow: 'POPULAR TOOLS', title: '人気のツール', note: 'ツールは順次追加されます。', status: '準備中' },
    categories: { eyebrow: 'CATEGORIES', title: '目的からツールを探す' },
    signature: { line1: 'SIMPLE TO USE.', line2: 'PRIVATE BY DESIGN.', description: '可能な処理はブラウザ内で行い、作業の流れやプライバシーをできる限り守ります。' },
    footer: { home: 'FIXLGS ホーム', privacy: 'プライバシーポリシー', terms: '利用規約', contact: 'お問い合わせ' },
    faq: { eyebrow: 'FAQ', title: 'よくある質問', more: 'FAQをもっと見る', collapse: 'FAQを閉じる', items: [['TOOLBOXは無料ですか？', '現在提供している基本的なウェブツールは無料で利用できます。'], ['インストールや会員登録は必要ですか？', 'いいえ。インストールや会員登録なしでブラウザからすぐに利用できます。'], ['アップロードしたファイルはどこで処理されますか？', '可能なツールはブラウザ内で処理し、各ツールページで処理方法を案内します。'], ['モバイルでも利用できますか？', 'はい。スマートフォンやタブレットに対応した画面を提供します。'], ['どのブラウザに対応していますか？', '最新のChrome、Edge、Safari、Firefoxを推奨します。'], ['ファイルサイズや利用回数に制限はありますか？', '制限はツールごとに異なる場合があり、各ツール画面で案内します。'], ['新しいツールは追加されますか？', 'はい。カテゴリーごとの優先順位に沿って順次追加します。'], ['広告が表示されるのはなぜですか？', '無料運営と継続的な改善のため、一部のページに広告が表示される場合があります。'], ['不具合報告や機能提案はどこからできますか？', 'フッターのお問い合わせから不具合や希望する機能を送信できます。']] },
    trust: { note: 'すばやく、シンプルに。可能な処理はブラウザ内で行います。', privacy: 'プライバシーポリシー', contact: 'お問い合わせ' },
  },
};

const popularTools: Record<Locale, Array<{ name: string; meta: string; desc: string; mark: string }>> = {
  ko: [
    { name: '이미지 압축', meta: 'IMAGE', desc: '화질 저하를 줄이고 파일 크기를 가볍게', mark: '72%' },
    { name: 'PDF 합치기', meta: 'PDF', desc: '여러 PDF를 원하는 순서로 하나로', mark: 'PDF' },
    { name: '글자 수 세기', meta: 'TEXT', desc: '공백 포함·제외 글자 수를 즉시 확인', mark: '1,284' },
    { name: '날짜 계산기', meta: 'DATE', desc: '두 날짜 사이 기간과 기념일 계산', mark: 'D+365' },
    { name: '평수 계산기', meta: 'CALC', desc: '제곱미터와 평을 빠르게 변환', mark: '32평' },
    { name: '부가세 계산기', meta: 'BUSINESS', desc: '공급가액과 부가세를 간단하게 계산', mark: '10%' },
  ],
  en: [
    { name: 'Image Compressor', meta: 'IMAGE', desc: 'Reduce file size while preserving visual quality', mark: '72%' },
    { name: 'Merge PDF', meta: 'PDF', desc: 'Combine multiple PDFs in the order you choose', mark: 'PDF' },
    { name: 'Character Counter', meta: 'TEXT', desc: 'Count characters, words, lines, and spaces instantly', mark: '1,284' },
    { name: 'Date Calculator', meta: 'DATE', desc: 'Calculate date differences and important dates', mark: 'D+365' },
    { name: 'Area Converter', meta: 'CALC', desc: 'Convert square meters and area units quickly', mark: '105.8 m²' },
    { name: 'VAT Calculator', meta: 'BUSINESS', desc: 'Calculate net price, VAT, and total price', mark: '10%' },
  ],
  ja: [
    { name: '画像圧縮', meta: 'IMAGE', desc: '画質を保ちながらファイルサイズを軽量化', mark: '72%' },
    { name: 'PDF結合', meta: 'PDF', desc: '複数のPDFを希望の順番でひとつに結合', mark: 'PDF' },
    { name: '文字数カウント', meta: 'TEXT', desc: '文字数・単語数・行数・空白数をすぐに確認', mark: '1,284' },
    { name: '日付計算', meta: 'DATE', desc: '2つの日付の差や指定日までの日数を計算', mark: 'D+365' },
    { name: '面積換算', meta: 'CALC', desc: '平方メートルと坪をすばやく換算', mark: '32坪' },
    { name: '消費税計算', meta: 'BUSINESS', desc: '税抜価格・消費税・税込価格を簡単に計算', mark: '10%' },
  ],
};

const categoryBase = [
  ['01', 'IMAGE CONVERT'], ['02', 'IMAGE EDIT'], ['03', 'CONTENT IMAGE'], ['04', 'PDF'], ['05', 'TEXT'], ['06', 'DATE & TIME'], ['07', 'UNIT & CALCULATOR'], ['08', 'BUSINESS & FINANCE'], ['09', 'REAL ESTATE & BUILD'], ['10', 'QR · DESIGN · DEV · SEO'], ['11', 'DOCUMENT · LIFE · HEALTH · RANDOM'],
] as const;

const categoryText: Record<Locale, Array<[string, string]>> = {
  ko: [
    ['이미지 변환·최적화', '형식 변환 · 압축 · 크기 변경 · 웹 최적화'], ['이미지 편집', '자르기 · 색상 보정 · 모자이크 · 합치기 · 워터마크'], ['콘텐츠 이미지 제작', '썸네일 · 배너 · SNS 이미지 · 앱 아이콘 · 증명사진'], ['PDF 도구', '변환 · 합치기 · 분할 · 페이지 정리 · 압축 · 서명'], ['텍스트 도구', '글자 수 · 공백 정리 · 형식 변환 · 비교 · 키워드 분석'], ['날짜·시간 도구', '날짜 차이 · 디데이 · 나이 · 영업일 · 세계시간 · 타이머'], ['단위·일반 계산기', '단위 변환 · 퍼센트 · 할인 · 비율 · 평균 · 분수'], ['사업·금융 계산기', '부가세 · 마진 · 정산 · 급여 · 대출 · 투자 · 임대수익'], ['부동산·건축 계산기', '평수 · 건폐율 · 시공면적 · 자재 수량 · 지붕 · 계단'], ['QR·디자인·개발자·SEO', 'QR · 색상 · JSON · 코드 · 인코딩 · 메타태그 · 사이트맵'], ['문서·생활·건강·랜덤', '문서 생성 · 생활 계산 · 건강 참고 · 추첨 · 랜덤 도구'],
  ],
  en: [
    ['Image Conversion & Optimization', 'Format conversion · compression · resizing · web optimization'], ['Image Editing', 'Crop · color correction · blur · merge · watermark'], ['Content Image Creation', 'Thumbnails · banners · social images · app icons · ID photos'], ['PDF Tools', 'Convert · merge · split · organize · compress · sign'], ['Text Tools', 'Character count · cleanup · formatting · comparison · keyword analysis'], ['Date & Time Tools', 'Date difference · D-day · age · business days · world time · timer'], ['Unit & General Calculators', 'Unit conversion · percentages · discounts · ratios · averages · fractions'], ['Business & Finance Calculators', 'VAT · margin · settlement · salary · loans · investing · rental yield'], ['Real Estate & Building Calculators', 'Area · coverage ratio · construction area · materials · roofing · stairs'], ['QR, Design, Developer & SEO', 'QR · color · JSON · code · encoding · meta tags · sitemap'], ['Documents, Life, Health & Random', 'Document creation · life calculators · health references · draws · random tools'],
  ],
  ja: [
    ['画像変換・最適化', '形式変換・圧縮・サイズ変更・Web最適化'], ['画像編集', 'トリミング・色補正・モザイク・結合・透かし'], ['コンテンツ画像作成', 'サムネイル・バナー・SNS画像・アプリアイコン・証明写真'], ['PDFツール', '変換・結合・分割・ページ整理・圧縮・署名'], ['テキストツール', '文字数・空白整理・形式変換・比較・キーワード分析'], ['日付・時間ツール', '日数計算・カウントダウン・年齢・営業日・世界時計・タイマー'], ['単位換算・一般計算', '単位換算・パーセント・割引・比率・平均・分数'], ['ビジネス・金融計算', '消費税・利益率・精算・給与・ローン・投資・賃貸利回り'], ['不動産・建築計算', '面積・建ぺい率・施工面積・資材数量・屋根・階段'], ['QR・デザイン・開発・SEO', 'QR・カラー・JSON・コード・エンコード・メタタグ・サイトマップ'], ['文書・生活・健康・ランダム', '文書作成・生活計算・健康の目安・抽選・ランダムツール'],
  ],
};


const editorialCopies: Record<Locale, {
  about: { eyebrow: string; title: string; paragraphs: [string, string] };
  guides: { eyebrow: string; title: string; note: string; read: string; items: Array<{ number: string; tag: string; title: string; description: string; href: string }> };
  principles: { eyebrow: string; title: string; items: Array<{ number: string; title: string; description: string }> };
}> = {
  ko: {
    about: {
      eyebrow: 'ABOUT WEB TOOLS',
      title: '웹도구는 작지만 반복 작업을 크게 줄여줍니다.',
      paragraphs: [
        '파일 형식을 한 번 바꾸거나, 이미지 용량을 줄이거나, 날짜 차이를 계산하기 위해 매번 프로그램을 설치하는 것은 번거롭습니다. TOOLBOX는 이런 단발성·반복성 작업을 브라우저에서 빠르게 처리할 수 있도록 구성합니다.',
        '편리함만큼 중요한 것은 결과의 기준입니다. 파일 처리 방식, 입력 단위, 반올림 기준처럼 결과에 영향을 주는 요소를 이해할 수 있도록 각 도구의 사용법·주의사항·FAQ와 관련 가이드를 함께 제공합니다.',
      ],
    },
    guides: {
      eyebrow: 'PRACTICAL GUIDES',
      title: '도구를 쓰기 전에 알아두면 좋은 기준',
      note: '파일 형식, 개인정보, 압축, 날짜·단위와 계산 결과를 이해하는 데 필요한 내용을 정리했습니다.',
      read: '가이드 자세히 읽기',
      items: [
        { number: '01', tag: 'FILE PRIVACY', title: '웹도구를 사용할 때 파일 처리 방식을 확인해야 하는 이유', description: '브라우저 처리와 서버 전송의 차이, 민감한 파일을 다룰 때 확인할 기준을 정리합니다.', href: 'https://fixlgs.com/guides/web-tool-file-privacy' },
        { number: '02', tag: 'IMAGE FORMAT', title: 'JPG · PNG · WEBP는 무엇이 다를까요?', description: '사진, 투명 배경, 웹 게시용 이미지에서 자주 쓰는 형식의 특징과 선택 기준을 설명합니다.', href: 'https://fixlgs.com/guides/jpg-png-webp-guide' },
        { number: '03', tag: 'IMAGE OPTIMIZE', title: '이미지 압축은 용량과 화질의 균형이 중요합니다', description: '웹 업로드와 보관용 이미지에서 압축 수준을 정할 때 확인할 기준을 설명합니다.', href: 'https://fixlgs.com/guides/image-compression-quality-guide' },
        { number: '04', tag: 'UNIT & ROUNDING', title: '평과 제곱미터 변환에서 생기는 반올림 차이', description: '면적 단위 환산에서 값이 조금씩 달라지는 이유와 확인 기준을 정리합니다.', href: 'https://fixlgs.com/guides/pyeong-square-meter-rounding-guide' },
        { number: '05', tag: 'CALCULATOR GUIDE', title: '온라인 계산기 결과를 보기 전에 확인할 기준', description: '퍼센트, 세금, 금융 계산에서 입력 조건과 기준일을 확인하는 방법을 설명합니다.', href: 'https://fixlgs.com/guides/online-calculator-checklist' },
        { number: '06', tag: 'DATE & TIME', title: '날짜·시간 계산은 포함 기준을 먼저 확인하세요', description: '날짜 차이, 디데이, 영업일 계산에서 결과가 달라지는 대표 기준을 정리합니다.', href: 'https://fixlgs.com/guides/date-time-calculator-guide' },
        { number: '07', tag: 'UNIT CALCULATOR', title: '단위 변환과 일반 계산기를 정확하게 사용하는 방법', description: '입력 단위와 변환 기준, 결과를 비교할 때 놓치기 쉬운 부분을 설명합니다.', href: 'https://fixlgs.com/guides/unit-general-calculator-guide' },
        { number: '08', tag: 'BUSINESS & FINANCE', title: '사업·금융 계산기는 기준일과 조건을 함께 봐야 합니다', description: '부가세, 마진, 대출, 투자 계산에서 결과와 함께 확인해야 할 조건을 정리합니다.', href: 'https://fixlgs.com/guides/business-finance-calculator-guide' },
      ],
    },
    principles: {
      eyebrow: 'HOW WE BUILD',
      title: '도구보다 먼저 사용 경험을 정리합니다.',
      items: [
        { number: '01', title: '목적이 분명한 기능', description: '하나의 도구가 해결해야 할 작업을 명확하게 정하고 불필요한 절차를 줄입니다.' },
        { number: '02', title: '브라우저 중심의 간단한 접근', description: '가능한 작업은 설치나 가입 없이 바로 사용할 수 있도록 구성합니다.' },
        { number: '03', title: '결과와 함께 읽을 정보', description: '사용법, 주의사항, FAQ와 관련 가이드를 함께 제공해 결과를 이해하기 쉽게 만듭니다.' },
      ],
    },
  },
  en: {
    about: {
      eyebrow: 'ABOUT WEB TOOLS',
      title: 'Small web tools can remove a lot of repetitive work.',
      paragraphs: [
        'Installing software just to convert one file, reduce an image, or calculate a date difference is often unnecessary. TOOLBOX is designed for quick, repeatable tasks that can be handled directly in the browser.',
        'Convenience is only useful when the result is understandable. Each tool is paired with usage notes, cautions, FAQs, and practical guidance on processing methods, units, rounding, and other factors that can affect the outcome.',
      ],
    },
    guides: {
      eyebrow: 'PRACTICAL GUIDES', title: 'Useful checks before you use a tool', note: 'Practical notes on file formats, privacy, compression, dates, units, and calculator results.', read: 'Read the full guide',
      items: [
        { number: '01', tag: 'FILE PRIVACY', title: 'Why file processing methods matter', description: 'Understand browser-side processing, server transfers, and basic checks for sensitive files.', href: 'https://fixlgs.com/guides/web-tool-file-privacy' },
        { number: '02', tag: 'IMAGE FORMAT', title: 'Choosing between JPG, PNG, and WEBP', description: 'A practical guide to formats for photos, transparency, and web publishing.', href: 'https://fixlgs.com/guides/jpg-png-webp-guide' },
        { number: '03', tag: 'IMAGE OPTIMIZE', title: 'Balance image compression and quality', description: 'What to compare when reducing images for websites, documents, or storage.', href: 'https://fixlgs.com/guides/image-compression-quality-guide' },
        { number: '04', tag: 'UNIT & ROUNDING', title: 'Rounding differences in area conversion', description: 'Why converted values can differ slightly and how to check the calculation basis.', href: 'https://fixlgs.com/guides/pyeong-square-meter-rounding-guide' },
        { number: '05', tag: 'CALCULATOR GUIDE', title: 'Checks before trusting calculator results', description: 'Review inputs, dates, rounding, and conditions in percentage and finance calculations.', href: 'https://fixlgs.com/guides/online-calculator-checklist' },
        { number: '06', tag: 'DATE & TIME', title: 'Check inclusion rules in date calculations', description: 'Common reasons date differences, countdowns, and business-day results can vary.', href: 'https://fixlgs.com/guides/date-time-calculator-guide' },
        { number: '07', tag: 'UNIT CALCULATOR', title: 'Use unit converters with clear input standards', description: 'How to check units, conversion bases, and comparison conditions.', href: 'https://fixlgs.com/guides/unit-general-calculator-guide' },
        { number: '08', tag: 'BUSINESS & FINANCE', title: 'Business calculators depend on conditions and dates', description: 'What to verify when using VAT, margin, loan, and investment calculators.', href: 'https://fixlgs.com/guides/business-finance-calculator-guide' },
      ],
    },
    principles: {
      eyebrow: 'HOW WE BUILD', title: 'We organize the experience before adding features.',
      items: [
        { number: '01', title: 'A clear purpose', description: 'Each tool focuses on one practical task and removes unnecessary steps.' },
        { number: '02', title: 'Browser-first access', description: 'Where possible, tools work without installation or account creation.' },
        { number: '03', title: 'Context with every result', description: 'Usage notes, cautions, FAQs, and related guides help users interpret results.' },
      ],
    },
  },
  ja: {
    about: {
      eyebrow: 'ABOUT WEB TOOLS',
      title: '小さなウェブツールが、繰り返し作業を大きく減らします。',
      paragraphs: [
        'ファイル形式を一度変える、画像容量を減らす、日付の差を計算するためだけに毎回ソフトをインストールする必要はありません。TOOLBOXは、こうした単発・反復作業をブラウザですばやく処理できるように設計しています。',
        '便利さと同じくらい、結果の基準を理解することも重要です。処理方法、入力単位、丸め方など結果に影響する要素を確認できるよう、使い方・注意事項・FAQ・関連ガイドを用意しています。',
      ],
    },
    guides: {
      eyebrow: 'PRACTICAL GUIDES', title: 'ツールを使う前に知っておきたい基準', note: 'ファイル形式、プライバシー、圧縮、日付・単位、計算結果を理解するための実用ガイドです。', read: 'ガイドを詳しく読む',
      items: [
        { number: '01', tag: 'FILE PRIVACY', title: 'ファイルの処理方法を確認する理由', description: 'ブラウザ処理とサーバー送信の違い、機密ファイルで確認すべき基準を整理します。', href: 'https://fixlgs.com/guides/web-tool-file-privacy' },
        { number: '02', tag: 'IMAGE FORMAT', title: 'JPG・PNG・WEBPの選び方', description: '写真、透過背景、Web掲載で使う画像形式の特徴と選択基準を説明します。', href: 'https://fixlgs.com/guides/jpg-png-webp-guide' },
        { number: '03', tag: 'IMAGE OPTIMIZE', title: '画像圧縮は容量と画質のバランスが重要です', description: 'Web掲載や保存用画像の圧縮レベルを決める際の確認ポイントです。', href: 'https://fixlgs.com/guides/image-compression-quality-guide' },
        { number: '04', tag: 'UNIT & ROUNDING', title: '面積換算で生じる丸め誤差', description: '換算値が少しずつ異なる理由と計算基準の確認方法を整理します。', href: 'https://fixlgs.com/guides/pyeong-square-meter-rounding-guide' },
        { number: '05', tag: 'CALCULATOR GUIDE', title: '計算結果を見る前に確認したいこと', description: '割合、税金、金融計算で入力条件や基準日を確認する方法です。', href: 'https://fixlgs.com/guides/online-calculator-checklist' },
        { number: '06', tag: 'DATE & TIME', title: '日付計算では含め方の基準を確認', description: '日数差、カウントダウン、営業日計算で結果が変わる代表的な基準です。', href: 'https://fixlgs.com/guides/date-time-calculator-guide' },
        { number: '07', tag: 'UNIT CALCULATOR', title: '単位換算を正しく使うための基準', description: '入力単位、換算基準、比較条件で見落としやすい点を説明します。', href: 'https://fixlgs.com/guides/unit-general-calculator-guide' },
        { number: '08', tag: 'BUSINESS & FINANCE', title: 'ビジネス計算は条件と基準日も確認', description: '税、利益率、ローン、投資計算で結果と一緒に確認すべき条件です。', href: 'https://fixlgs.com/guides/business-finance-calculator-guide' },
      ],
    },
    principles: {
      eyebrow: 'HOW WE BUILD', title: '機能より先に、使い方を整理します。',
      items: [
        { number: '01', title: '目的が明確な機能', description: 'ひとつのツールが解決する作業を明確にし、不要な手順を減らします。' },
        { number: '02', title: 'ブラウザ中心のシンプルなアクセス', description: '可能な作業はインストールや会員登録なしですぐ使えるようにします。' },
        { number: '03', title: '結果と一緒に読む情報', description: '使い方、注意事項、FAQ、関連ガイドを用意し、結果を理解しやすくします。' },
      ],
    },
  },
};

function isLocale(value: string): value is Locale {
  return value === 'ko' || value === 'en' || value === 'ja';
}

export function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'en' }, { locale: 'ja' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = copies[locale];
  const canonical = `https://toolbox.fixlgs.com/${locale}`;
  return {
    title: copy.metadata.title,
    description: copy.metadata.description,
    alternates: {
      canonical,
      languages: {
        'ko-KR': 'https://toolbox.fixlgs.com/ko',
        'en': 'https://toolbox.fixlgs.com/en',
        'ja-JP': 'https://toolbox.fixlgs.com/ja',
        'x-default': 'https://toolbox.fixlgs.com/ko',
      },
    },
  };
}

export default async function LocalizedToolboxPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;
  const copy = copies[locale];
  const tools = popularTools[locale];
  const categories = categoryBase.slice(0, 9).map(([index, name], i) => ({ index, name, local: categoryText[locale][i][0], desc: categoryText[locale][i][1] }));

  return (
    <main className={`toolbox-site toolbox-locale-${locale}`}>
      <header className="toolbox-header">
        <Link href="/" className="toolbox-wordmark" aria-label={copy.footer.home}>
          <strong>FIXLGS</strong><span>TOOLBOX</span>
        </Link>
        <nav className="toolbox-nav" aria-label={`${copy.nav[0]} / ${copy.nav[1]}`}>
          <a href="#popular">{copy.nav[0]}</a>
          <a href="#categories">{copy.nav[1]}</a>
          <ThemeToggle locale={locale} />
        </nav>
        <div className="toolbox-utilities"><LanguageSwitcher locale={locale} /></div>
      </header>

      <ToolboxHomeHero locale={locale} hero={copy.hero} search={copy.search} />

      <section id="popular" className="toolbox-section toolbox-popular-section">
        <div className="toolbox-section-head"><div><p>{copy.popular.eyebrow}</p><h2>{copy.popular.title}</h2></div><span>{copy.popular.note}</span></div>
        <div className="toolbox-tool-grid">
          {tools.map((tool, index) => {
            const popularSlugs = [tool001Slug, tool028Slug, tool036Slug, tool045Slug, tool055Slug, tool066Slug] as const;
            const content = (
              <>
                <div className="toolbox-tool-card-top"><span>{tool.meta}</span><b>{String(index + 1).padStart(2, '0')}</b></div>
                <strong className="toolbox-tool-mark">{tool.mark}</strong><div><h3>{tool.name}</h3><p>{tool.desc}</p></div>
                <div className="toolbox-tool-card-action"><span>{tool.name}</span><i aria-hidden="true">↗</i></div>
              </>
            );
            return (
              <Link className={`toolbox-tool-card ${index === 0 ? 'is-featured' : ''}`.trim()} href={`/${locale}/${popularSlugs[index]}`} key={tool.name}>{content}</Link>
            );
          })}
        </div>
      </section>

      <section id="categories" className="toolbox-section toolbox-category-section">
        <div className="toolbox-section-head"><div><p>{copy.categories.eyebrow}</p><h2>{copy.categories.title}</h2></div></div>
        <div className="toolbox-category-list">
          {categories.map((category, index) => (
            <Link className="toolbox-category-item" href={`/${locale}/category/${siteCategories[index].slug}`} key={category.name}>
              <span>{category.index}</span><div><strong>{category.name}</strong><small>{category.local}</small></div><p>{category.desc}</p><i aria-hidden="true">↗</i>
            </Link>
          ))}
        </div>
      </section>

      <section className="toolbox-section toolbox-editorial-about">
        <div className="toolbox-section-head"><div><p>{editorialCopies[locale].about.eyebrow}</p><h2>{editorialCopies[locale].about.title}</h2></div></div>
        <div className="toolbox-editorial-about-copy">
          {editorialCopies[locale].about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>

      <section className="toolbox-section toolbox-editorial-guides">
        <div className="toolbox-section-head"><div><p>{editorialCopies[locale].guides.eyebrow}</p><h2>{editorialCopies[locale].guides.title}</h2></div><span>{editorialCopies[locale].guides.note}</span></div>
        <div className="toolbox-editorial-guide-grid">
          {editorialCopies[locale].guides.items.map((guide) => (
            <a className="toolbox-editorial-guide-card" href={guide.href} key={guide.number}>
              <div><span>{guide.number}</span><b>{guide.tag}</b></div>
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>
              <strong>{editorialCopies[locale].guides.read} <i aria-hidden="true">↗</i></strong>
            </a>
          ))}
        </div>
      </section>

      <section className="toolbox-editorial-principles">
        <div className="toolbox-editorial-principles-head"><p>{editorialCopies[locale].principles.eyebrow}</p><h2>{editorialCopies[locale].principles.title}</h2></div>
        <div className="toolbox-editorial-principle-list">
          {editorialCopies[locale].principles.items.map((item) => (
            <article key={item.number}><b>{item.number}</b><div><h3>{item.title}</h3><p>{item.description}</p></div></article>
          ))}
        </div>
      </section>

      <section className="toolbox-signature-section"><p>{copy.signature.line1}</p><h2>{copy.signature.line2}</h2><span>{copy.signature.description}</span></section>

      <section className="toolbox-faq-section">
        <div className="toolbox-faq-head"><p>{copy.faq.eyebrow}</p><h2>{copy.faq.title}</h2></div>
        <ToolboxFaqList items={copy.faq.items} initialCount={5} moreLabel={copy.faq.more} collapseLabel={copy.faq.collapse} />
      </section>

      <footer className="toolbox-footer"><Link href="/">{copy.footer.home}</Link><span>TOOLBOX · 2026</span><div><Link href="https://fixlgs.com/privacy">{copy.footer.privacy}</Link><Link href="https://fixlgs.com/terms">{copy.footer.terms}</Link><Link href={`https://fixlgs.com/contact?app=${encodeURIComponent('FIXLGS TOOLBOX')}`}>{copy.footer.contact}</Link></div></footer>
    </main>
  );
}
