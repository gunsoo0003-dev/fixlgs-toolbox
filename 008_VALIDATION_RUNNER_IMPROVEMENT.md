# 008 validation runner improvement

- Windows에서 `npm.cmd`를 직접 spawn하여 `exit unknown`이 발생하던 문제를 제거했습니다.
- 현재 npm 실행 파일(`npm_execpath`)을 Node로 직접 실행하고, 대체 경로도 제공합니다.
- 각 단계의 stdout/stderr, 실제 종료 코드, signal, spawn error를 별도 로그로 저장합니다.
- 이전 검수 요약을 실행 전에 삭제해 오래된 30/40 결과가 새 결과처럼 복사되지 않게 했습니다.
- core와 limit 요약을 단계별로 보존한 뒤 현재 실행의 통합 TXT/JSON 요약을 다시 생성합니다.
- core 실패 여부와 무관하게 limit 검수까지 실행하며, 마지막에 전체 상태를 합산합니다.
