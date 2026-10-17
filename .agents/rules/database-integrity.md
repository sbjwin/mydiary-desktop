# MyDiary Desktop DB 무결성 & 백업 보호

1. 모바일 앱 `mydiary`와의 백업 JSON 파일 상호 호환성 유지.
2. 학생 삭제 시 해당 학생의 일지 레코드 자동 정리(Cascade Delete) 무결성 유지.
3. 데이터베이스 키 규칙:
   - 학생: `@mydiary:students`
   - 일지: `@mydiary:records`
   - 주간계획: `@mydiary:weekly_plans`
