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

      <section className="toolbox-signature-section"><p>{copy.signature.line1}</p><h2>{copy.signature.line2}</h2><span>{copy.signature.description}</span></section>

      <section className="toolbox-faq-section">
        <div className="toolbox-faq-head"><p>{copy.faq.eyebrow}</p><h2>{copy.faq.title}</h2></div>
        <ToolboxFaqList items={copy.faq.items} initialCount={5} moreLabel={copy.faq.more} collapseLabel={copy.faq.collapse} />
      </section>

      <footer className="toolbox-footer"><Link href="/">{copy.footer.home}</Link><span>TOOLBOX · 2026</span><div><Link href="https://fixlgs.com/privacy">{copy.footer.privacy}</Link><Link href="https://fixlgs.com/terms">{copy.footer.terms}</Link><Link href={`https://fixlgs.com/contact?app=${encodeURIComponent('FIXLGS TOOLBOX')}`}>{copy.footer.contact}</Link></div></footer>
    </main>
  );
}
