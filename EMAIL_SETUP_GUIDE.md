# 📧 이메일 알림 설정 가이드

지원서 제출 시 자동으로 이메일 알림을 받기 위한 설정 방법입니다.

## 1️⃣ Resend API 키 발급받기

### Resend 가입
1. [Resend 웹사이트](https://resend.com) 접속
2. **Sign Up** 버튼 클릭하여 무료 계정 생성
3. GitHub 계정으로 간편하게 가입 가능

### API 키 생성
1. 로그인 후 대시보드에서 **API Keys** 메뉴 클릭
2. **Create API Key** 버튼 클릭
3. API Key 이름 입력 (예: `Likelion Dankook Recruiting`)
4. 권한: **Full Access** 또는 **Sending Access** 선택
5. 생성된 API 키 복사 (예: `re_123456789...`)
   - ⚠️ **중요**: API 키는 한 번만 표시되므로 안전한 곳에 저장!

### 무료 플랜 정보
- **하루 100개 이메일** 무료 발송
- **월 3,000개 이메일** 무료
- 리크루팅 용도로 충분한 용량

---

## 2️⃣ Supabase 환경 변수 설정

### Supabase 대시보드 접속
1. [Supabase 대시보드](https://supabase.com/dashboard) 로그인
2. 프로젝트 선택: **sljhxzqrgrqnrwpdoxuc**
3. 왼쪽 메뉴에서 **Edge Functions** 클릭
4. 상단의 **Manage secrets** 버튼 클릭

### 환경 변수 추가
다음 두 개의 환경 변수를 추가합니다:

#### 1. RESEND_API_KEY
```
Name: RESEND_API_KEY
Value: re_YOUR_API_KEY_HERE
```
- Resend에서 발급받은 API 키 입력

#### 2. ADMIN_EMAIL
```
Name: ADMIN_EMAIL
Value: your-email@example.com
```
- 지원서를 받을 이메일 주소 입력
- 기본값: `likelion.dku@gmail.com`

### 저장 및 재배포
1. **Save** 버튼 클릭
2. Edge Function 자동 재시작 (약 10초 소요)
3. 설정 완료! 🎉

---

## 3️⃣ 테스트하기

### 테스트 지원서 제출
1. 리크루팅 웹사이트에서 테스트 지원서 작성
2. "제출하기" 버튼 클릭
3. 1-2분 내에 설정한 이메일로 알림 도착 확인

### 이메일 내용
- **제목**: 🦁 [단국대 멋사 14기] 아기사자/운영진 신규 지원서 도착
- **내용**: 
  - 인적사항 (성명, 학번, 전공 등)
  - 활동 가능 여부
  - 역량 및 경험
  - 에세이 답변 전문
  - 깔끔한 HTML 포맷

### 문제 해결
이메일이 오지 않는 경우:

1. **스팸함 확인**
   - Gmail: 프로모션/스팸 탭 확인
   - 발신자: `Likelion Dankook <onboarding@resend.dev>`

2. **Resend 대시보드 확인**
   - [Resend Logs](https://resend.com/logs) 접속
   - 이메일 발송 기록 확인
   - 에러 발생 시 원인 파악

3. **Supabase Edge Function 로그 확인**
   - Supabase 대시보드 → Edge Functions → Logs
   - `Email notification sent successfully` 메시지 확인
   - 에러 로그 확인

---

## 4️⃣ 보안 팁

### DO ✅
- API 키를 Supabase 환경 변수에만 저장
- GitHub에 절대 업로드하지 않기
- 주기적으로 API 키 갱신 (6개월마다)

### DON'T ❌
- 코드에 직접 API 키 하드코딩
- API 키를 공개 저장소에 커밋
- API 키를 다른 사람과 공유

---

## 5️⃣ 비용 및 제한

### Resend 무료 플랜
- 하루 100개 이메일
- 월 3,000개 이메일
- 무제한 도메인
- 이메일 로그 30일 보관

### 업그레이드가 필요한 경우
리크루팅 기간에 하루 100개 이상 지원서가 들어올 경우:
1. Resend Pro 플랜: $20/월 (50,000개/월)
2. 또는 디스코드 웹훅으로 대체 (무료, 무제한)

---

## 📞 문의

설정 중 문제가 발생하면:
- Resend 공식 문서: https://resend.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

---

**설정 완료 후 이 파일은 삭제해도 됩니다!**
