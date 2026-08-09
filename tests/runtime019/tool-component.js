'use client';
const FONT_STACKS = { sans: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR","Noto Sans JP",sans-serif', boldSans: 'Arial Black,Arial,"Noto Sans KR","Noto Sans JP",sans-serif', serif: 'Georgia,"Times New Roman","Noto Serif KR","Noto Serif JP",serif', impact: 'Impact,Haettenschweiler,"Arial Narrow Bold","Noto Sans KR","Noto Sans JP",sans-serif' };
const baseText = (kind, locale = 'ko') => ({ text: kind === 'title' ? (locale === 'ko' ? '유튜브 썸네일 제목' : locale === 'ja' ? 'YouTubeサムネイルタイトル' : 'YouTube Thumbnail Title') : (locale === 'ko' ? '부제목을 입력하세요' : locale === 'ja' ? 'サブタイトルを入力' : 'Enter a subtitle'), x: 80, y: kind === 'title' ? 250 : 460, maxWidth: 1120, fontSize: kind === 'title' ? 86 : 42, lineHeight: 1.18, font: kind === 'title' ? 'boldSans' : 'sans', bold: true, color: '#ffffff', align: 'left', outline: true, outlineWidth: kind === 'title' ? 7 : 4, outlineColor: '#000000', shadow: false, shadowColor: '#000000', shadowOpacity: 55, shadowBlur: 8, shadowX: 4, shadowY: 5, textBackground: false, textBackgroundColor: '#000000', textBackgroundOpacity: 55, textBackgroundPadding: 18, visible: true });
const initial = (locale = 'ko') => ({ fit: 'cover', cropX: 0, cropY: 0, bgZoom: 1, bgColor: '#111111', darken: 0, title: baseText('title', locale), subtitle: baseText('subtitle', locale), safe: true, thirds: false, resolution: 'standard', format: 'jpg', quality: 90, filename: 'youtube-thumbnail.jpg' });
const copy = { ko: { drop: '썸네일 배경 이미지 선택', select: '이미지 선택', support: 'JPG · PNG · WebP', bg: '배경', title: '제목', subtitle: '부제', output: '출력', replace: '이미지 교체', remove: '이미지 제거', cover: '채우기', contain: '전체 보기', zoom: '배경 확대', dark: '배경 밝기 조절', bgColor: '배경색', safe: '가독성 안전 가이드', thirds: '삼등분 가이드', resolution: '출력 해상도', standard: '표준 1280×720', high: '고해상도 3840×2160', fit2mb: '2MB 이하로 맞추기', text: '문구', size: '글자 크기', lineHeight: '줄간격', width: '글자 영역 폭', bold: '굵게', color: '글자 색상', outline: '외곽선 사용', outlineWidth: '외곽선 두께', outlineColor: '외곽선 색상', shadow: '그림자 사용', font: '글꼴', shadowColor: '그림자 색상', shadowOpacity: '그림자 투명도', shadowBlur: '그림자 흐림', shadowX: '그림자 가로 위치', shadowY: '그림자 세로 위치', textBg: '글자 배경 사용', textBgColor: '글자 배경색', textBgOpacity: '글자 배경 투명도', textBgPadding: '내부 여백', position: '빠른 위치', positionReset: '위치 초기화', download: '이미지 다운로드', again: '다시 다운로드', undo: '실행 취소', redo: '다시 실행', reset: '전체 초기화', fileSize: '파일 용량', quality: '출력 품질', format: '출력 형식', filename: '파일명', small: '작은 화면 미리보기', low: '원본 이미지 해상도가 낮아 확대하면 흐려질 수 있습니다.', local: '이미지와 입력한 문구는 현재 브라우저에서만 처리됩니다.', ready: '다운로드 준비 완료' }, en: { drop: 'Select a thumbnail background image', select: 'Select Image', support: 'JPG · PNG · WebP', bg: 'Background', title: 'Title', subtitle: 'Subtitle', output: 'Output', replace: 'Replace Image', remove: 'Remove Image', cover: 'Fill', contain: 'Fit Entire Image', zoom: 'Background Zoom', dark: 'Background Light / Dark', bgColor: 'Background Color', safe: 'Safe Content Guide', thirds: 'Rule of Thirds Guide', resolution: 'Export Resolution', standard: 'Standard 1280×720', high: 'High Resolution 3840×2160', fit2mb: 'Fit Under 2 MB', text: 'Text', size: 'Font Size', lineHeight: 'Line Height', width: 'Text Width', bold: 'Bold', color: 'Text Color', outline: 'Enable Outline', outlineWidth: 'Outline Thickness', outlineColor: 'Outline Color', shadow: 'Enable Shadow', font: 'Font', shadowColor: 'Shadow Color', shadowOpacity: 'Shadow Opacity', shadowBlur: 'Shadow Blur', shadowX: 'Horizontal Offset', shadowY: 'Vertical Offset', textBg: 'Text Background', textBgColor: 'Background Color', textBgOpacity: 'Background Opacity', textBgPadding: 'Padding', position: 'Quick Position', positionReset: 'Reset Position', download: 'Download Image', again: 'Download Again', undo: 'Undo', redo: 'Redo', reset: 'Reset All', fileSize: 'File Size', quality: 'Output Quality', format: 'Output Format', filename: 'File Name', small: 'Small Preview', low: 'The source image may look blurry when enlarged.', local: 'Your image and text stay in this browser.', ready: 'Ready to download' }, ja: { drop: 'サムネイルの背景画像を選択', select: '画像を選択', support: 'JPG · PNG · WebP', bg: '背景', title: 'タイトル', subtitle: 'サブタイトル', output: '出力', replace: '画像を変更', remove: '画像を削除', cover: '枠いっぱいに表示', contain: '画像全体を表示', zoom: '背景を拡大', dark: '背景の明暗調整', bgColor: '背景色', safe: 'セーフコンテンツガイド', thirds: '三分割ガイド', resolution: '出力解像度', standard: '標準 1280×720', high: '高解像度 3840×2160', fit2mb: '2MB以下に調整', text: '文字', size: '文字サイズ', lineHeight: '行間', width: '文字領域の幅', bold: '太字', color: '文字色', outline: '縁取りを使用', outlineWidth: '縁取りの太さ', outlineColor: '縁取りの色', shadow: '影を使用', font: 'フォント', shadowColor: '影の色', shadowOpacity: '影の不透明度', shadowBlur: '影のぼかし', shadowX: '影の横位置', shadowY: '影の縦位置', textBg: '文字背景を使用', textBgColor: '文字背景色', textBgOpacity: '文字背景の不透明度', textBgPadding: '内側の余白', position: 'クイック配置', positionReset: '位置をリセット', download: '画像をダウンロード', again: 'もう一度ダウンロード', undo: '元に戻す', redo: 'やり直す', reset: 'すべてリセット', fileSize: 'ファイルサイズ', quality: '出力品質', format: '出力形式', filename: 'ファイル名', small: '小さいサイズでプレビュー', low: '元画像の解像度が低いため、拡大するとぼやける場合があります。', local: '画像と入力文字は現在のブラウザ内だけで処理されます。', ready: 'ダウンロード準備完了' } };
function wrap(ctx, text, max) { const out = []; for (const para of text.split('\n')) {
    if (!para) {
        out.push('');
        continue;
    }
    const words = /\s/.test(para) ? para.split(/(\s+)/).filter(Boolean) : Array.from(para);
    let line = '';
    for (const token of words) {
        const next = line + token;
        if (ctx.measureText(next).width <= max || !line)
            line = next;
        else {
            out.push(line.trimEnd());
            line = token.trimStart();
        }
    }
    if (line)
        out.push(line.trimEnd());
} return out; }
function textMetrics(ctx, s) { ctx.save(); ctx.font = `${s.bold ? '700' : '500'} ${s.fontSize}px ${FONT_STACKS[s.font]}`; const lines = wrap(ctx, s.text, s.maxWidth), lh = s.fontSize * s.lineHeight, width = Math.min(s.maxWidth, Math.max(1, ...lines.map(line => ctx.measureText(line || ' ').width))); ctx.restore(); return { lines, lh, width, height: Math.max(lh, lines.length * lh) }; }
function drawText(ctx, s) { if (!s.visible || !s.text)
    return; ctx.save(); ctx.font = `${s.bold ? '700' : '500'} ${s.fontSize}px ${FONT_STACKS[s.font]}`; ctx.textBaseline = 'top'; ctx.textAlign = s.align; ctx.lineJoin = 'round'; const { lines, lh, width } = textMetrics(ctx, s); let x = s.x; if (s.align === 'center')
    x = s.x + s.maxWidth / 2;
else if (s.align === 'right')
    x = s.x + s.maxWidth; if (s.textBackground && lines.length) {
    const pad = s.textBackgroundPadding, a = Math.max(0, Math.min(100, s.textBackgroundOpacity)) / 100, hex = s.textBackgroundColor.replace('#', ''), n = parseInt(hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex, 16);
    ctx.fillStyle = `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    const bx = s.align === 'left' ? s.x : s.align === 'center' ? s.x + (s.maxWidth - width) / 2 : s.x + s.maxWidth - width;
    ctx.fillRect(bx - pad, s.y - pad, width + pad * 2, lines.length * lh + pad * 2);
} for (let i = 0; i < lines.length; i++) {
    const y = s.y + i * lh;
    if (s.shadow) {
        const a = Math.max(0, Math.min(100, s.shadowOpacity)) / 100;
        const hex = s.shadowColor.replace('#', '');
        const n = parseInt(hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex, 16);
        ctx.shadowColor = `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
        ctx.shadowBlur = s.shadowBlur;
        ctx.shadowOffsetX = s.shadowX;
        ctx.shadowOffsetY = s.shadowY;
    }
    else {
        ctx.shadowColor = 'transparent';
    }
    if (s.outline) {
        ctx.lineWidth = s.outlineWidth;
        ctx.strokeStyle = s.outlineColor;
        ctx.strokeText(lines[i], x, y, s.maxWidth);
    }
    ctx.fillStyle = s.color;
    ctx.fillText(lines[i], x, y, s.maxWidth);
} ctx.restore(); }
function YoutubeThumbnailMakerTool({ locale }) {
    const t = copy[locale];
    const [image, setImage] = useState(null);
    const imgRef = useRef(null);
    const fileRef = useRef(null);
    const canvasRef = useRef(null);
    const smallRef = useRef(null);
    const renderFrame = useRef(null);
    const [state, setState] = useState(() => initial(locale));
    const [selected, setSelected] = useState('title');
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [blobSize, setBlobSize] = useState(null);
    const [downloaded, setDownloaded] = useState(false);
    const [hist, setHist] = useState([]);
    const [redo, setRedo] = useState([]);
    const [mobile, setMobile] = useState('background');
    const drag = useRef(null);
    const commit = (patch) => { setHist(h => [...h.slice(-(TOOL019_SERVICE_LIMITS.maxHistory - 1)), structuredClone(state)]); setRedo([]); setState(s => ({ ...s, ...patch })); setDownloaded(false); };
    const patchText = (k, p) => commit({ [k]: { ...state[k], ...p } });
    const fitGeometry = useCallback((im, s) => { const cw = 1280, ch = 720; const base = s.fit === 'cover' ? Math.max(cw / im.naturalWidth, ch / im.naturalHeight) : Math.min(cw / im.naturalWidth, ch / im.naturalHeight); const scale = base * s.bgZoom, w = im.naturalWidth * scale, h = im.naturalHeight * scale; return { x: (cw - w) / 2 + s.cropX * cw, y: (ch - h) / 2 + s.cropY * ch, w, h }; }, []);
    const clampCrop = useCallback((x, y, s) => { const im = imgRef.current; if (!im)
        return { x: 0, y: 0 }; if (s.fit === 'contain')
        return { x: 0, y: 0 }; const base = Math.max(1280 / im.naturalWidth, 720 / im.naturalHeight), scale = base * s.bgZoom, w = im.naturalWidth * scale, h = im.naturalHeight * scale, maxX = Math.max(0, (w - 1280) / 2) / 1280, maxY = Math.max(0, (h - 720) / 2) / 720; return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) }; }, []);
    const resetBackgroundFit = () => commit({ cropX: 0, cropY: 0, bgZoom: 1 });
    const render = useCallback((target, withGuide = false, resolution = state.resolution) => { const mul = resolution === 'high' ? 3 : 1, targetW = 1280 * mul, targetH = 720 * mul; target.width = targetW; target.height = targetH; const ctx = target.getContext('2d'); if (!ctx)
        return; ctx.save(); ctx.scale(mul, mul); ctx.fillStyle = state.bgColor; ctx.fillRect(0, 0, 1280, 720); if (imgRef.current) {
        const g = fitGeometry(imgRef.current, state);
        ctx.drawImage(imgRef.current, g.x, g.y, g.w, g.h);
    } if (state.darken > 0) {
        ctx.fillStyle = `rgba(0,0,0,${state.darken / 100})`;
        ctx.fillRect(0, 0, 1280, 720);
    }
    else if (state.darken < 0) {
        ctx.fillStyle = `rgba(255,255,255,${Math.abs(state.darken) / 100})`;
        ctx.fillRect(0, 0, 1280, 720);
    } drawText(ctx, state.title); drawText(ctx, state.subtitle); if (withGuide && selected !== 'background') {
        const st = state[selected];
        if (st.visible && st.text) {
            ctx.save();
            ctx.font = `${st.bold ? '700' : '500'} ${st.fontSize}px ${FONT_STACKS[st.font]}`;
            const m = textMetrics(ctx, st), w = Math.min(st.maxWidth, m.width), left = st.align === 'left' ? st.x : st.align === 'center' ? st.x + (st.maxWidth - w) / 2 : st.x + st.maxWidth - w;
            ctx.strokeStyle = 'rgba(8,104,215,.95)';
            ctx.setLineDash([8, 6]);
            ctx.lineWidth = 2;
            ctx.strokeRect(Math.max(0, left - 12), Math.max(0, st.y - 12), Math.min(1280 - left + 12, w + 24), Math.min(720 - st.y + 12, m.height + 24));
            ctx.restore();
        }
    } if (withGuide && state.safe) {
        ctx.save();
        ctx.strokeStyle = 'rgba(8,104,215,.95)';
        ctx.setLineDash([12, 9]);
        ctx.lineWidth = 2;
        ctx.strokeRect(64, 36, 1152, 648);
        ctx.restore();
    } if (withGuide && state.thirds) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,.7)';
        ctx.setLineDash([7, 7]);
        ctx.lineWidth = 1.5;
        [1280 / 3, 1280 * 2 / 3].forEach(x => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 720); ctx.stroke(); });
        [720 / 3, 720 * 2 / 3].forEach(y => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1280, y); ctx.stroke(); });
        ctx.restore();
    } ctx.restore(); }, [state, fitGeometry, selected]);
    useEffect(() => { if (renderFrame.current !== null)
        cancelAnimationFrame(renderFrame.current); renderFrame.current = requestAnimationFrame(() => { if (canvasRef.current)
        render(canvasRef.current, true, 'standard'); if (smallRef.current)
        render(smallRef.current, false, 'standard'); renderFrame.current = null; }); const id = setTimeout(() => { const c = document.createElement('canvas'); render(c, false, state.resolution); const type = state.format === 'png' ? 'image/png' : 'image/jpeg'; c.toBlob(b => setBlobSize(b?.size ?? null), type, state.format === 'png' ? undefined : state.quality / 100); }, 220); return () => { clearTimeout(id); if (renderFrame.current !== null) {
        cancelAnimationFrame(renderFrame.current);
        renderFrame.current = null;
    } }; }, [render, state.format, state.quality]);
    useEffect(() => () => { if (image?.url)
        URL.revokeObjectURL(image.url); }, [image]);
    const fileSignature = async (file) => { const b = new Uint8Array(await file.slice(0, 32).arrayBuffer()); if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)
        return 'jpeg'; if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)
        return 'png'; if (String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP')
        return 'webp'; return 'unknown'; };
    const hasAnimation = async (file, kind) => { const sample = file.slice(0, 256 * 1024); if (kind === 'png') {
        const b = new Uint8Array(await sample.arrayBuffer());
        const text = new TextDecoder('latin1').decode(b);
        return text.includes('acTL');
    } if (kind === 'webp') {
        const b = new Uint8Array(await sample.arrayBuffer());
        const text = new TextDecoder('latin1').decode(b);
        return text.includes('ANIM') || text.includes('ANMF');
    } return false; };
    const load = async (file) => { setError(''); if (file.size === 0) {
        setError(locale === 'ko' ? '빈 파일은 사용할 수 없습니다.' : locale === 'ja' ? '空のファイルは使用できません。' : 'Empty files are not supported.');
        return;
    } if (file.size > TOOL019_SERVICE_LIMITS.maxFileBytes) {
        setError(locale === 'ko' ? '파일이 20MB 서비스 범위를 넘습니다.' : locale === 'ja' ? 'ファイルが20MBのサービス範囲を超えています。' : 'File exceeds the 20 MB service range.');
        return;
    } const kind = await fileSignature(file), mimeKind = file.type === 'image/jpeg' ? 'jpeg' : file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'unknown'; if (kind === 'unknown' || kind !== mimeKind) {
        setError(locale === 'ko' ? '파일 내용과 이미지 형식이 일치하지 않습니다.' : locale === 'ja' ? 'ファイル内容と画像形式が一致しません。' : 'File content and image type do not match.');
        return;
    } if (await hasAnimation(file, kind)) {
        setError(locale === 'ko' ? '애니메이션 이미지는 지원하지 않습니다. 정적 JPG, PNG 또는 WebP를 사용해 주세요.' : locale === 'ja' ? 'アニメーション画像には対応していません。静止画のJPG、PNG、WebPを使用してください。' : 'Animated images are not supported. Use a static JPG, PNG, or WebP.');
        return;
    } let url = ''; try {
        url = URL.createObjectURL(file);
    }
    catch {
        setError(locale === 'ko' ? '브라우저 메모리가 부족합니다. 다른 앱이나 탭을 닫고 다시 시도해 주세요.' : locale === 'ja' ? 'ブラウザのメモリが不足しています。他のアプリやタブを閉じて再試行してください。' : 'Browser memory is low. Close other apps or tabs and try again.');
        return;
    } const im = new Image(); im.onload = () => { if (im.naturalWidth > TOOL019_SERVICE_LIMITS.maxSide || im.naturalHeight > TOOL019_SERVICE_LIMITS.maxSide || im.naturalWidth * im.naturalHeight > TOOL019_SERVICE_LIMITS.maxPixels) {
        URL.revokeObjectURL(url);
        setError(locale === 'ko' ? '이미지 해상도가 서비스 범위를 넘습니다.' : locale === 'ja' ? '画像解像度がサービス範囲を超えています。' : 'Image resolution exceeds the service range.');
        return;
    } if (image?.url)
        URL.revokeObjectURL(image.url); imgRef.current = im; setImage({ name: file.name, w: im.naturalWidth, h: im.naturalHeight, sourceWidth: im.naturalWidth, sourceHeight: im.naturalHeight, orientation: 'browser-normalized', url }); setState(s => ({ ...s, cropX: 0, cropY: 0, bgZoom: 1, filename: file.name.replace(/\.[^.]+$/, '') + '-thumbnail.' + s.format })); setStatus(''); }; im.onerror = () => { URL.revokeObjectURL(url); setError(locale === 'ko' ? '이미지를 읽을 수 없습니다.' : locale === 'ja' ? '画像を読み込めません。' : 'Could not read the image.'); }; im.src = url; };
    const undo = () => { const prev = hist.at(-1); if (!prev)
        return; setRedo(r => [structuredClone(state), ...r]); setHist(h => h.slice(0, -1)); setState(prev); };
    const redoFn = () => { const next = redo[0]; if (!next)
        return; setHist(h => [...h, structuredClone(state)]); setRedo(r => r.slice(1)); setState(next); };
    const reset = () => { if (image?.url)
        URL.revokeObjectURL(image.url); setHist([]); setRedo([]); setState(initial(locale)); setImage(null); imgRef.current = null; setStatus(''); setBlobSize(null); setDownloaded(false); };
    const sanitizeFilename = (name, format) => { const base = (name || 'youtube-thumbnail').replace(/[\x00-\x1f\x7f]/g, '').replace(/[\\/:*?"<>|]/g, '-').trim().replace(/[. ]+$/, '').replace(/\.(jpg|png)$/i, '').slice(0, 120) || 'youtube-thumbnail'; return `${base}.${format}`; };
    const encodeBlob = (quality) => new Promise(resolve => { const c = document.createElement('canvas'); render(c, false, state.resolution); c.toBlob(resolve, 'image/jpeg', quality / 100); });
    const fitUnder2MB = async () => { if (state.format !== 'jpg') {
        setStatus(locale === 'ko' ? 'PNG는 JPG 품질 조정 방식으로 2MB 자동 맞춤을 하지 않습니다.' : locale === 'ja' ? 'PNGはJPG画質調整方式で2MB自動調整しません。' : 'PNG is not auto-fitted with JPEG quality adjustment.');
        return;
    } setStatus(locale === 'ko' ? '2MB 이하로 조정 중…' : locale === 'ja' ? '2MB以下に調整中…' : 'Fitting under 2 MB…'); let q = Math.min(100, Math.max(60, state.quality)), last = null; for (let i = 0; i < 9; i++) {
        last = await encodeBlob(q);
        if (!last)
            break;
        if (last.size <= TOOL019_PLATFORM_GUIDELINE.mobileVideoThumbnailMaxBytes) {
            commit({ quality: q });
            setBlobSize(last.size);
            setStatus(locale === 'ko' ? `품질 ${q}에서 2MB 이하로 맞췄습니다.` : locale === 'ja' ? `画質${q}で2MB以下に調整しました。` : `Fit under 2 MB at quality ${q}.`);
            return;
        }
        if (q <= 60)
            break;
        q = Math.max(60, q - 5);
    } setBlobSize(last?.size ?? null); setStatus(locale === 'ko' ? '2MB 이하로 맞추려면 화질 저하가 클 수 있습니다. 1280×720 출력을 사용해 보세요.' : locale === 'ja' ? '2MB以下にするには画質低下が大きくなる可能性があります。1280×720出力をお試しください。' : 'Reaching 2 MB may reduce quality too much. Try 1280×720 output.'); };
    const download = () => {
        const c = document.createElement('canvas');
        render(c, false, state.resolution);
        const type = state.format === 'png' ? 'image/png' : 'image/jpeg';
        c.toBlob(blob => { if (!blob) {
            setError(locale === 'ko' ? '결과 이미지를 만들 수 없습니다.' : locale === 'ja' ? '出力画像を作成できません。' : 'Could not create output image.');
            return;
        } const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = (state.filename || 'youtube-thumbnail.' + state.format).replace(/[\\/:*?"<>|]/g, '-').replace(/\.(jpg|png)$/i, '') + '.' + state.format; a.click(); setTimeout(() => URL.revokeObjectURL(url), 0); setBlobSize(blob.size); setDownloaded(true); setStatus(t.ready); }, type, state.format === 'png' ? undefined : state.quality / 100);
    };
    const getTextBounds = (k) => { const c = canvasRef.current, ctx = c?.getContext('2d'), st = state[k]; if (!ctx || !st.visible || !st.text)
        return null; const m = textMetrics(ctx, st), width = Math.min(st.maxWidth, m.width), height = m.height; const left = st.align === 'left' ? st.x : st.align === 'center' ? st.x + (st.maxWidth - width) / 2 : st.x + st.maxWidth - width; return { left: Math.max(0, left - 14), top: Math.max(0, st.y - 14), right: Math.min(1280, left + width + 14), bottom: Math.min(720, st.y + height + 14) }; };
    const hitTarget = (x, y) => { for (const k of ['subtitle', 'title']) {
        const b = getTextBounds(k);
        if (b && x >= b.left && x <= b.right && y >= b.top && y <= b.bottom)
            return k;
    } return 'background'; };
    const pointerDown = (e) => { const rect = e.currentTarget.getBoundingClientRect(), x = (e.clientX - rect.left) * 1280 / rect.width, y = (e.clientY - rect.top) * 720 / rect.height, target = hitTarget(x, y); setSelected(target); drag.current = { x, y, startX: target === 'background' ? state.cropX : state[target].x, startY: target === 'background' ? state.cropY : state[target].y, target, before: structuredClone(state) }; e.currentTarget.setPointerCapture(e.pointerId); };
    const pointerMove = (e) => { if (!drag.current)
        return; const rect = e.currentTarget.getBoundingClientRect(), x = (e.clientX - rect.left) * 1280 / rect.width, y = (e.clientY - rect.top) * 720 / rect.height, dx = x - drag.current.x, dy = y - drag.current.y; if (drag.current.target === 'background')
        setState(s => { const next = clampCrop(drag.current.startX + dx / 1280, drag.current.startY + dy / 720, s); return { ...s, cropX: next.x, cropY: next.y }; });
    else {
        const k = drag.current.target;
        setState(s => ({ ...s, [k]: { ...s[k], x: Math.max(0, Math.min(1270, drag.current.startX + dx)), y: Math.max(0, Math.min(710, drag.current.startY + dy)) } }));
    } };
    const pointerUp = () => { if (!drag.current)
        return; setHist(h => [...h.slice(-(TOOL019_SERVICE_LIMITS.maxHistory - 1)), drag.current.before]); setRedo([]); drag.current = null; };
    const keyMove = (e) => { if (selected === 'background' || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key))
        return; e.preventDefault(); const step = e.shiftKey ? 10 : 1, k = selected, s = state[k], dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0, dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0; patchText(k, { x: Math.max(0, Math.min(1280 - s.maxWidth, s.x + dx)), y: Math.max(0, Math.min(710, s.y + dy)) }); };
    const quickPosition = (k, h, v) => { const s = state[k]; const margin = 80; const x = h === 'left' ? margin : h === 'center' ? (1280 - s.maxWidth) / 2 : 1280 - margin - s.maxWidth; const estimatedHeight = Math.max(s.fontSize * s.lineHeight, (s.text.split('\n').length || 1) * s.fontSize * s.lineHeight); const y = v === 'top' ? 70 : v === 'middle' ? Math.max(50, (720 - estimatedHeight) / 2) : Math.max(50, 720 - 70 - estimatedHeight); patchText(k, { x: Math.max(0, Math.min(1280 - s.maxWidth, x)), y: Math.max(0, Math.min(680, y)) }); };
    const resetTextPosition = (k) => { const b = baseText(k, locale); patchText(k, { x: b.x, y: b.y, maxWidth: b.maxWidth }); };
    const selectedStyle = selected === 'background' ? null : state[selected];
    const low = image ? (image.w < 1280 || image.h < 720) : false;
    return React.createElement("div", { className: `${styles.root} toolbox-tool-workflow`, "data-testid": "tool019-root", "data-max-file-bytes": TOOL019_SERVICE_LIMITS.maxFileBytes, "data-max-pixels": TOOL019_SERVICE_LIMITS.maxPixels },
        React.createElement("input", { ref: fileRef, "data-testid": "tool019-file-input", className: styles.hidden, type: "file", accept: "image/jpeg,image/png,image/webp", onChange: e => { const f = e.target.files?.[0]; if (f)
                load(f); e.currentTarget.value = ''; } }),
        !image && React.createElement("section", { className: `toolbox-workbench ${styles.card}` },
            React.createElement("div", { "data-testid": "tool019-drop", className: `toolbox-workbench-upload ${styles.drop} ${dragOver ? styles.drag : ''}`, onDragOver: e => { e.preventDefault(); setDragOver(true); }, onDragLeave: () => setDragOver(false), onDrop: e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f)
                    load(f); } },
                React.createElement("div", { className: "toolbox-workbench-topline" },
                    React.createElement("div", null,
                        React.createElement("span", null, "WORKSPACE"),
                        React.createElement("strong", null, locale === 'ko' ? '유튜브 썸네일 제작 작업장' : locale === 'ja' ? 'YouTubeサムネイル作成ワークスペース' : 'YouTube thumbnail workspace'))),
                React.createElement("div", { className: "toolbox-upload-focus" },
                    React.createElement("span", { className: "toolbox-upload-icon", "aria-hidden": "true" }, "\uFF0B"),
                    React.createElement("h2", null, t.drop),
                    React.createElement("p", null, t.local),
                    React.createElement("button", { type: "button", className: styles.primary, onClick: () => fileRef.current?.click() }, t.select),
                    React.createElement("small", null, t.support)),
                error && React.createElement("div", { className: "toolbox-workbench-notice" },
                    React.createElement("strong", null, locale === 'ko' ? '안내' : locale === 'ja' ? '案内' : 'Notice'),
                    React.createElement("span", { className: styles.error, role: "alert" }, error))),
            React.createElement("div", { className: styles.actions, style: { marginTop: 12 } },
                React.createElement("button", { className: styles.button, onClick: () => { setImage({ name: '', w: 1280, h: 720, sourceWidth: 1280, sourceHeight: 720, orientation: 'browser-normalized', url: '' }); imgRef.current = null; } }, locale === 'ko' ? '단색 배경으로 시작' : locale === 'ja' ? '単色背景で開始' : 'Start with a solid background'))),
        image && React.createElement(React.Fragment, null,
            React.createElement("section", { "data-testid": "tool019-workspace-drop", className: `toolbox-workbench ${styles.card} ${dragOver ? styles.workspaceDrag : ''}`, onDragOver: e => { if (e.dataTransfer.types.includes('Files')) {
                    e.preventDefault();
                    setDragOver(true);
                } }, onDragLeave: e => { if (e.currentTarget === e.target)
                    setDragOver(false); }, onDrop: e => { if (e.dataTransfer.files.length) {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files[0];
                    if (f)
                        load(f);
                } } },
                React.createElement("div", { className: styles.toolbar },
                    React.createElement("strong", null, locale === 'ko' ? '유튜브 썸네일 제작 작업장' : locale === 'ja' ? 'YouTubeサムネイル作成ワークスペース' : 'YouTube thumbnail workspace'),
                    React.createElement("div", { className: styles.actions },
                        React.createElement("button", { className: styles.button, disabled: !hist.length, onClick: undo }, t.undo),
                        React.createElement("button", { className: styles.button, disabled: !redo.length, onClick: redoFn }, t.redo))),
                React.createElement("div", { className: styles.workspace },
                    React.createElement("section", null,
                        React.createElement("div", { className: styles.canvasBox },
                            React.createElement("canvas", { ref: canvasRef, "data-testid": "tool019-preview-canvas", tabIndex: 0, "aria-label": locale === 'ko' ? '썸네일 편집 미리보기' : locale === 'ja' ? 'サムネイル編集プレビュー' : 'Thumbnail editing preview', onKeyDown: keyMove, onPointerDown: pointerDown, onPointerMove: pointerMove, onPointerUp: pointerUp })),
                        low && React.createElement("p", { className: styles.warn }, t.low),
                        React.createElement("p", { className: styles.caption }, locale === 'ko' ? '미리보기에서 배경·제목·부제를 선택한 뒤 직접 드래그해 위치를 조절할 수 있습니다.' : locale === 'ja' ? '背景・タイトル・サブタイトルを選択してプレビュー上でドラッグできます。' : 'Select background, title, or subtitle and drag directly in the preview.'),
                        React.createElement("section", { className: styles.smallPreview },
                            React.createElement("canvas", { ref: smallRef, "data-testid": "tool019-small-preview" })),
                        React.createElement("p", { className: styles.caption }, t.small)),
                    React.createElement("aside", { className: styles.settings, "data-testid": "tool019-settings" },
                        React.createElement("div", { className: styles.tabs }, ['background', 'title', 'subtitle', 'output'].map(k => React.createElement("button", { key: k, className: mobile === k ? styles.active : '', onClick: () => setMobile(k) }, k === 'background' ? t.bg : k === 'title' ? t.title : k === 'subtitle' ? t.subtitle : t.output))),
                        React.createElement("div", { className: `${styles.section} ${styles.mobilePanel} ${mobile === 'background' ? styles.active : ''}` },
                            React.createElement("div", { className: styles.panelTitle },
                                React.createElement("h4", null, t.bg),
                                React.createElement("span", null, selected === 'background' ? 'SELECTED' : '')),
                            React.createElement("button", { className: styles.button, onClick: () => setSelected('background') }, locale === 'ko' ? '배경 편집' : locale === 'ja' ? '背景を編集' : 'Edit background'),
                            React.createElement("div", { className: styles.two },
                                React.createElement("button", { className: `${styles.button} ${state.fit === 'cover' ? styles.active : ''}`, onClick: () => commit({ fit: 'cover', cropX: 0, cropY: 0, bgZoom: 1 }) }, t.cover),
                                React.createElement("button", { className: `${styles.button} ${state.fit === 'contain' ? styles.active : ''}`, onClick: () => commit({ fit: 'contain', cropX: 0, cropY: 0, bgZoom: 1 }) }, t.contain)),
                            React.createElement("button", { "data-testid": "tool019-bg-reset", className: styles.button, onClick: resetBackgroundFit }, locale === 'ko' ? '배경 맞춤 초기화' : locale === 'ja' ? '背景の配置をリセット' : 'Reset background fit'),
                            React.createElement("label", { className: styles.label },
                                t.zoom,
                                React.createElement("input", { type: "range", min: "100", max: "250", value: state.bgZoom * 100, onChange: e => { const z = +e.target.value / 100; const next = clampCrop(state.cropX, state.cropY, { ...state, bgZoom: z }); commit({ bgZoom: z, cropX: next.x, cropY: next.y }); } })),
                            React.createElement("label", { className: styles.label },
                                t.dark,
                                React.createElement("input", { type: "range", min: "-50", max: "70", value: state.darken, onChange: e => commit({ darken: +e.target.value }) })),
                            React.createElement("label", { className: styles.label },
                                t.bgColor,
                                React.createElement("input", { type: "color", value: state.bgColor, onChange: e => commit({ bgColor: e.target.value }) })),
                            React.createElement("label", { className: styles.check },
                                React.createElement("input", { "data-testid": "tool019-safe-guide", type: "checkbox", checked: state.safe, onChange: e => commit({ safe: e.target.checked }) }),
                                t.safe),
                            React.createElement("label", { className: styles.check },
                                React.createElement("input", { "data-testid": "tool019-thirds-guide", type: "checkbox", checked: state.thirds, onChange: e => commit({ thirds: e.target.checked }) }),
                                t.thirds),
                            React.createElement("div", { className: styles.actions },
                                React.createElement("button", { className: styles.button, onClick: () => fileRef.current?.click() }, t.replace),
                                React.createElement("button", { className: styles.button, onClick: () => { if (image?.url)
                                        URL.revokeObjectURL(image.url); imgRef.current = null; setImage({ name: '', w: 1280, h: 720, sourceWidth: 1280, sourceHeight: 720, orientation: 'browser-normalized', url: '' }); } }, t.remove))),
                        ['title', 'subtitle'].map(k => { const s = state[k]; return React.createElement("div", { key: k, className: `${styles.section} ${styles.mobilePanel} ${mobile === k ? styles.active : ''}` },
                            React.createElement("div", { className: styles.panelTitle },
                                React.createElement("h4", null, k === 'title' ? t.title : t.subtitle),
                                React.createElement("span", null, selected === k ? 'SELECTED' : '')),
                            React.createElement("button", { className: styles.button, onClick: () => setSelected(k) }, locale === 'ko' ? '이 항목 편집' : locale === 'ja' ? 'この項目を編集' : 'Edit this item'),
                            React.createElement("label", { className: styles.check },
                                React.createElement("input", { type: "checkbox", checked: s.visible, onChange: e => patchText(k, { visible: e.target.checked }) }),
                                locale === 'ko' ? '표시' : locale === 'ja' ? '表示' : 'Show'),
                            React.createElement("label", { className: styles.label },
                                t.text,
                                React.createElement("textarea", { "data-testid": `tool019-${k}-text`, maxLength: k === 'title' ? TOOL019_SERVICE_LIMITS.maxTitleChars : TOOL019_SERVICE_LIMITS.maxSubtitleChars, value: s.text, onChange: e => patchText(k, { text: e.target.value }) })),
                            React.createElement("div", { className: styles.two },
                                React.createElement("label", { className: styles.label },
                                    t.size,
                                    React.createElement("input", { type: "number", min: "18", max: "180", value: s.fontSize, onChange: e => patchText(k, { fontSize: Math.max(18, Math.min(180, +e.target.value || 18)) }) })),
                                React.createElement("label", { className: styles.label },
                                    t.lineHeight,
                                    React.createElement("input", { "data-testid": `tool019-${k}-line-height`, type: "number", min: "1", max: "1.8", step: "0.05", value: s.lineHeight, onChange: e => patchText(k, { lineHeight: Math.max(1, Math.min(1.8, +e.target.value || 1.18)) }) }))),
                            React.createElement("label", { className: styles.label },
                                t.width,
                                React.createElement("input", { type: "number", min: "240", max: "1200", value: Math.round(s.maxWidth), onChange: e => patchText(k, { maxWidth: Math.max(240, Math.min(1200, +e.target.value || 240)) }) })),
                            React.createElement("label", { className: styles.label },
                                t.font,
                                React.createElement("select", { "data-testid": `tool019-${k}-font`, value: s.font, onChange: e => patchText(k, { font: e.target.value }) },
                                    React.createElement("option", { value: "sans" }, locale === 'ko' ? '기본 고딕' : locale === 'ja' ? '標準ゴシック' : 'Sans'),
                                    React.createElement("option", { value: "boldSans" }, locale === 'ko' ? '굵은 고딕' : locale === 'ja' ? '太字ゴシック' : 'Bold Sans'),
                                    React.createElement("option", { value: "serif" }, locale === 'ko' ? '세리프' : locale === 'ja' ? 'セリフ' : 'Serif'),
                                    React.createElement("option", { value: "impact" }, locale === 'ko' ? '임팩트 계열' : locale === 'ja' ? 'インパクト系' : 'Impact'))),
                            React.createElement("label", { className: styles.check },
                                React.createElement("input", { type: "checkbox", checked: s.bold, onChange: e => patchText(k, { bold: e.target.checked }) }),
                                t.bold),
                            React.createElement("label", { className: styles.label },
                                t.color,
                                React.createElement("input", { type: "color", value: s.color, onChange: e => patchText(k, { color: e.target.value }) })),
                            React.createElement("div", { className: styles.seg }, ['left', 'center', 'right'].map(a => React.createElement("button", { key: a, className: s.align === a ? styles.active : '', onClick: () => patchText(k, { align: a }) }, a === 'left' ? '←' : a === 'center' ? '↔' : '→'))),
                            React.createElement("label", { className: styles.label }, t.position),
                            React.createElement("div", { className: styles.posGrid }, [['left', 'top'], ['center', 'top'], ['right', 'top'], ['left', 'middle'], ['center', 'middle'], ['right', 'middle'], ['left', 'bottom'], ['center', 'bottom'], ['right', 'bottom']].map(([h, v]) => React.createElement("button", { key: `${h}-${v}`, className: styles.button, onClick: () => quickPosition(k, h, v) },
                                h === 'left' ? '←' : h === 'center' ? '•' : '→',
                                " ",
                                v === 'top' ? '↑' : v === 'middle' ? '•' : '↓'))),
                            React.createElement("button", { className: styles.button, onClick: () => resetTextPosition(k) }, t.positionReset),
                            React.createElement("label", { className: styles.check },
                                React.createElement("input", { type: "checkbox", checked: s.outline, onChange: e => patchText(k, { outline: e.target.checked }) }),
                                t.outline),
                            s.outline && React.createElement("div", { className: styles.two },
                                React.createElement("label", { className: styles.label },
                                    t.outlineWidth,
                                    React.createElement("input", { type: "number", min: "1", max: "20", value: s.outlineWidth, onChange: e => patchText(k, { outlineWidth: +e.target.value || 1 }) })),
                                React.createElement("label", { className: styles.label },
                                    t.outlineColor,
                                    React.createElement("input", { type: "color", value: s.outlineColor, onChange: e => patchText(k, { outlineColor: e.target.value }) }))),
                            React.createElement("label", { className: styles.check },
                                React.createElement("input", { type: "checkbox", checked: s.shadow, onChange: e => patchText(k, { shadow: e.target.checked }) }),
                                t.shadow),
                            s.shadow && React.createElement("div", { className: styles.shadowGrid },
                                React.createElement("label", { className: styles.label },
                                    t.shadowColor,
                                    React.createElement("input", { "data-testid": `tool019-${k}-shadow-color`, type: "color", value: s.shadowColor, onChange: e => patchText(k, { shadowColor: e.target.value }) })),
                                React.createElement("label", { className: styles.label },
                                    t.shadowOpacity,
                                    React.createElement("input", { "data-testid": `tool019-${k}-shadow-opacity`, type: "number", min: "0", max: "100", value: s.shadowOpacity, onChange: e => patchText(k, { shadowOpacity: Math.max(0, Math.min(100, +e.target.value || 0)) }) })),
                                React.createElement("label", { className: styles.label },
                                    t.shadowBlur,
                                    React.createElement("input", { "data-testid": `tool019-${k}-shadow-blur`, type: "number", min: "0", max: "40", value: s.shadowBlur, onChange: e => patchText(k, { shadowBlur: Math.max(0, Math.min(40, +e.target.value || 0)) }) })),
                                React.createElement("label", { className: styles.label },
                                    t.shadowX,
                                    React.createElement("input", { "data-testid": `tool019-${k}-shadow-x`, type: "number", min: "-40", max: "40", value: s.shadowX, onChange: e => patchText(k, { shadowX: Math.max(-40, Math.min(40, +e.target.value || 0)) }) })),
                                React.createElement("label", { className: styles.label },
                                    t.shadowY,
                                    React.createElement("input", { "data-testid": `tool019-${k}-shadow-y`, type: "number", min: "-40", max: "40", value: s.shadowY, onChange: e => patchText(k, { shadowY: Math.max(-40, Math.min(40, +e.target.value || 0)) }) }))),
                            React.createElement("label", { className: styles.check },
                                React.createElement("input", { type: "checkbox", checked: s.textBackground, onChange: e => patchText(k, { textBackground: e.target.checked }) }),
                                t.textBg),
                            s.textBackground && React.createElement("div", { className: styles.shadowGrid },
                                React.createElement("label", { className: styles.label },
                                    t.textBgColor,
                                    React.createElement("input", { "data-testid": `tool019-${k}-text-bg-color`, type: "color", value: s.textBackgroundColor, onChange: e => patchText(k, { textBackgroundColor: e.target.value }) })),
                                React.createElement("label", { className: styles.label },
                                    t.textBgOpacity,
                                    React.createElement("input", { "data-testid": `tool019-${k}-text-bg-opacity`, type: "number", min: "0", max: "100", value: s.textBackgroundOpacity, onChange: e => patchText(k, { textBackgroundOpacity: Math.max(0, Math.min(100, +e.target.value || 0)) }) })),
                                React.createElement("label", { className: styles.label },
                                    t.textBgPadding,
                                    React.createElement("input", { "data-testid": `tool019-${k}-text-bg-padding`, type: "number", min: "0", max: "60", value: s.textBackgroundPadding, onChange: e => patchText(k, { textBackgroundPadding: Math.max(0, Math.min(60, +e.target.value || 0)) }) })))); }),
                        React.createElement("div", { className: `${styles.section} ${styles.mobilePanel} ${mobile === 'output' ? styles.active : ''}` },
                            React.createElement("h4", null, t.output),
                            React.createElement("label", { className: styles.label },
                                t.resolution,
                                React.createElement("select", { "data-testid": "tool019-resolution", value: state.resolution, onChange: e => commit({ resolution: e.target.value }) },
                                    React.createElement("option", { value: "standard" }, t.standard),
                                    React.createElement("option", { value: "high" }, t.high))),
                            React.createElement("label", { className: styles.label },
                                t.format,
                                React.createElement("select", { value: state.format, onChange: e => { const f = e.target.value; commit({ format: f, filename: state.filename.replace(/\.(jpg|png)$/i, '') + '.' + f }); } },
                                    React.createElement("option", { value: "jpg" }, "JPG"),
                                    React.createElement("option", { value: "png" }, "PNG"))),
                            state.format === 'jpg' && React.createElement(React.Fragment, null,
                                React.createElement("label", { className: styles.label },
                                    t.quality,
                                    React.createElement("input", { "data-testid": "tool019-quality", type: "range", min: "60", max: "100", value: state.quality, onChange: e => commit({ quality: +e.target.value }) })),
                                React.createElement("button", { "data-testid": "tool019-fit-2mb", type: "button", className: styles.button, onClick: fitUnder2MB }, t.fit2mb)),
                            React.createElement("label", { className: styles.label },
                                t.filename,
                                React.createElement("input", { "data-testid": "tool019-filename", value: state.filename, onChange: e => setState(s => ({ ...s, filename: e.target.value })) })))))),
            React.createElement("section", { className: `${styles.card} toolbox-workbench-result-card`, "data-testid": "tool019-output" },
                React.createElement("div", { className: styles.info },
                    React.createElement("div", null,
                        React.createElement("span", null, locale === 'ko' ? '결과 크기' : locale === 'ja' ? '出力サイズ' : 'Result Size'),
                        React.createElement("strong", { "data-testid": "tool019-result-size" }, state.resolution === 'high' ? '3840 × 2160' : '1280 × 720')),
                    React.createElement("div", null,
                        React.createElement("span", null, locale === 'ko' ? '비율' : locale === 'ja' ? '比率' : 'Ratio'),
                        React.createElement("strong", null, "16:9")),
                    React.createElement("div", null,
                        React.createElement("span", null, t.format),
                        React.createElement("strong", null, state.format.toUpperCase())),
                    state.format === 'jpg' && React.createElement("div", null,
                        React.createElement("span", null, t.quality),
                        React.createElement("strong", { "data-testid": "tool019-result-quality" }, state.quality)),
                    React.createElement("div", null,
                        React.createElement("span", null, locale === 'ko' ? 'YouTube 모바일 참고' : locale === 'ja' ? 'YouTubeモバイル参考' : 'YouTube mobile reference'),
                        React.createElement("strong", null,
                            TOOL019_PLATFORM_GUIDELINE.mobileVideoThumbnailMaxBytes / 1024 / 1024,
                            " MB")),
                    React.createElement("div", null,
                        React.createElement("span", null, locale === 'ko' ? 'YouTube 데스크톱 참고' : locale === 'ja' ? 'YouTubeデスクトップ参考' : 'YouTube desktop reference'),
                        React.createElement("strong", null,
                            TOOL019_PLATFORM_GUIDELINE.desktopVideoThumbnailMaxBytes / 1024 / 1024,
                            " MB")),
                    React.createElement("div", null,
                        React.createElement("span", null, t.fileSize),
                        React.createElement("strong", { "data-testid": "tool019-file-size" }, blobSize == null ? '—' : blobSize < 1024 * 1024 ? `${(blobSize / 1024).toFixed(0)} KB` : `${(blobSize / 1024 / 1024).toFixed(2)} MB`))),
                React.createElement("p", { className: styles.caption }, locale === 'ko' ? '가독성 안전 가이드는 YouTube 공식 픽셀 규격이 아닌 편집 보조 가이드이며 최종 이미지에는 포함되지 않습니다. YouTube 공식 참고: 3840×2160 권장, 모바일 2MB·데스크톱 50MB 제한(2026-08-09 확인). 업로드 전 최신 공식 안내를 다시 확인하세요.' : locale === 'ja' ? 'セーフコンテンツガイドはYouTube公式のピクセル規格ではない編集補助ガイドで、出力画像には含まれません。YouTube公式参考: 3840×2160推奨、モバイル2MB・デスクトップ50MB上限（2026-08-09確認）。アップロード前に最新公式案内を再確認してください。' : 'The Safe Content Guide is an editing aid, not an official YouTube pixel-safe-area specification, and is not included in the output. YouTube reference: 3840×2160 recommended, 2 MB mobile and 50 MB desktop limits (verified 2026-08-09). Recheck the latest official guidance before upload.'),
                blobSize !== null && React.createElement("p", { "data-testid": "tool019-platform-size-status", className: blobSize > TOOL019_PLATFORM_GUIDELINE.mobileVideoThumbnailMaxBytes ? styles.warn : styles.status }, blobSize > TOOL019_PLATFORM_GUIDELINE.desktopVideoThumbnailMaxBytes ? (locale === 'ko' ? '현재 파일은 YouTube 데스크톱 참고 제한을 넘습니다.' : locale === 'ja' ? '現在のファイルはYouTubeデスクトップ参考上限を超えています。' : 'Current file exceeds the YouTube desktop reference limit.') : blobSize > TOOL019_PLATFORM_GUIDELINE.mobileVideoThumbnailMaxBytes ? (locale === 'ko' ? '현재 파일은 모바일 2MB 참고 제한을 넘을 수 있습니다.' : locale === 'ja' ? '現在のファイルはモバイル2MB参考上限を超える可能性があります。' : 'Current file exceeds the 2 MB mobile reference limit.') : (locale === 'ko' ? '현재 파일은 모바일 참고 제한 이내입니다.' : locale === 'ja' ? '現在のファイルはモバイル参考上限以内です。' : 'Current file is within the mobile reference limit.')),
                React.createElement("div", { className: styles.actions },
                    React.createElement("button", { "data-testid": "tool019-download", className: `${styles.primary} toolbox-primary-action`, onClick: download }, downloaded ? t.again : t.download),
                    React.createElement("button", { className: styles.button, onClick: reset }, t.reset)),
                React.createElement("p", { "data-testid": "tool019-status", className: styles.status, "aria-live": "polite" }, status),
                error && React.createElement("p", { className: styles.error, role: "alert" }, error))));
}
