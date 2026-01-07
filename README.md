# 🦁 단국대 멋쟁이사자처럼 14기 리크루팅 시스템

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

**완전한 웹 기반 지원서 수집 및 관리 시스템**
</div>
<div align="center">

[**🔗 사이트 바로가기**](https://dku-lion.vercel.app)

</div>

---

## 🎯 프로젝트 개요
단국대학교 멋쟁이사자처럼 14기 모집을 위해 자체 개발한 **프로페셔널 리크루팅 웹사이트**입니다.
Google Forms 등 기존 도구의 한계를 넘어, **지원자 경험(UX) 향상**과 **운영진의 업무 효율화**를 목표로 제작되었습니다.

## ✨ 핵심 기능

### 👤 지원자 기능 (User)
- ✅ **반응형 디자인:** 모바일/태블릿/PC 완벽 지원
- ✅ **자동 임시저장:** `LocalStorage`를 활용하여 작성 중 이탈해도 데이터 보존
- ✅ **실시간 유효성 검사:** 글자 수 제한, 필수 항목 체크 등 즉각적인 피드백
- ✅ **트랙별 맞춤 문항:** '아기사자(Baby)'와 '운영진(Staff)' 트랙에 따라 다른 질문지 제공

### 👨‍💼 관리자 기능 (Admin)
- ✅ **대시보드:** 실시간 지원 현황 및 통계 확인
- ✅ **지원서 관리:** 트랙별 필터링, 상세 조회 및 서류 평가 기능
- ✅ **알림 시스템:** 지원서 접수 시 관리자에게 실시간 이메일 발송 (Resend API)

---


## 🔧 기술 스택

| 구분 | 기술 | 설명 |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript | UI 라이브러리 및 타입 안정성 확보 |
| **Styling** | Tailwind CSS, shadcn/ui | 빠르고 일관된 디자인 시스템 구축 |
| **Build** | Vite | 초고속 빌드 및 HMR 지원 |
| **Backend** | Supabase | Edge Functions 및 KV Store (Serverless) |
| **Email** | Resend API | 안정적인 이메일 알림 서비스 |

---

## 📁 프로젝트 구조

```bash
/src
├── app/
│   ├── App.tsx             # 메인 앱 라우팅 및 로직
│   └── components/         # 페이지 및 공통 컴포넌트
│       ├── LandingPage.tsx
│       ├── ApplicationForm.tsx
│       ├── AdminDashboard.tsx
│       └── ui/             # shadcn/ui 컴포넌트
├── styles/                 # 테마 및 폰트 설정
└── utils/                  # Supabase 설정 및 헬퍼 함수
/supabase
└── functions/              # Edge Functions (Backend 로직)

```

---

## 📊 데이터 모델 & 디자인

<details>
<summary><b>👉 데이터 모델 (TypeScript Interface) 보기</b></summary>

```typescript
interface Application {
  id: string;             // 고유 ID (track-timestamp-random)
  track: "baby" | "staff";
  submittedAt: string;
  formData: {
    // 인적사항
    name: string;
    studentId: string;
    major: string;
    phone: string;

    // 트랙별 문항
    interestField?: string; // 아기사자용
    portfolio?: string;     // 운영진용

    // 에세이
    essay1: string;
    essay2: string;
    essay3: string;
  };
}

```

</details>

<details>
<summary><b>👉 디자인 시스템 (Color & Font) 보기</b></summary>

* **Primary Color:** `#00467F` (단국대 시그니처 블루)
* **Typography:** Pretendard Variable
* **Custom Logo:**
<img width="200" height="200" alt="dku log" src="https://github.com/user-attachments/assets/ed003d4c-1ad1-44b0-a5ff-84b1ef25acb3" />
<img width="350" height="350" alt="dku_lion" src="https://github.com/user-attachments/assets/1c2b11c8-84ba-42f3-be77-48df85c6063d" />

</details>

---


## 📞 문의

**멋쟁이사자처럼 단국대학교 14기 대표 손동민**

* 📧 Email: qasw1733@gmail.com
