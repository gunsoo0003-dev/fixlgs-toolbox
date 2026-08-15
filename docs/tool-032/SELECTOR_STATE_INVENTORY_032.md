# TOOL 032 selector / state inventory

| state | selector | 의미 |
|---|---|---|
| initial | `[data-testid="tool032-root"]` | 032 root + limit attributes |
| initial | `[data-testid="tool032-dropzone"]` | PDF drop/choose |
| initial | `[data-testid="tool032-file-input"]` | single PDF input |
| upload error | `[data-testid="tool032-status"][role="alert"]` | 제품 오류 |
| ready | `[data-testid="tool032-file-info"]` | 업로드 후 compact 파일 카드 |
| ready | `[data-testid="tool032-workspace"]` | PDF 정상 parsing 후만 존재 + `data-drop-target="pdf-replace"` |
| ready | `[data-testid="tool032-signature-panel"]` | draw/image mode |
| ready | `[data-testid="tool032-preview-panel"]` | current PDF page preview |
| ready | `[data-testid="tool032-output-panel"]` | page scope / filename / action |
| draw | `[data-testid="tool032-draw-canvas"]` | Pointer Events signature canvas |
| image | `[data-testid="tool032-signature-input"]` | PNG/JPG/WebP input |
| signature ready | `[data-testid="tool032-signature-overlay"]` | draggable/resizable visual overlay |
| custom scope | `[data-testid="tool032-range"]` | custom range text input |
| processing | `[data-testid="tool032-create"]` disabled + status | real page-progress state |
| result | `[data-testid="tool032-result"]` | pageCount / applied pages / filename |
| result | `[data-testid="tool032-download"]` | result PDF download |

동적 selector를 초기 필수 selector로 가정하지 않는다. `workspace`, signature overlay, result는 각 상태에서만 존재한다.

- 최신 031 기준: 초기 Dropzone은 업로드 후 제거되고 compact 파일 카드로 전환한다. 파일 카드와 workspace는 `dragActive = dragging || workspaceDragging` 상태를 공유한다.
