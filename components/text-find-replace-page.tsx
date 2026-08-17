import Link from "next/link";
import type { Locale } from "@/lib/site";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import { TextFindReplaceTool } from "@/components/text-find-replace-tool";

const copy={
  ko:{back:"텍스트 도구",title:"텍스트 찾기·바꾸기",desc:"한 번에 하나 또는 여러 검색어를 찾아 원본 기준으로 동시에 바꾸고 총 변경 횟수와 규칙별 횟수를 확인하세요.",next:"다음 작업",related:"관련 도구",how:"사용 방법",faq:"자주 묻는 질문",steps:["원문을 입력하거나 붙여넣고 필요한 만큼 찾기·바꾸기 규칙을 추가합니다.","대소문자 구분 여부를 선택합니다.","찾기·바꾸기를 실행하면 모든 규칙을 원본 텍스트 기준으로 계산해 결과를 만듭니다.","총 변경 횟수와 규칙별 횟수를 확인하고 결과를 복사합니다.","전체 지우기로 원문·규칙·결과·상태를 초기화합니다."],notes:["정규식이 아니라 literal 문자열 검색입니다. 점·별표·대괄호 등도 그대로 찾습니다.","동일 find 값은 중복 규칙으로 실행 전에 차단합니다.","겹치는 검색어는 긴 검색어를 먼저 확정하고, 길이가 같으면 앞 규칙을 우선합니다.","replacement가 다른 find 값을 포함해도 원문 기준 동시 치환이므로 결과에서 다시 검색하지 않습니다.","상한: 원문 1,000,000자 · 규칙 100개 · find 1,000자 · replacement 10,000자 · 결과 5,000,000자."],faqs:[["여러 규칙이 서로 영향을 주나요?","아니요. 모든 검색 후보를 원문에서 먼저 계산한 뒤 한 번에 적용하므로 연쇄치환이 발생하지 않습니다."],["정규식을 사용할 수 있나요?","아니요. 042는 literal 문자열 찾기·바꾸기 도구입니다."],["대소문자를 무시하면 한글도 정상 처리되나요?","한글·일본어처럼 대소문자가 없는 문자는 그대로 비교되고 영문은 고정 case-folding 정책에 따라 비교합니다."],["같은 검색어를 두 번 넣을 수 있나요?","아니요. 동일 find 값은 선택한 대소문자 정책 기준으로 실행 전에 차단합니다."],["결과가 원문에 자동으로 덮어써지나요?","아니요. 결과 영역을 별도로 만들며 원문은 유지합니다."],["텍스트가 서버로 전송되나요?","아니요. 원문·검색어·replacement·결과는 브라우저 메모리에서만 처리합니다."]]},
  en:{back:"Text Tools",title:"Find & Replace Text",desc:"Find one or many search terms and replace them simultaneously from the original text, with total and per-rule counts.",next:"Next work",related:"Related tools",how:"How to use",faq:"Frequently asked questions",steps:["Enter or paste the original text and add as many find/replace rules as needed.","Choose whether matching should be case-sensitive.","Run the operation; all matches are resolved against the original text before replacements are applied.","Review the total and per-rule replacement counts, then copy the result.","Use Clear all to reset the original text, rules, result, and status."],notes:["Matching is literal, not regex. Characters such as . * [ ] are searched as plain text.","The same find value cannot be used twice because it would make the result ambiguous.","When search terms overlap, the longer term wins; equal lengths use the earlier rule.","A replacement that contains another find term is not searched again because matching is based on the original text.","Limits: 1,000,000 input characters · 100 rules · 1,000 find characters · 10,000 replacement characters · 5,000,000 result characters."],faqs:[["Can rules affect one another?","No. All match candidates are calculated from the original text first, so chained replacement does not occur."],["Does it support regular expressions?","No. TOOL042 uses literal string matching."],["How does case-insensitive matching work?","English letters use the fixed case-folding policy; scripts without case such as Korean and Japanese are compared as-is."],["Can I add the same search term twice?","No. Duplicate find values are blocked before execution under the selected case policy."],["Does the result overwrite the original text?","No. The result is separate and the original text stays unchanged."],["Is my text sent to a server?","No. Original text, rules, and results are processed in browser memory only."]]},
  ja:{back:"テキストツール",title:"テキスト検索・置換",desc:"1つまたは複数の検索語を原文基準で同時に置換し、総置換回数とルール別回数を確認できます。",next:"次の作業",related:"関連ツール",how:"使い方",faq:"よくある質問",steps:["原文を入力・貼り付けし、必要な検索・置換ルールを追加します。","大文字・小文字を区別するか選択します。","実行すると候補をすべて原文から計算して一度だけ置換します。","総置換回数とルール別回数を確認して結果をコピーします。","すべてクリアで原文・ルール・結果・状態を初期化します。"],notes:["正規表現ではなくliteral文字列です。. * [ ]などもそのまま検索します。","同じ検索文字列は重複ルールとして実行前にブロックします。","重なる検索語は長い文字列を優先し、同じ長さなら前のルールを優先します。","置換後の文字列に別の検索語が含まれていても原文基準の同時置換なので再検索しません。","上限: 原文1,000,000文字 · 100ルール · 検索1,000文字 · 置換10,000文字 · 結果5,000,000文字。"],faqs:[["ルール同士は影響しますか？","いいえ。候補はすべて原文から先に計算するため連鎖置換は発生しません。"],["正規表現を使えますか？","いいえ。042はliteral文字列の検索・置換です。"],["大文字・小文字を区別しない場合はどうなりますか？","英字は固定したcase-folding方針で比較し、日本語や韓国語のように大文字小文字のない文字はそのまま比較します。"],["同じ検索語を2つのルールに入れられますか？","いいえ。選択した大文字小文字ポリシーで重複する検索語は実行前にブロックします。"],["結果は原文を上書きしますか？","いいえ。結果は別領域に作り、原文は保持します。"],["テキストはサーバーへ送信されますか？","いいえ。原文・ルール・結果はブラウザメモリだけで処理します。"]]}
} as const;

export function TextFindReplacePage({locale}:{locale:Locale}){
  const t=copy[locale];
  const faq=t.faqs;
  const expertTitle=locale==="ko"?"찾기·바꾸기를 안전하게 사용하는 실전 기준":locale==="ja"?"検索・置換を安全に使う実践基準":"Practical standards for safe find and replace";
  const expertLead=locale==="ko"?"원문 기준 동시 치환, 겹치는 검색어 우선순위, 대소문자 정책과 결과 한도를 이해하면 대량 치환에서도 예상하지 못한 연쇄 변경을 줄일 수 있습니다.":locale==="ja"?"原文基準の同時置換、重複する検索語の優先順位、大文字小文字の扱いと結果上限を理解すると、意図しない連鎖置換を防げます。":"Understand source-based simultaneous replacement, overlapping-term priority, case policy, and output limits to avoid unintended chained edits.";
  const expert=locale==="ko"?[
    ["원문 기준으로 한 번만 치환합니다","042는 첫 번째 치환 결과를 다시 검색하지 않습니다. 모든 일치 후보를 원문에서 먼저 계산한 뒤 한 번에 적용하므로 규칙끼리 연쇄적으로 결과를 바꾸지 않습니다."],
    ["겹치는 검색어는 우선순위가 중요합니다","같은 위치에 여러 검색어가 겹치면 긴 검색어를 먼저 확정하고 길이가 같으면 앞에 등록한 규칙을 우선합니다. 규칙 순서를 바꾸면 같은 길이의 충돌 결과가 달라질 수 있습니다."],
    ["대소문자 구분은 영문 비교 방식입니다","대소문자 무시는 영문 case-folding에 영향을 주며 한글·일본어처럼 대소문자가 없는 문자는 그대로 비교합니다. 동일 검색어 중복 판정도 같은 정책을 사용합니다."],
    ["literal 검색이라 특수문자를 그대로 찾습니다","점, 별표, 대괄호 같은 문자는 정규식 기호가 아니라 실제 문자로 처리됩니다. 정규식 패턴이 필요한 작업과 일반 문자열 일괄치환을 구분해야 합니다."],
    ["원문과 결과를 따로 보존합니다","결과가 만들어져도 원문 입력을 덮어쓰지 않습니다. 변경 횟수와 규칙별 결과를 확인한 뒤 복사해야 대량 치환에서 잘못된 규칙을 발견하기 쉽습니다."],
    ["대량 치환은 한도와 결과 크기를 함께 봅니다","입력 글자수뿐 아니라 규칙 수, find·replacement 길이, 최종 결과 크기에 각각 한도가 있습니다. 긴 replacement를 여러 위치에 적용하면 출력이 입력보다 크게 늘어날 수 있습니다."]
  ]:locale==="ja"?[
    ["置換は原文基準で一度だけ行います","最初の置換結果を再検索せず、原文からすべての一致候補を計算して一度に適用するため連鎖置換を防ぎます。"],
    ["重なる検索語には優先順位があります","同じ位置で候補が重なる場合は長い検索語を優先し、同じ長さなら先に登録したルールを優先します。"],
    ["大文字小文字設定は英字比較に作用します","case-insensitiveでは英字をcase-foldingし、日本語や韓国語のように大小文字のない文字はそのまま比較します。"],
    ["literal検索では記号もそのまま扱います","点・アスタリスク・角括弧などは正規表現ではなく通常の文字として検索します。"],
    ["原文と結果は分けて保持します","結果を作成しても原文は上書きしません。総置換回数とルール別回数を確認してからコピーできます。"],
    ["大量置換では出力上限も確認します","入力文字数だけでなくルール数、検索・置換文字列、最終結果サイズにも上限があります。"]
  ]:[
    ["Replacement runs once against the original text","All match candidates are resolved from the original source before replacements are applied, so replacement output is not searched again and chained edits do not occur."],
    ["Overlapping terms use a deterministic priority","Longer search terms win when candidates overlap at the same position; equal lengths use the earlier rule."],
    ["Case policy mainly affects alphabetic matching","Case-insensitive mode case-folds English letters while scripts without letter case, such as Korean and Japanese, are compared as written."],
    ["Literal search treats regex symbols as normal text","Dots, asterisks, brackets, and similar characters are matched literally rather than interpreted as regular expressions."],
    ["Source and result remain separate","The output never overwrites the original input. Review total and per-rule counts before copying large replacement results."],
    ["Large jobs must respect both input and output limits","Input length, rule count, find/replacement size, and final result size have separate limits because long replacements can expand output significantly."]
  ] as const;
  return <ToolboxSubpageShell locale={locale} appName={t.title}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"WebApplication",name:t.title,applicationCategory:"UtilitiesApplication",operatingSystem:"Any",url:`https://toolbox.fixlgs.com/${locale}/text-find-replace`,description:t.desc,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}},{"@type":"FAQPage",mainEntity:faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}]})}}/>
    <section className="toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description">
      <Link className="toolbox-subpage-back" href={`/${locale}/category/text`}>← {t.back}</Link>
      <p className="toolbox-subpage-eyebrow">042 · TEXT</p>
      <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
      <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>Browser-local processing</span></div>
    </section>
    <section className="toolbox-tool-detail-body"><div>
      <TextFindReplaceTool locale={locale}/>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>NEXT WORK</p><h2>{t.next}</h2></div><div className="toolbox-next-work-grid"><Link className="toolbox-next-work-card" href={`/${locale}/text-diff-compare`}><span>043</span><h3>{locale==="ko"?"두 텍스트 비교기":locale==="ja"?"2つのテキスト比較ツール":"Text Diff & Compare"}</h3><div className="toolbox-next-work-card-foot"><span>Available</span><strong>↗</strong></div></Link></div></section>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>RELATED TOOLS</p><h2>{t.related}</h2></div><div className="toolbox-next-work-grid"><Link className="toolbox-next-work-card" href={`/${locale}/text-extractor`}><span>041</span><h3>{locale==="ko"?"텍스트 추출기":locale==="ja"?"テキスト抽出ツール":"Text Data Extractor"}</h3><div className="toolbox-next-work-card-foot"><span>Available</span><strong>↗</strong></div></Link><Link className="toolbox-next-work-card" href={`/${locale}/delimiter-list-converter`}><span>040</span><h3>{locale==="ko"?"구분자·목록 변환기":locale==="ja"?"区切り文字・リスト変換ツール":"Delimiter & List Converter"}</h3><div className="toolbox-next-work-card-foot"><span>Available</span><strong>↗</strong></div></Link></div></section>
    </div></section>
    <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((x,i)=><li key={x}><span>{String(i+1).padStart(2,"0")}</span><p>{x}</p></li>)}</ol></section>
    <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head toolbox-tool-expert-post--compact-copy"><div className="toolbox-tool-format-guide-head"><p>EXPERT POST</p><h2>{expertTitle}</h2><span>{expertLead}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-direction-grid toolbox-tool-practical-grid">{expert.map(([title,description])=><article key={title}><h4>{title}</h4><p>{description}</p></article>)}</div></div></section>
    <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head"><div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{locale==="ko"?"주의사항":locale==="ja"?"注意事項":"Important notes"}</h2></div><ul className="toolbox-tool-info-band-list">{t.notes.map(x=><li key={x}>{x}</li>)}</ul></section>
    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faq}</h2></div><ToolboxFaqList items={faq.map(([q,a]):readonly[string,string]=>[q,a])} initialCount={5} moreLabel={locale==="ko"?"FAQ 더보기":locale==="ja"?"FAQをもっと見る":"Show more FAQs"} collapseLabel={locale==="ko"?"FAQ 접기":locale==="ja"?"FAQを閉じる":"Collapse FAQs"} className="toolbox-tool-faq-list"/></section>
  </ToolboxSubpageShell>;
}
