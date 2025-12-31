# 🦁 단국대 멋쟁이사자처럼 14기 리크루팅 시스템

> 완전한 웹 기반 지원서 수집 및 관리 시스템

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Edge_Functions-3ECF8E?logo=supabase)](https://supabase.com)

---

## 🎯 프로젝트 개요

단국대학교 멋쟁이사자처럼 14기 모집을 위한 프로페셔널 리크루팅 웹사이트입니다.

### 📱 주요 페이지
1. **랜딩 페이지** - 트랙 선택 및 멋사 소개
2. **지원서 작성** - 인적사항, 역량 평가, 에세이
3. **제출 완료** - 확인 메시지 및 일정 안내
4. **관리자 대시보드** - 실시간 통계 및 지원서 관리

---

## ✨ 핵심 기능

### 👤 지원자 기능
- ✅ **반응형 디자인** - 모바일/태블릿/PC 완벽 지원
- ✅ **임시저장** - LocalStorage 활용 자동 저장
- ✅ **실시간 유효성 검사** - 즉각적인 입력 피드백
- ✅ **트랙별 맞춤 질문** - 아기사자/운영진 차별화

### 👨‍💼 관리자 기능
- ✅ **실시간 통계 대시보드** - 지원 현황 한눈에 파악
- ✅ **자동 이메일 알림** - 지원서 제출 시 즉시 알림
- ✅ **지원서 상세 보기** - 모든 정보 깔끔하게 정리
- ✅ **트랙별 필터링** - 아기사자/운영진 분리 조회

### 🔔 알림 시스템
- ✅ **이메일 자동 발송** - Resend API 연동
- ✅ **HTML 이메일** - 브랜드 컬러와 깔끔한 포맷
- ✅ **전체 내용 포함** - 인적사항, 에세이 등 모두 포함
- ✅ **실패 시 재시도** - 안정적인 알림 전달

---

## 🏗 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  • 랜딩 페이지 (LandingPage.tsx)                        │
│  • 지원서 폼 (ApplicationForm.tsx)                      │
│  • 제출 완료 (SuccessPage.tsx)                          │
│  • 관리자 대시보드 (AdminDashboard.tsx)                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────────┐
│            Supabase Edge Functions (Deno)                │
│  • POST /applications - 지원서 제출                     │
│  • GET /applications - 전체 지원서 조회                │
│  • GET /applications/:id - 개별 지원서 조회            │
└──────────┬──────────────────────┬───────────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐    ┌───────────────────┐
│  KV Store        │    │  Resend API       │
│  (데이터 저장)   │    │  (이메일 발송)    │
│                  │    │                   │
│  • baby-xxx      │    │  📧 → 관리자 메일 │
│  • staff-xxx     │    │                   │
└──────────────────┘    └───────────────────┘
```

---

## 🚀 빠른 시작

### 1️⃣ 프로젝트 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 브라우저에서 열기
http://localhost:5173
```

### 2️⃣ 이메일 알림 설정 (5분)

> 📄 **자세한 가이드**: `QUICK_START.md` 참고

**필수 단계:**
1. [Resend](https://resend.com) 가입 후 API 키 발급
2. Supabase 대시보드에서 환경 변수 설정
   - `RESEND_API_KEY`: Resend API 키
   - `ADMIN_EMAIL`: 알림 받을 이메일

```bash
# Supabase 환경 변수 설정 위치
Dashboard → Edge Functions → Manage secrets
```

### 3️⃣ 관리자 대시보드 접속

```bash
# URL에 admin 파라미터 추가
http://localhost:5173/?admin=true

# 또는 배포 후
https://your-domain.com/?admin=true
```

---

## 📁 프로젝트 구조

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # 메인 앱 컴포넌트
│   │   └── components/
│   │       ├── LandingPage.tsx        # 랜딩 페이지
│   │       ├── ApplicationForm.tsx     # 지원서 폼
│   │       ├── SuccessPage.tsx        # 제출 완료 페이지
│   │       ├── AdminDashboard.tsx     # 관리자 대시보드
│   │       └── ui/                    # shadcn/ui 컴포넌트
│   └── styles/
│       ├── theme.css                  # 단국대 브랜드 컬러
│       └── fonts.css                  # Pretendard 폰트
│
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx              # API 엔드포인트
│           └── kv_store.tsx           # KV Store 유틸
│
├── utils/
│   └── supabase/
│       └── info.tsx                   # Supabase 설정
│
├── QUICK_START.md                     # 5분 빠른 설정
├── SETUP_GUIDE.md                     # 상세 설정 가이드
└── EMAIL_SETUP_GUIDE.md               # 이메일 설정 전용
```

---

## 🎨 디자인 시스템

### 컬러 팔레트
```css
/* 단국대 시그니처 블루 */
--primary: #00467F;

/* 그레이 스케일 */
--gray-50: #f8f9fa;
--gray-100: #e9ecef;
--muted-foreground: #6c757d;
```

### 타이포그래피
- **폰트**: Pretendard Variable
- **제목**: text-2xl ~ text-4xl
- **본문**: text-base
- **보조**: text-sm, text-xs

---

## 🔧 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18+ | UI 라이브러리 |
| TypeScript | 5.0+ | 타입 안정성 |
| Tailwind CSS | 4.0 | 스타일링 |
| Vite | 최신 | 빌드 도구 |
| shadcn/ui | 최신 | UI 컴포넌트 |

### Backend
| 기술 | 용도 |
|------|------|
| Supabase Edge Functions | 서버리스 API |
| Deno | 서버 런타임 |
| Hono | 웹 프레임워크 |
| KV Store | 데이터 저장소 |
| Resend API | 이메일 발송 |

---

## 📊 데이터 모델

### 지원서 데이터 구조

```typescript
interface Application {
  id: string;                    // 고유 ID (baby-1234567890-abc)
  track: "baby" | "staff";       // 트랙
  submittedAt: string;           // 제출 시간
  formData: {
    // 인적사항
    name: string;
    studentId: string;
    major: string;
    doubleMajor?: string;
    phone: string;
    email: string;
    currentYear: string;
    
    // 활동 가능 여부
    schedule1: string;
    schedule2: string;
    schedule3: string;
    interviewDates: string[];
    
    // 트랙별 차별화
    // 아기사자
    interestField?: string;
    codingExperience?: string;
    
    // 운영진
    position?: string;
    techStack?: string;
    portfolio?: string;
    
    // 공통
    activities: string[];
    essay1: string;
    essay2: string;
    essay3: string;
  };
}
```

---

## 📧 이메일 템플릿 미리보기

지원서 제출 시 관리자에게 발송되는 이메일:

```
📧 제목: 🦁 [단국대 멋사 14기] 아기사자 신규 지원서 도착

┌───────────────────────────────────────┐
│   🦁 단국대 멋쟁이사자처럼 14기        │
│      아기사자 신규 지원서              │
└───────────────────────────────────────┘

제출 시간: 2025. 1. 25. 오후 3:45:23

📋 인적사항
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
성명       홍길동
학번       32xxxxxx
전공       컴퓨터공학과
...

📅 활동 가능 여부
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
수요일 18:30    참석 가능
...

💻 관심 분야 및 경험
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
관심 분야      프론트엔드
...

✍️ 에세이 답변
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q1. 멋쟁이사자처럼에 지원한 이유는?
[지원자 답변 전문]
...
```

---

## 🔒 보안 및 주의사항

### 환경 변수 관리
- ✅ Supabase 환경 변수에 API 키 저장
- ✅ 절대 코드에 하드코딩 금지
- ✅ GitHub에 업로드 금지

### 관리자 접근 제어
현재는 URL 파라미터 방식이지만, 프로덕션 운영 시:
- 🔐 Supabase Auth 연동 권장
- 🔐 이메일 화이트리스트 설정
- 🔐 비밀번호 보호 추가

---

## 📈 운영 가이드

### 지원 기간 동안
- 📊 하루 1-2회 대시보드 확인
- 📧 이메일 알림 실시간 체크
- 💾 주기적 데이터 백업

### 마감 후
- 📥 모든 지원서 CSV 다운로드
- 🗂️ 트랙별 분류 및 정리
- 📞 서류 합격자 개별 연락

### 데이터 보관
- 💾 Supabase KV Store 백업
- 📁 로컬 저장 권장
- 🔒 개인정보 보호법 준수

---

## 🐛 문제 해결

### 자주 묻는 질문

**Q: 이메일이 안 와요**
```
1. 스팸함 확인
2. Resend 대시보드 → Logs 확인
3. Supabase Edge Functions → Logs 확인
4. 환경 변수 RESEND_API_KEY 재확인
```

**Q: 지원서가 대시보드에 안 보여요**
```
1. 새로고침 버튼 클릭
2. 브라우저 캐시 삭제
3. 개발자 도구 콘솔 에러 확인
```

**Q: 임시저장이 사라졌어요**
```
LocalStorage는 브라우저별로 분리됩니다.
같은 브라우저에서 접속하세요.
```

---

## 📚 참고 문서

- [📘 빠른 시작 (5분)](./QUICK_START.md)
- [📗 상세 설정 가이드](./SETUP_GUIDE.md)
- [📧 이메일 알림 설정](./EMAIL_SETUP_GUIDE.md)

### 외부 문서
- [Supabase 공식 문서](https://supabase.com/docs)
- [Resend API 문서](https://resend.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

---

## 🤝 기여

이 프로젝트는 단국대학교 멋쟁이사자처럼 14기를 위해 제작되었습니다.

### 개선 아이디어
- [ ] Supabase Auth 로그인 추가
- [ ] CSV 내보내기 기능
- [ ] 면접 일정 자동 배정
- [ ] 서류 합격자 SMS 자동 발송

---

## 📞 문의

### 멋쟁이사자처럼 단국대학교
- 📧 Email: likelion.dku@gmail.com
- 📱 Instagram: [@likelion_dankook](https://instagram.com/likelion_dankook)

---

## 📄 라이선스

이 프로젝트는 단국대학교 멋쟁이사자처럼의 소유입니다.

---

<div align="center">

**🦁 단국대학교 멋쟁이사자처럼 14기 화이팅! 🦁**

Made with ❤️ by Likelion Dankook

</div>
