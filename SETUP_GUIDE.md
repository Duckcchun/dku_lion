# 🦁 단국대 멋쟁이사자처럼 14기 리크루팅 웹사이트 설정 가이드

## 📋 목차
1. [프로젝트 소개](#프로젝트-소개)
2. [주요 기능](#주요-기능)
3. [기술 스택](#기술-스택)
4. [이메일 알림 설정](#이메일-알림-설정)
5. [관리자 대시보드 접근](#관리자-대시보드-접근)
6. [배포 및 운영](#배포-및-운영)

---

## 🎯 프로젝트 소개

단국대학교 멋쟁이사자처럼 14기 리크루팅을 위한 웹 기반 지원서 시스템입니다.

### 페이지 구성
1. **랜딩 페이지** - 트랙 선택 (아기사자/운영진)
2. **지원서 작성 페이지** - 인적사항, 역량, 에세이
3. **제출 완료 페이지** - 제출 확인 및 안내

---

## ✨ 주요 기능

### 🎨 프론트엔드
- ✅ 반응형 디자인 (모바일/태블릿/데스크톱)
- ✅ 단국대 시그니처 컬러 (#00467F)
- ✅ Pretendard 폰트 적용
- ✅ 임시저장 기능 (LocalStorage)
- ✅ 실시간 유효성 검사
- ✅ 진행률 표시

### 🔧 백엔드
- ✅ Supabase Edge Functions
- ✅ KV Store 데이터 저장
- ✅ 자동 이메일 알림 (Resend API)
- ✅ RESTful API

### 👨‍💼 관리자 기능
- ✅ 실시간 통계 대시보드
- ✅ 지원서 목록 조회
- ✅ 상세 내용 보기
- ✅ 트랙별 필터링

---

## 🛠 기술 스택

### Frontend
- **React** 18+
- **TypeScript**
- **Tailwind CSS** v4.0
- **shadcn/ui** 컴포넌트
- **Vite** 빌드 도구

### Backend
- **Supabase** (Edge Functions + KV Store)
- **Deno** (서버리스 런타임)
- **Hono** (웹 프레임워크)
- **Resend** (이메일 발송)

---

## 📧 이메일 알림 설정

지원서 제출 시 자동으로 이메일 알림을 받으려면 다음 단계를 따르세요.

### 1단계: Resend API 키 발급

#### 회원가입
1. https://resend.com 접속
2. **Sign Up** 클릭
3. GitHub 계정으로 간편 가입

#### API 키 생성
1. 대시보드 → **API Keys** 클릭
2. **Create API Key** 클릭
3. 이름 입력: `Likelion Dankook Recruiting`
4. 권한: **Sending Access** 선택
5. API 키 복사 (예: `re_123456789...`)

**⚠️ 중요**: API 키는 한 번만 표시되므로 안전하게 보관하세요!

### 2단계: Supabase 환경 변수 설정

#### Supabase 대시보드
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **Edge Functions** → **Manage secrets**

#### 환경 변수 추가

**RESEND_API_KEY**
```
Name: RESEND_API_KEY
Value: [Resend에서 발급받은 API 키]
```

**ADMIN_EMAIL**
```
Name: ADMIN_EMAIL
Value: [알림을 받을 이메일 주소]
```

예시:
```
ADMIN_EMAIL=likelion.dku@gmail.com
```

#### 저장 및 재배포
1. **Save** 클릭
2. Edge Function 자동 재시작 (10초 소요)
3. 설정 완료! 🎉

### 3단계: 테스트

1. 리크루팅 웹사이트에서 테스트 지원서 제출
2. 1-2분 내에 이메일 도착 확인
3. 스팸함도 확인

### 이메일 내용 미리보기

**제목**: 🦁 [단국대 멋사 14기] 아기사자 신규 지원서 도착

**내용**:
- 📋 인적사항 (성명, 학번, 전공, 연락처 등)
- 📅 활동 가능 여부
- 💻 역량 및 경험
- ✍️ 에세이 답변 전문

이메일은 단국대 브랜드 컬러와 깔끔한 HTML 포맷으로 제공됩니다.

### 무료 플랜 제한
- **하루 100개** 이메일
- **월 3,000개** 이메일
- 리크루팅 용도로 충분!

---

## 👨‍💼 관리자 대시보드 접근

### 접속 방법

#### 개발 환경
```bash
# URL 파라미터 사용
http://localhost:5173/?admin=true
```

#### 프로덕션 환경
```bash
# 배포된 URL에 파라미터 추가
https://your-domain.com/?admin=true
```

### 대시보드 기능

#### 📊 실시간 통계
- 전체 지원서 수
- 아기사자 지원자 수
- 운영진 지원자 수

#### 📋 지원서 관리
- 트랙별 필터링 (아기사자/운영진)
- 지원자 목록 (이름, 학번, 전공, 제출일)
- 상세 보기 (클릭 시 전체 내용)

#### 🔄 실시간 동기화
- **새로고침** 버튼으로 최신 데이터 불러오기
- 페이지 새로고침 시 자동 업데이트

### 보안 주의사항

현재는 URL 파라미터로 접근하지만, 실제 운영 시에는:
1. 로그인 시스템 추가 권장
2. Supabase Auth 연동
3. 관리자 이메일 화이트리스트 설정

---

## 🚀 배포 및 운영

### 환경 변수 체크리스트

#### Supabase Edge Functions
- [x] `SUPABASE_URL` (자동 설정)
- [x] `SUPABASE_SERVICE_ROLE_KEY` (자동 설정)
- [ ] `RESEND_API_KEY` (수동 설정 필요)
- [ ] `ADMIN_EMAIL` (수동 설정 필요)

### 배포 전 확인사항

#### 1. 날짜 및 일정 업데이트
`/src/app/components/LandingPage.tsx` 파일에서:
```typescript
// 마감일 확인
<span>2월 16일(일) 23:59</span>

// 면접 날짜 확인
<span>2월 22일(토) ~ 23일(일)</span>

// OT 날짜 확인
<span className="text-primary">3월 1일(토) 필수참여</span>
```

#### 2. 연락처 정보 확인
```typescript
// Instagram
href="https://instagram.com/likelion_dankook"

// Email
href="mailto:likelion.dku@gmail.com"
```

#### 3. 회비 정보 확인
```typescript
<p className="text-3xl mb-2">10만 원</p>
```

### 운영 팁

#### 📊 지원자 모니터링
- 하루 1-2회 관리자 대시보드 확인
- 이메일 알림 실시간 체크
- 마감일 임박 시 더 자주 확인

#### 💾 데이터 백업
- Supabase 대시보드에서 주기적 백업
- KV Store 데이터 다운로드
- 중요 지원서는 별도 저장 권장

#### 🐛 문제 해결

**이메일이 안 오는 경우**
1. Supabase Edge Functions → Logs 확인
2. Resend 대시보드 → Logs 확인
3. 스팸함 확인
4. API 키 재발급

**지원서가 안 보이는 경우**
1. 관리자 대시보드 새로고침
2. 브라우저 캐시 삭제
3. Supabase KV Store 직접 확인

**페이지 로딩이 느린 경우**
1. 이미지 최적화
2. CDN 사용
3. Vercel/Netlify 등 전문 호스팅 서비스 사용

---

## 📞 기술 지원

### 문서 링크
- [Supabase 공식 문서](https://supabase.com/docs)
- [Resend API 문서](https://resend.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)

### 커뮤니티
- Supabase Discord
- React 한국 커뮤니티
- 단국대 멋사 Slack

---

## 📝 라이선스

이 프로젝트는 단국대학교 멋쟁이사자처럼 14기 리크루팅을 위해 제작되었습니다.

---

**🦁 단국대학교 멋쟁이사자처럼 14기 화이팅! 🦁**
