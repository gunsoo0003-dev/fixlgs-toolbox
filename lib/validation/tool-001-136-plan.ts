/**
 * 001~136 선제 검수 계획. 실제 UI 선택자와 고유 기대값은 각 도구 전달서 확정 후 연결한다.
 * 이 파일은 기존 통과 검수기를 교체하지 않고 신규 도구 선제 검수 조립에만 사용한다.
 */
export type ValidationPlanTool = {
  number: string; category: string; name: string; features: readonly string[];
  archetype: string; profiles: readonly string[]; anticipatedChecks: readonly string[];
  limitDimensions: readonly string[]; status: "implemented" | "planned";
};

export const validationPlanTools: readonly ValidationPlanTool[] = [
  {
    "number": "001",
    "category": "A",
    "name": "JPG·PNG·WebP 이미지 변환기",
    "features": [
      "JPG·PNG·WebP 상호 변환",
      "출력 품질",
      "투명 배경 처리",
      "여러 파일 일괄 변환",
      "ZIP 다운로드"
    ],
    "archetype": "image-batch-convert",
    "status": "implemented",
    "profiles": [
      "accessibility",
      "image-file",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "002",
    "category": "A",
    "name": "HEIC·AVIF 이미지 변환기",
    "features": [
      "HEIC → JPG·PNG",
      "AVIF → JPG·PNG",
      "JPG·PNG → AVIF",
      "일괄 변환",
      "출력 품질 설정"
    ],
    "archetype": "image-batch-convert",
    "status": "implemented",
    "profiles": [
      "accessibility",
      "image-file",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "003",
    "category": "A",
    "name": "SVG·BMP·TIFF 이미지 변환기",
    "features": [
      "SVG → PNG·JPG",
      "BMP → JPG·PNG",
      "TIFF → JPG·PNG",
      "출력 해상도",
      "배경색·투명 배경"
    ],
    "archetype": "image-batch-convert",
    "status": "implemented",
    "profiles": [
      "accessibility",
      "image-file",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "004",
    "category": "A",
    "name": "이미지 압축기",
    "features": [
      "JPG·PNG·WebP 압축",
      "압축 강도",
      "전후 용량 비교",
      "화질 비교",
      "일괄 압축"
    ],
    "archetype": "image-batch-compress",
    "status": "implemented",
    "profiles": [
      "accessibility",
      "image-file",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "005",
    "category": "A",
    "name": "목표 용량 이미지 압축기",
    "features": [
      "100KB·300KB·500KB·1MB 이하",
      "사용자 지정 용량",
      "자동 품질 반복 조정",
      "목표 달성 여부 표시"
    ],
    "archetype": "image-target-compress",
    "status": "implemented",
    "profiles": [
      "accessibility",
      "image-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "006",
    "category": "A",
    "name": "이미지 크기 변경기",
    "features": [
      "픽셀 크기",
      "퍼센트 크기",
      "비율 유지",
      "가로·세로 자동 계산",
      "일괄 크기 변경"
    ],
    "archetype": "image-batch-resize",
    "status": "implemented",
    "profiles": [
      "accessibility",
      "image-file",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "007",
    "category": "A",
    "name": "웹 이미지 최적화기",
    "features": [
      "WebP·AVIF 추천 변환",
      "최대 해상도 제한",
      "메타데이터 제거",
      "모바일용 최적화",
      "예상 절감 용량"
    ],
    "archetype": "image-batch-optimize",
    "status": "implemented",
    "profiles": [
      "accessibility",
      "image-file",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "008",
    "category": "B",
    "name": "이미지 자르기·회전 도구",
    "features": [
      "자유 자르기",
      "1:1·4:3·16:9·9:16",
      "90도·180도 회전",
      "자유 각도",
      "좌우·상하 반전"
    ],
    "archetype": "canvas-image-editor",
    "status": "implemented",
    "profiles": [
      "accessibility",
      "image-file",
      "canvas-editor"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak",
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration"
    ]
  },
  {
    "number": "009",
    "category": "B",
    "name": "이미지 밝기·색상 보정기",
    "features": [
      "밝기",
      "대비",
      "채도",
      "색온도",
      "선명도",
      "흑백·세피아"
    ],
    "archetype": "canvas-image-filter",
    "status": "implemented",
    "profiles": [
      "accessibility",
      "image-file",
      "canvas-editor"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak",
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration"
    ]
  },
  {
    "number": "010",
    "category": "B",
    "name": "이미지 모자이크·블러 도구",
    "features": [
      "선택 영역 모자이크",
      "선택 영역 블러",
      "전체 픽셀화",
      "개인정보 가림",
      "강도 조절"
    ],
    "archetype": "canvas-image-editor",
    "status": "implemented",
    "profiles": [
      "accessibility",
      "image-file",
      "canvas-editor"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak",
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration"
    ]
  },
  {
    "number": "011",
    "category": "B",
    "name": "이미지 여백·배경 추가기",
    "features": [
      "상하·좌우 여백",
      "정사각형 맞춤",
      "단색 배경",
      "투명 배경",
      "블러 배경"
    ],
    "archetype": "canvas-image-compose",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file",
      "canvas-editor"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak",
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration"
    ]
  },
  {
    "number": "012",
    "category": "B",
    "name": "이미지 테두리·둥근 모서리 도구",
    "features": [
      "테두리 색상·두께",
      "둥근 모서리",
      "원형 이미지",
      "그림자",
      "배경 여백"
    ],
    "archetype": "canvas-image-compose",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file",
      "canvas-editor"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak",
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration"
    ]
  },
  {
    "number": "013",
    "category": "B",
    "name": "이미지 합치기",
    "features": [
      "세로 합치기",
      "가로 합치기",
      "이미지 순서 변경",
      "이미지 간격",
      "배경색"
    ],
    "archetype": "multi-image-compose",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file",
      "canvas-editor",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak",
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration"
    ]
  },
  {
    "number": "014",
    "category": "B",
    "name": "이미지 콜라주 만들기",
    "features": [
      "2·3·4분할",
      "격자형",
      "이미지 비율 맞춤",
      "여백·테두리",
      "배경색"
    ],
    "archetype": "multi-image-compose",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file",
      "canvas-editor",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak",
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration"
    ]
  },
  {
    "number": "015",
    "category": "B",
    "name": "전후 비교 이미지 만들기",
    "features": [
      "좌우 비교",
      "상하 비교",
      "Before·After 문구",
      "중앙 구분선",
      "크기 자동 맞춤"
    ],
    "archetype": "multi-image-compose",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file",
      "canvas-editor",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak",
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration"
    ]
  },
  {
    "number": "016",
    "category": "B",
    "name": "이미지에 글자 넣기",
    "features": [
      "제목·본문",
      "날짜·위치",
      "글자 크기·정렬",
      "외곽선·그림자",
      "위치 이동"
    ],
    "archetype": "canvas-image-editor",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file",
      "canvas-editor"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak",
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration"
    ]
  },
  {
    "number": "017",
    "category": "B",
    "name": "이미지 워터마크 넣기",
    "features": [
      "텍스트 워터마크",
      "로고 워터마크",
      "반복 워터마크",
      "위치·투명도",
      "여러 이미지 일괄 처리"
    ],
    "archetype": "image-batch-overlay",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file",
      "canvas-editor",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak",
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration"
    ]
  },
  {
    "number": "018",
    "category": "B",
    "name": "이미지 정보·메타데이터 검사기",
    "features": [
      "픽셀·해상도",
      "DPI·PPI",
      "예상 인쇄 크기",
      "촬영일·카메라",
      "GPS·EXIF",
      "메타데이터 제거"
    ],
    "archetype": "file-inspector",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "019",
    "category": "C",
    "name": "유튜브 썸네일 제작기",
    "features": [
      "1280×720",
      "제목·부제",
      "배경 이미지",
      "외곽선·그림자",
      "안전영역",
      "파일 용량 확인"
    ],
    "archetype": "template-image-maker",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "020",
    "category": "C",
    "name": "유튜브 채널 배너 제작기",
    "features": [
      "PC·모바일·TV 안전영역",
      "로고·제목",
      "배경 이미지",
      "규격 미리보기"
    ],
    "archetype": "template-image-maker",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "021",
    "category": "C",
    "name": "SNS 이미지 제작기",
    "features": [
      "인스타그램 게시물",
      "인스타그램 스토리",
      "Facebook",
      "X",
      "LinkedIn",
      "동일 디자인 규격별 출력"
    ],
    "archetype": "template-image-maker",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "022",
    "category": "C",
    "name": "블로그·오픈그래프 이미지 제작기",
    "features": [
      "네이버 블로그",
      "구글 블로그",
      "웹사이트 대표 이미지",
      "1200×630 오픈그래프",
      "제목·설명·로고"
    ],
    "archetype": "template-image-maker",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "023",
    "category": "C",
    "name": "앱 아이콘·파비콘 생성기",
    "features": [
      "Android 아이콘",
      "PWA 아이콘",
      "192×192·512×512",
      "ICO",
      "파비콘 묶음 ZIP"
    ],
    "archetype": "image-asset-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak",
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "024",
    "category": "C",
    "name": "앱스토어 스크린샷 제작기",
    "features": [
      "휴대폰 프레임",
      "제목·설명",
      "배경색",
      "세로·가로 규격",
      "한국어·영어·일본어 버전",
      "여러 장 일괄 출력"
    ],
    "archetype": "template-image-maker",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "025",
    "category": "C",
    "name": "증명사진·여권사진 제작기",
    "features": [
      "증명사진",
      "여권사진",
      "취업사진",
      "국가별 규격",
      "얼굴 위치 안내",
      "A4 인쇄 배치"
    ],
    "archetype": "template-image-maker",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak"
    ]
  },
  {
    "number": "026",
    "category": "D",
    "name": "이미지 PDF 변환기",
    "features": [
      "JPG·PNG → PDF",
      "여러 이미지 → PDF",
      "이미지 순서 변경",
      "A4·Letter",
      "여백 설정"
    ],
    "archetype": "pdf-create",
    "status": "planned",
    "profiles": [
      "accessibility",
      "pdf",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "pdf_decode",
      "page_count_range",
      "encrypted_pdf",
      "page_order",
      "pdf_output_reopen",
      "font_image_resource_cleanup",
      "pdf_limit",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "page_count",
      "pdf_size",
      "resource_count",
      "output_duration"
    ]
  },
  {
    "number": "027",
    "category": "D",
    "name": "PDF 이미지 변환기",
    "features": [
      "PDF → JPG·PNG",
      "페이지 선택",
      "해상도 선택",
      "ZIP 저장"
    ],
    "archetype": "pdf-render",
    "status": "planned",
    "profiles": [
      "accessibility",
      "pdf",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "pdf_decode",
      "page_count_range",
      "encrypted_pdf",
      "page_order",
      "pdf_output_reopen",
      "font_image_resource_cleanup",
      "pdf_limit",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "page_count",
      "pdf_size",
      "resource_count",
      "output_duration"
    ]
  },
  {
    "number": "028",
    "category": "D",
    "name": "PDF 합치기",
    "features": [
      "여러 PDF 병합",
      "파일 순서 변경",
      "페이지 미리보기",
      "결과 파일명 설정"
    ],
    "archetype": "pdf-multi-file",
    "status": "planned",
    "profiles": [
      "accessibility",
      "image-file",
      "multi-file",
      "pdf"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "mime_extension_decode",
      "zero_byte_corrupt_unsupported",
      "uppercase_extension",
      "transparency",
      "exif_orientation",
      "color_profile",
      "object_url_cleanup",
      "output_redecode",
      "pixel_dimensions_format_quality",
      "large_image_memory",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit",
      "pdf_decode",
      "page_count_range",
      "encrypted_pdf",
      "page_order",
      "pdf_output_reopen",
      "font_image_resource_cleanup",
      "pdf_limit"
    ],
    "limitDimensions": [
      "pixel_count",
      "max_side",
      "file_size",
      "batch_count",
      "memory_peak",
      "page_count",
      "pdf_size",
      "resource_count",
      "output_duration"
    ]
  },
  {
    "number": "029",
    "category": "D",
    "name": "PDF 분할·페이지 추출기",
    "features": [
      "페이지 범위 분할",
      "특정 페이지 추출",
      "페이지별 개별 PDF",
      "홀수·짝수 분리"
    ],
    "archetype": "pdf-page-edit",
    "status": "planned",
    "profiles": [
      "accessibility",
      "pdf",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "pdf_decode",
      "page_count_range",
      "encrypted_pdf",
      "page_order",
      "pdf_output_reopen",
      "font_image_resource_cleanup",
      "pdf_limit",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "page_count",
      "pdf_size",
      "resource_count",
      "output_duration"
    ]
  },
  {
    "number": "030",
    "category": "D",
    "name": "PDF 페이지 정리 도구",
    "features": [
      "페이지 삭제",
      "순서 변경",
      "복제",
      "회전",
      "역순 정렬",
      "빈 페이지 추가"
    ],
    "archetype": "pdf-page-edit",
    "status": "planned",
    "profiles": [
      "accessibility",
      "pdf",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "pdf_decode",
      "page_count_range",
      "encrypted_pdf",
      "page_order",
      "pdf_output_reopen",
      "font_image_resource_cleanup",
      "pdf_limit",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "page_count",
      "pdf_size",
      "resource_count",
      "output_duration"
    ]
  },
  {
    "number": "031",
    "category": "D",
    "name": "PDF 페이지 번호·워터마크 도구",
    "features": [
      "페이지 번호",
      "시작 번호",
      "머리말·꼬리말",
      "텍스트·로고 워터마크",
      "위치·투명도"
    ],
    "archetype": "pdf-overlay",
    "status": "planned",
    "profiles": [
      "accessibility",
      "canvas-editor",
      "pdf",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides",
      "pdf_decode",
      "page_count_range",
      "encrypted_pdf",
      "page_order",
      "pdf_output_reopen",
      "font_image_resource_cleanup",
      "pdf_limit",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration",
      "page_count",
      "pdf_size",
      "resource_count",
      "output_duration"
    ]
  },
  {
    "number": "032",
    "category": "D",
    "name": "PDF 서명 넣기",
    "features": [
      "서명 그리기",
      "서명 이미지",
      "위치·크기",
      "여러 페이지 적용"
    ],
    "archetype": "pdf-overlay",
    "status": "planned",
    "profiles": [
      "accessibility",
      "canvas-editor",
      "pdf",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides",
      "pdf_decode",
      "page_count_range",
      "encrypted_pdf",
      "page_order",
      "pdf_output_reopen",
      "font_image_resource_cleanup",
      "pdf_limit",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration",
      "page_count",
      "pdf_size",
      "resource_count",
      "output_duration"
    ]
  },
  {
    "number": "033",
    "category": "D",
    "name": "PDF 압축기",
    "features": [
      "기본·강한 압축",
      "이미지 품질",
      "전후 용량 비교",
      "결과 미리보기"
    ],
    "archetype": "pdf-compress",
    "status": "planned",
    "profiles": [
      "accessibility",
      "pdf",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "pdf_decode",
      "page_count_range",
      "encrypted_pdf",
      "page_order",
      "pdf_output_reopen",
      "font_image_resource_cleanup",
      "pdf_limit",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "page_count",
      "pdf_size",
      "resource_count",
      "output_duration"
    ]
  },
  {
    "number": "034",
    "category": "D",
    "name": "PDF 비밀번호·메타데이터 도구",
    "features": [
      "비밀번호 설정",
      "비밀번호 제거",
      "제목·작성자 확인",
      "메타데이터 수정·제거"
    ],
    "archetype": "pdf-security-metadata",
    "status": "planned",
    "profiles": [
      "accessibility",
      "pdf",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "pdf_decode",
      "page_count_range",
      "encrypted_pdf",
      "page_order",
      "pdf_output_reopen",
      "font_image_resource_cleanup",
      "pdf_limit",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "page_count",
      "pdf_size",
      "resource_count",
      "output_duration"
    ]
  },
  {
    "number": "035",
    "category": "D",
    "name": "PDF 텍스트·이미지 추출기",
    "features": [
      "텍스트 추출",
      "이미지 추출",
      "페이지별 구분",
      "TXT·ZIP 저장"
    ],
    "archetype": "pdf-extract",
    "status": "planned",
    "profiles": [
      "accessibility",
      "pdf",
      "multi-file"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "pdf_decode",
      "page_count_range",
      "encrypted_pdf",
      "page_order",
      "pdf_output_reopen",
      "font_image_resource_cleanup",
      "pdf_limit",
      "input_order",
      "output_order",
      "duplicate_filename",
      "partial_failure",
      "cancel_mid_process",
      "zip_output",
      "batch_limit"
    ],
    "limitDimensions": [
      "page_count",
      "pdf_size",
      "resource_count",
      "output_duration"
    ]
  },
  {
    "number": "036",
    "category": "E",
    "name": "글자 수·문서 통계 계산기",
    "features": [
      "공백 포함·제외 글자 수",
      "단어·문장·문단·줄 수",
      "바이트 수",
      "예상 읽기시간"
    ],
    "archetype": "text-analyzer",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "037",
    "category": "E",
    "name": "텍스트 공백·줄바꿈 정리기",
    "features": [
      "연속 공백 제거",
      "앞뒤 공백 제거",
      "탭 제거",
      "빈 줄 제거",
      "줄바꿈 통일"
    ],
    "archetype": "text-transform",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "038",
    "category": "E",
    "name": "대소문자·문장 형식 변환기",
    "features": [
      "대문자",
      "소문자",
      "제목형",
      "문장형",
      "첫 글자 대문자"
    ],
    "archetype": "text-transform",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "039",
    "category": "E",
    "name": "목록 정렬·중복 제거기",
    "features": [
      "중복 줄 제거",
      "가나다·알파벳·숫자순",
      "역순",
      "무작위 섞기"
    ],
    "archetype": "list-transform",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "040",
    "category": "E",
    "name": "구분자·목록 변환기",
    "features": [
      "줄바꿈 ↔ 쉼표",
      "탭 변환",
      "사용자 구분자",
      "따옴표 추가",
      "번호·글머리표 추가"
    ],
    "archetype": "list-transform",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "041",
    "category": "E",
    "name": "텍스트 추출기",
    "features": [
      "숫자",
      "한글·영어",
      "이메일",
      "URL",
      "전화번호",
      "해시태그"
    ],
    "archetype": "text-extract",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "042",
    "category": "E",
    "name": "텍스트 찾기·바꾸기",
    "features": [
      "단어 일괄 변경",
      "대소문자 구분",
      "여러 단어 동시 변경",
      "변경 횟수"
    ],
    "archetype": "text-transform",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "043",
    "category": "E",
    "name": "두 텍스트 비교기",
    "features": [
      "추가·삭제·변경",
      "줄 단위",
      "단어 단위",
      "비교 결과 복사"
    ],
    "archetype": "text-compare",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "044",
    "category": "E",
    "name": "키워드 빈도·중복 분석기",
    "features": [
      "단어 빈도",
      "키워드 밀도",
      "반복 문장",
      "중복 문장",
      "상위 키워드"
    ],
    "archetype": "text-analyzer",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "045",
    "category": "F",
    "name": "날짜 차이 계산기",
    "features": [
      "두 날짜 사이 일수",
      "주·월·연",
      "시작일 포함 여부",
      "평일·주말 수"
    ],
    "archetype": "date-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "046",
    "category": "F",
    "name": "날짜 더하기·빼기 계산기",
    "features": [
      "며칠 후·전",
      "몇 주·개월·년 후",
      "결과 날짜와 요일"
    ],
    "archetype": "date-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "047",
    "category": "F",
    "name": "디데이·기념일 계산기",
    "features": [
      "D-day",
      "지난 날짜",
      "생일까지",
      "반복 기념일"
    ],
    "archetype": "date-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "048",
    "category": "F",
    "name": "나이·생후기간 계산기",
    "features": [
      "만나이",
      "연나이",
      "생후 일수",
      "다음 생일까지"
    ],
    "archetype": "date-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "049",
    "category": "F",
    "name": "근속·재직기간 계산기",
    "features": [
      "입사·퇴사 기간",
      "연·월·일",
      "여러 경력 합산"
    ],
    "archetype": "date-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "050",
    "category": "F",
    "name": "평일·영업일 계산기",
    "features": [
      "주말 제외",
      "공휴일 제외",
      "목표 영업일 후 날짜",
      "한국·미국·일본"
    ],
    "archetype": "business-day-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "051",
    "category": "F",
    "name": "시간 계산기",
    "features": [
      "시간 더하기·빼기",
      "두 시각 차이",
      "자정 넘김",
      "12·24시간 변환"
    ],
    "archetype": "time-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "052",
    "category": "F",
    "name": "세계시간·타임존 변환기",
    "features": [
      "도시 선택",
      "UTC",
      "여러 도시 비교",
      "공통 회의시간"
    ],
    "archetype": "timezone-tool",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "053",
    "category": "F",
    "name": "Unix Timestamp 변환기",
    "features": [
      "Timestamp → 날짜",
      "날짜 → Timestamp",
      "초·밀리초",
      "UTC·현지시간"
    ],
    "archetype": "timestamp-tool",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "054",
    "category": "F",
    "name": "타이머·스톱워치",
    "features": [
      "카운트다운",
      "스톱워치",
      "구간 기록",
      "반복 타이머"
    ],
    "archetype": "timer-stateful",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric",
      "stateful"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit",
      "pause_resume_reset",
      "visibility_background",
      "duplicate_timer_or_state",
      "state_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "055",
    "category": "G",
    "name": "길이·면적·부피 변환기",
    "features": [
      "길이",
      "면적",
      "평·㎡",
      "부피",
      "자주 쓰는 단위 동시 표시"
    ],
    "archetype": "unit-converter",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "056",
    "category": "G",
    "name": "무게·온도·압력 변환기",
    "features": [
      "무게",
      "온도",
      "압력",
      "소수점 설정"
    ],
    "archetype": "unit-converter",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "057",
    "category": "G",
    "name": "속도·연비·에너지 변환기",
    "features": [
      "km/h·mph·m/s",
      "km/L·L/100km·MPG",
      "에너지·전력·마력"
    ],
    "archetype": "unit-converter",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "058",
    "category": "G",
    "name": "데이터·요리 단위 변환기",
    "features": [
      "bit·byte·KB·MB·GB·TB",
      "1000·1024 기준",
      "컵·큰술·작은술·mL"
    ],
    "archetype": "unit-converter",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "059",
    "category": "G",
    "name": "픽셀·인쇄 크기 계산기",
    "features": [
      "pixel·cm·inch",
      "DPI·PPI",
      "예상 인쇄 크기",
      "화면 비율"
    ],
    "archetype": "numeric-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "060",
    "category": "G",
    "name": "신발·의류 사이즈 변환기",
    "features": [
      "한국·미국·영국·유럽·일본",
      "남성·여성·아동",
      "신발·상의·하의"
    ],
    "archetype": "lookup-converter",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "061",
    "category": "G",
    "name": "퍼센트·증감률 계산기",
    "features": [
      "전체의 몇 %",
      "특정 값의 %",
      "증가율·감소율",
      "변화율"
    ],
    "archetype": "numeric-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "062",
    "category": "G",
    "name": "할인 가격 계산기",
    "features": [
      "할인율",
      "할인금액",
      "최종가격",
      "추가 할인"
    ],
    "archetype": "numeric-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "063",
    "category": "G",
    "name": "비율·비례 계산기",
    "features": [
      "비율 단순화",
      "비례식",
      "비례 배분",
      "혼합비"
    ],
    "archetype": "numeric-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "064",
    "category": "G",
    "name": "평균·통계 계산기",
    "features": [
      "평균",
      "가중평균",
      "중앙값",
      "최빈값",
      "범위·분산·표준편차"
    ],
    "archetype": "statistics-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "065",
    "category": "G",
    "name": "분수·소수 계산기",
    "features": [
      "분수 사칙연산",
      "약분",
      "분수 → 소수",
      "소수 → 분수"
    ],
    "archetype": "numeric-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "066",
    "category": "H",
    "name": "부가세 계산기",
    "features": [
      "공급가액 → 부가세",
      "합계금액 → 공급가액",
      "포함·별도"
    ],
    "archetype": "finance-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "067",
    "category": "H",
    "name": "판매가격·마진 계산기",
    "features": [
      "원가",
      "판매가",
      "마진액",
      "마진율",
      "목표 마진 판매가"
    ],
    "archetype": "finance-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "068",
    "category": "H",
    "name": "판매 수수료·정산금 계산기",
    "features": [
      "판매금액",
      "수수료",
      "배송비",
      "기타 비용",
      "정산금·순이익"
    ],
    "archetype": "finance-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "069",
    "category": "H",
    "name": "손익분기점 계산기",
    "features": [
      "고정비",
      "판매가",
      "변동비",
      "상품당 이익",
      "손익분기 판매량·매출"
    ],
    "archetype": "finance-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "070",
    "category": "H",
    "name": "단가 비교 계산기",
    "features": [
      "개당 가격",
      "100g·1kg당",
      "100mL·1L당",
      "묶음상품 비교"
    ],
    "archetype": "comparison-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "071",
    "category": "H",
    "name": "광고·매출 성과 계산기",
    "features": [
      "CTR",
      "CPC",
      "CPM",
      "전환율",
      "CAC",
      "ROAS",
      "ROI",
      "객단가"
    ],
    "archetype": "finance-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "072",
    "category": "H",
    "name": "시급·월급·연봉 환산기",
    "features": [
      "시급",
      "일급",
      "월급",
      "연봉",
      "근무시간 기준 환산"
    ],
    "archetype": "finance-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "073",
    "category": "H",
    "name": "예금·적금 계산기",
    "features": [
      "예금",
      "적금",
      "월 납입",
      "금리",
      "세전·세후 참고값"
    ],
    "archetype": "finance-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "074",
    "category": "H",
    "name": "복리·미래자산 계산기",
    "features": [
      "원금",
      "추가 납입",
      "이율",
      "기간",
      "월·연 복리",
      "목표금액"
    ],
    "archetype": "finance-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "075",
    "category": "H",
    "name": "대출이자 계산기",
    "features": [
      "원리금 균등",
      "원금 균등",
      "만기일시",
      "월별 상환표",
      "총이자"
    ],
    "archetype": "finance-schedule-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "076",
    "category": "H",
    "name": "카드 할부 계산기",
    "features": [
      "구매금액",
      "할부 개월",
      "수수료율",
      "월 납부액",
      "총 수수료"
    ],
    "archetype": "finance-schedule-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "077",
    "category": "H",
    "name": "투자수익률 계산기",
    "features": [
      "매입금액",
      "현재 평가금",
      "보유기간",
      "수익률",
      "연환산수익률"
    ],
    "archetype": "finance-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "078",
    "category": "H",
    "name": "주식 평균단가 계산기",
    "features": [
      "기존 수량·단가",
      "추가 매수",
      "평균단가",
      "손익분기 가격",
      "목표 매도가"
    ],
    "archetype": "finance-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "079",
    "category": "H",
    "name": "배당수익률 계산기",
    "features": [
      "주가",
      "주당 배당금",
      "보유 수량",
      "예상 배당금",
      "배당수익률"
    ],
    "archetype": "finance-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "080",
    "category": "H",
    "name": "임대수익률 계산기",
    "features": [
      "매입가",
      "보증금",
      "월세",
      "관리비·대출이자",
      "표면·실질 수익률"
    ],
    "archetype": "finance-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "081",
    "category": "I",
    "name": "평수·평당가격 계산기",
    "features": [
      "㎡ ↔ 평",
      "공급·전용면적",
      "평당 가격",
      "㎡당 가격"
    ],
    "archetype": "realestate-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "082",
    "category": "I",
    "name": "건폐율·용적률 계산기",
    "features": [
      "대지면적",
      "건축면적",
      "연면적",
      "건폐율·용적률",
      "가능 면적 역산"
    ],
    "archetype": "construction-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "083",
    "category": "I",
    "name": "방·벽·천장 면적 계산기",
    "features": [
      "바닥",
      "벽",
      "천장",
      "문·창문 제외",
      "총 시공면적"
    ],
    "archetype": "construction-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "084",
    "category": "I",
    "name": "페인트·벽지 수량 계산기",
    "features": [
      "도장 면적",
      "도장 횟수",
      "페인트량",
      "벽지 롤 수",
      "손실률"
    ],
    "archetype": "material-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "085",
    "category": "I",
    "name": "장판·타일·마루 수량 계산기",
    "features": [
      "바닥 면적",
      "자재 규격",
      "필요 수량",
      "박스 수",
      "손실률·예상 비용"
    ],
    "archetype": "material-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "086",
    "category": "I",
    "name": "데크·합판·판재 수량 계산기",
    "features": [
      "자재 규격",
      "배치 방향",
      "필요 장수",
      "자투리",
      "예상 비용"
    ],
    "archetype": "material-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "087",
    "category": "I",
    "name": "벽돌·블록 수량 계산기",
    "features": [
      "벽 길이·높이",
      "자재 크기",
      "줄눈",
      "손실률",
      "필요 개수"
    ],
    "archetype": "material-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "088",
    "category": "I",
    "name": "콘크리트 부피 계산기",
    "features": [
      "길이·폭·두께",
      "㎥",
      "여유분",
      "레미콘 참고량"
    ],
    "archetype": "construction-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "089",
    "category": "I",
    "name": "지붕 면적·경사 계산기",
    "features": [
      "폭·길이",
      "지붕 경사",
      "실제 지붕면적",
      "자재 여유분"
    ],
    "archetype": "construction-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "090",
    "category": "I",
    "name": "계단·경사로 계산기",
    "features": [
      "전체 높이",
      "수평거리",
      "경사길이",
      "경사율·경사각",
      "계단 수",
      "단높이·단너비"
    ],
    "archetype": "construction-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "091",
    "category": "I",
    "name": "에어컨·냉난방 용량 계산기",
    "features": [
      "공간 면적",
      "층고",
      "창문·방향",
      "단열",
      "예상 냉난방 용량"
    ],
    "archetype": "reference-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "092",
    "category": "J",
    "name": "일반 QR코드 생성기",
    "features": [
      "URL",
      "텍스트",
      "전화",
      "SMS",
      "이메일",
      "위치",
      "색상·로고"
    ],
    "archetype": "qr-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "093",
    "category": "J",
    "name": "Wi-Fi·연락처 QR코드 생성기",
    "features": [
      "Wi-Fi",
      "연락처",
      "명함",
      "앱 다운로드",
      "인쇄용 저장"
    ],
    "archetype": "qr-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "094",
    "category": "J",
    "name": "바코드 생성기",
    "features": [
      "Code 128",
      "EAN",
      "UPC",
      "ISBN",
      "PNG·SVG"
    ],
    "archetype": "barcode-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security",
      "generator"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size",
      "item_count",
      "layout_count"
    ]
  },
  {
    "number": "095",
    "category": "J",
    "name": "색상 코드·팔레트 도구",
    "features": [
      "HEX·RGB·HSL·HSV·CMYK",
      "보색·유사색",
      "이미지 주요색",
      "팔레트 저장"
    ],
    "archetype": "color-tool",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "096",
    "category": "J",
    "name": "CSS 그라데이션·그림자 생성기",
    "features": [
      "선형·원형 그라데이션",
      "박스 그림자",
      "글자 그림자",
      "테두리",
      "둥근 모서리",
      "CSS 복사"
    ],
    "archetype": "code-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security",
      "generator"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size",
      "item_count",
      "layout_count"
    ]
  },
  {
    "number": "097",
    "category": "J",
    "name": "색상 대비 검사기",
    "features": [
      "글자색·배경색",
      "WCAG 대비",
      "일반·큰 글자",
      "개선 색상"
    ],
    "archetype": "validator-tool",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "098",
    "category": "J",
    "name": "JSON 포맷·검사 도구",
    "features": [
      "JSON 정렬",
      "압축",
      "유효성 검사",
      "오류 위치",
      "트리 보기"
    ],
    "archetype": "structured-data-tool",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "099",
    "category": "J",
    "name": "JSON·CSV·XML·YAML 변환기",
    "features": [
      "형식 상호 변환",
      "파일 업로드",
      "표 보기",
      "결과 저장"
    ],
    "archetype": "structured-data-tool",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "100",
    "category": "J",
    "name": "코드 포맷·압축기",
    "features": [
      "HTML",
      "CSS",
      "JavaScript",
      "SQL",
      "정렬·압축"
    ],
    "archetype": "code-transform",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "101",
    "category": "J",
    "name": "정규식 테스트기",
    "features": [
      "정규식 입력",
      "일치 강조",
      "그룹",
      "플래그",
      "교체 결과"
    ],
    "archetype": "validator-tool",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "102",
    "category": "J",
    "name": "Markdown 편집기",
    "features": [
      "실시간 미리보기",
      "HTML 변환",
      "파일 저장",
      "복사"
    ],
    "archetype": "live-editor",
    "status": "planned",
    "profiles": [
      "accessibility",
      "canvas-editor",
      "text",
      "security",
      "stateful"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "pointer_coordinate_transform",
      "selection_move_resize",
      "undo_redo",
      "zoom_pan",
      "touch_gestures",
      "history_limit",
      "render_boundary",
      "output_without_editor_guides",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "pause_resume_reset",
      "visibility_background",
      "duplicate_timer_or_state",
      "state_limit"
    ],
    "limitDimensions": [
      "object_count",
      "history_steps",
      "pointer_points",
      "render_duration",
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "103",
    "category": "J",
    "name": "Base64·URL·HTML 인코딩 도구",
    "features": [
      "Base64",
      "URL Encode·Decode",
      "HTML Entity",
      "UTF-8"
    ],
    "archetype": "encode-decode",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "104",
    "category": "J",
    "name": "해시·체크섬 생성기",
    "features": [
      "MD5",
      "SHA-1",
      "SHA-256",
      "SHA-512",
      "텍스트·파일"
    ],
    "archetype": "hash-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security",
      "generator"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size",
      "item_count",
      "layout_count"
    ]
  },
  {
    "number": "105",
    "category": "J",
    "name": "비밀번호·UUID 생성기",
    "features": [
      "비밀번호",
      "PIN",
      "UUID",
      "랜덤 문자열",
      "제외 문자"
    ],
    "archetype": "random-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "106",
    "category": "J",
    "name": "개인정보 마스킹 도구",
    "features": [
      "이름",
      "전화번호",
      "이메일",
      "주소",
      "카드번호",
      "사용자 규칙"
    ],
    "archetype": "text-transform",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size"
    ]
  },
  {
    "number": "107",
    "category": "J",
    "name": "메타 태그·검색 미리보기",
    "features": [
      "메타 제목",
      "설명",
      "Google 검색 미리보기",
      "canonical",
      "코드 복사"
    ],
    "archetype": "seo-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security",
      "generator"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size",
      "item_count",
      "layout_count"
    ]
  },
  {
    "number": "108",
    "category": "J",
    "name": "오픈그래프 태그 생성기",
    "features": [
      "제목",
      "설명",
      "이미지",
      "URL",
      "사이트명",
      "SNS 미리보기"
    ],
    "archetype": "seo-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security",
      "generator"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size",
      "item_count",
      "layout_count"
    ]
  },
  {
    "number": "109",
    "category": "J",
    "name": "UTM 링크·URL 슬러그 생성기",
    "features": [
      "UTM 항목",
      "완성 URL",
      "슬러그 변환",
      "특수문자 제거"
    ],
    "archetype": "seo-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security",
      "generator"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size",
      "item_count",
      "layout_count"
    ]
  },
  {
    "number": "110",
    "category": "J",
    "name": "hreflang 코드 생성기",
    "features": [
      "언어·국가",
      "x-default",
      "HTML 코드",
      "사이트맵 코드"
    ],
    "archetype": "seo-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security",
      "generator"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size",
      "item_count",
      "layout_count"
    ]
  },
  {
    "number": "111",
    "category": "J",
    "name": "Schema JSON-LD 생성기",
    "features": [
      "FAQ",
      "Article",
      "Product",
      "LocalBusiness",
      "Breadcrumb"
    ],
    "archetype": "seo-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security",
      "generator"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size",
      "item_count",
      "layout_count"
    ]
  },
  {
    "number": "112",
    "category": "J",
    "name": "robots.txt·sitemap.xml 생성기",
    "features": [
      "검색 허용·차단",
      "사이트맵 주소",
      "URL 목록",
      "XML·TXT 저장"
    ],
    "archetype": "seo-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "text",
      "security",
      "generator"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "unicode_emoji_cjk",
      "whitespace_newline",
      "very_long_text",
      "copy_download",
      "deterministic_output",
      "text_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit"
    ],
    "limitDimensions": [
      "characters",
      "lines",
      "tokens",
      "output_size",
      "item_count",
      "layout_count"
    ]
  },
  {
    "number": "113",
    "category": "K",
    "name": "견적서 생성기",
    "features": [
      "공급자·고객",
      "품목",
      "수량·단가",
      "부가세",
      "PDF·인쇄"
    ],
    "archetype": "document-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "114",
    "category": "K",
    "name": "거래명세서·간이영수증 생성기",
    "features": [
      "거래명세서",
      "영수증",
      "품목·금액",
      "PDF·인쇄"
    ],
    "archetype": "document-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "115",
    "category": "K",
    "name": "근무표·교대표 생성기",
    "features": [
      "직원",
      "근무조",
      "휴무",
      "주간·월간",
      "PDF"
    ],
    "archetype": "document-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "116",
    "category": "K",
    "name": "출석부·명단 생성기",
    "features": [
      "이름",
      "날짜",
      "출석",
      "서명칸",
      "인쇄"
    ],
    "archetype": "document-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "117",
    "category": "K",
    "name": "일정표·체크리스트 생성기",
    "features": [
      "일간·주간·월간",
      "담당자",
      "체크 항목",
      "메모",
      "PDF"
    ],
    "archetype": "document-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "118",
    "category": "K",
    "name": "이름표·주소라벨 생성기",
    "features": [
      "이름표",
      "주소라벨",
      "용지 규격",
      "반복 배치",
      "A4 인쇄"
    ],
    "archetype": "print-layout-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "119",
    "category": "K",
    "name": "달력·노트 용지 생성기",
    "features": [
      "월간·연간 달력",
      "줄노트",
      "방안지",
      "원고지",
      "PDF"
    ],
    "archetype": "print-layout-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "120",
    "category": "K",
    "name": "더치페이·모임비 계산기",
    "features": [
      "총금액",
      "인원",
      "개인별 추가금",
      "일부 인원 제외",
      "반올림"
    ],
    "archetype": "numeric-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "121",
    "category": "K",
    "name": "여행 경비 계산기",
    "features": [
      "교통",
      "숙박",
      "식비",
      "기타 비용",
      "인원 분담",
      "통화"
    ],
    "archetype": "expense-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "122",
    "category": "K",
    "name": "차량 이동비 계산기",
    "features": [
      "거리",
      "연비",
      "유가",
      "통행료·주차비",
      "인원 분담"
    ],
    "archetype": "expense-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "123",
    "category": "K",
    "name": "저장공간·파일 용량 계산기",
    "features": [
      "사진 저장 개수",
      "영상 녹화시간",
      "음악 저장량",
      "해상도·비트레이트"
    ],
    "archetype": "reference-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "124",
    "category": "K",
    "name": "택배·박스 부피 계산기",
    "features": [
      "가로·세로·높이",
      "부피",
      "부피무게",
      "여러 박스 합산"
    ],
    "archetype": "numeric-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "125",
    "category": "K",
    "name": "BMI·적정체중 계산기",
    "features": [
      "BMI",
      "정상 체중 범위",
      "키·체중",
      "참고 안내"
    ],
    "archetype": "health-reference-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "126",
    "category": "K",
    "name": "기초대사량·칼로리 계산기",
    "features": [
      "BMR",
      "활동량",
      "유지 칼로리",
      "목표별 참고량"
    ],
    "archetype": "health-reference-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "127",
    "category": "K",
    "name": "걷기·달리기 운동 계산기",
    "features": [
      "거리·시간·속도",
      "칼로리",
      "km당 페이스",
      "예상 완주시간"
    ],
    "archetype": "health-reference-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "128",
    "category": "K",
    "name": "심박수 운동구간 계산기",
    "features": [
      "나이",
      "최대심박",
      "안정심박",
      "운동강도 구간"
    ],
    "archetype": "health-reference-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "129",
    "category": "K",
    "name": "수면시간 계산기",
    "features": [
      "취침·기상",
      "총 수면시간",
      "수면주기",
      "기상 후보시간"
    ],
    "archetype": "health-reference-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "130",
    "category": "K",
    "name": "랜덤 이름·번호 추첨기",
    "features": [
      "이름·번호",
      "당첨 인원",
      "중복 허용",
      "제외 항목",
      "예비 당첨자"
    ],
    "archetype": "randomizer",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security",
      "stateful"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "pause_resume_reset",
      "visibility_background",
      "duplicate_timer_or_state",
      "state_limit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "131",
    "category": "K",
    "name": "랜덤 팀·순번 나누기",
    "features": [
      "팀 수",
      "팀당 인원",
      "발표 순서",
      "당번",
      "결과 저장"
    ],
    "archetype": "randomizer",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security",
      "stateful"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "pause_resume_reset",
      "visibility_background",
      "duplicate_timer_or_state",
      "state_limit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "132",
    "category": "K",
    "name": "룰렛·주사위·동전 도구",
    "features": [
      "룰렛",
      "가중치",
      "주사위",
      "동전",
      "결과 기록"
    ],
    "archetype": "randomizer",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security",
      "stateful"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "pause_resume_reset",
      "visibility_background",
      "duplicate_timer_or_state",
      "state_limit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "133",
    "category": "K",
    "name": "메뉴·여행지 랜덤 선택기",
    "features": [
      "메뉴",
      "여행지",
      "벌칙",
      "사용자 항목",
      "결과 저장"
    ],
    "archetype": "randomizer",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security",
      "stateful"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit",
      "pause_resume_reset",
      "visibility_background",
      "duplicate_timer_or_state",
      "state_limit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "134",
    "category": "K",
    "name": "빙고판·대진표 생성기",
    "features": [
      "빙고판",
      "토너먼트",
      "부전승",
      "인쇄·PDF"
    ],
    "archetype": "game-bracket-generator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "generator",
      "security"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "deterministic_structure",
      "randomness_policy",
      "copy_download_print",
      "invalid_configuration",
      "output_schema_or_format",
      "generator_limit",
      "injection_escape",
      "unsafe_url",
      "secret_or_sensitive_input",
      "external_request_audit"
    ],
    "limitDimensions": [
      "item_count",
      "layout_count",
      "output_size"
    ]
  },
  {
    "number": "135",
    "category": "K",
    "name": "학점·출석률 계산기",
    "features": [
      "GPA",
      "목표 점수",
      "필요한 다음 점수",
      "출석·지각·결석"
    ],
    "archetype": "education-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  },
  {
    "number": "136",
    "category": "K",
    "name": "공부계획 계산기",
    "features": [
      "시험일까지 남은 날짜",
      "전체 학습량",
      "하루 학습량",
      "휴식일 제외"
    ],
    "archetype": "education-calculator",
    "status": "planned",
    "profiles": [
      "accessibility",
      "numeric"
    ],
    "anticipatedChecks": [
      "label_role_state",
      "keyboard_operation",
      "focus_order",
      "contrast",
      "screenreader_status",
      "zero_negative_decimal",
      "nan_infinity",
      "min_max",
      "rounding_precision",
      "unit_currency_rules",
      "formula_reference_cases",
      "numeric_limit"
    ],
    "limitDimensions": [
      "input_magnitude",
      "decimal_places",
      "row_count"
    ]
  }
] as const;

export function findValidationPlanTool(number: string) {
  return validationPlanTools.find((tool) => tool.number === number);
}

export function toolsByArchetype(archetype: string) {
  return validationPlanTools.filter((tool) => tool.archetype === archetype);
}
