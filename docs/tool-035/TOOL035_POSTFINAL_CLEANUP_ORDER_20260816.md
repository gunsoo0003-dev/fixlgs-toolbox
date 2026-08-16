# TOOL035 POST-FINAL cleanup order

통제서 기준 순서: 마지막 FINAL PASS -> FINAL 직후 ZIP -> 배포 전 정리 -> Git 무결성/선택 staging -> commit -> push -> LOCAL HEAD=origin/main -> git archive HEAD.

`RUN_035_POSTFINAL_CLEANUP.ps1`은 배포 전 정리 단계 전용이다.
- 재생성 산출물만 제거한다.
- tracked 파일은 자동 삭제하지 않는다.
- tracked D가 있으면 Git 단계 진입을 중단한다.
- 모든 결과를 터미널과 Desktop TXT/ZIP에 동시에 남긴다.
- staging/commit/push는 수행하지 않는다.
