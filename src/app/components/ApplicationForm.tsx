import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Card } from "./ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          refreshExpired?: "auto" | "manual";
          theme?: "light" | "dark";
          size?: "normal" | "compact" | "invisible";
          retry?: "auto" | "never";
        }
      ) => void;
    };
  }
}

interface ApplicationFormProps {
  track: "baby" | "staff";
  onSubmit: () => void;
  onBack: () => void;
}

interface BabyFormData {
  name: string;
  studentId: string;
  major: string;
  doubleMajor: string;
  phone: string;
  email: string;
  currentYear: string;
  schedule1: string;
  schedule2: string;
  schedule3: string;
  interviewDates: string[];
  interestField: string;
  codingExperience: string;
  activities: string[];
  essay1: string;
  essay2: string;
  essay3: string;
}

interface StaffFormData {
  name: string;
  studentId: string;
  major: string;
  doubleMajor: string;
  phone: string;
  email: string;
  currentYear: string;
  schedule1: string;
  schedule2: string;
  schedule3: string;
  interviewDates: string[];
  position: string;
  techStack: string;
  portfolio: string;
  activities: string[];
  essay1: string;
  essay2: string;
  essay3: string;
}

const INITIAL_BABY_FORM_DATA: BabyFormData = {
  name: "",
  studentId: "",
  major: "",
  doubleMajor: "",
  phone: "",
  email: "",
  currentYear: "",
  schedule1: "",
  schedule2: "",
  schedule3: "",
  interviewDates: [],
  interestField: "",
  codingExperience: "",
  activities: [""],
  essay1: "",
  essay2: "",
  essay3: "",
};

const INITIAL_STAFF_FORM_DATA: StaffFormData = {
  name: "",
  studentId: "",
  major: "",
  doubleMajor: "",
  phone: "",
  email: "",
  currentYear: "",
  schedule1: "",
  schedule2: "",
  schedule3: "",
  interviewDates: [],
  position: "",
  techStack: "",
  portfolio: "",
  activities: [""],
  essay1: "",
  essay2: "",
  essay3: "",
};

export function ApplicationForm({ track, onSubmit, onBack }: ApplicationFormProps) {
  const [formData, setFormData] = useState<BabyFormData | StaffFormData>(
    track === "baby" ? INITIAL_BABY_FORM_DATA : INITIAL_STAFF_FORM_DATA
  );
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const captchaRef = useRef<HTMLDivElement | null>(null);
  const turnstileSiteKey = (import.meta.env.VITE_TURNSTILE_SITEKEY as string | undefined)?.trim();

  const trackName = track === "baby" ? "아기사자" : "운영진";
  const storageKey = `likelion-14th-${track}-form`;

  // Load form data from localStorage
  const loadFormData = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
        setShowLoadDialog(false);
      } catch (e) {
        console.error("Failed to load form data", e);
      }
    }
  };

  // Save to localStorage
  const saveFormData = () => {
    localStorage.setItem(storageKey, JSON.stringify(formData));
    alert("임시 저장되었습니다!");
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addActivity = () => {
    setFormData((prev) => ({
      ...prev,
      activities: [...prev.activities, ""],
    }));
  };

  const updateActivity = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.map((a, i) => (i === index ? value : a)),
    }));
  };

  const removeActivity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const toggleInterviewDate = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      interviewDates: prev.interviewDates.includes(date)
        ? prev.interviewDates.filter((d) => d !== date)
        : [...prev.interviewDates, date],
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name || !formData.studentId || !formData.email) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    if (track === "staff") {
      const staffData = formData as StaffFormData;
      if (!staffData.portfolio) {
        alert("포트폴리오 링크는 필수 입력 항목입니다.");
        return;
      }
    }

    if (turnstileSiteKey && !captchaToken) {
      alert("스팸 방지 확인을 완료해주세요.");
      return;
    }

    setShowSubmitDialog(true);
  };

  const confirmSubmit = async () => {
    const endpoints = [
      // Edge Functions domain (preferred)
      `https://${projectId}.functions.supabase.co/server/make-server-5a2ed2de/applications`,
      // Legacy invoke domain (fallback)
      `https://${projectId}.supabase.co/functions/v1/server/make-server-5a2ed2de/applications`,
    ];

    try {
      let lastError: unknown = undefined;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              track,
              formData,
              captchaToken,
            }),
          });

          const contentType = response.headers.get("content-type") ?? "";
          const responseBody = contentType.includes("application/json")
            ? await response.json()
            : await response.text();

          if (!response.ok) {
            const message =
              typeof responseBody === "string"
                ? responseBody
                : responseBody?.error || `${response.status} ${response.statusText}`;
            throw new Error(message);
          }

          console.log("Application submitted successfully:", responseBody);

          // Clear localStorage
          localStorage.removeItem(storageKey);
          onSubmit();
          return;
        } catch (err) {
          lastError = err;
          console.warn(`Endpoint failed (${endpoint}):`, err);
          // try next endpoint
        }
      }

      // If we exhausted all endpoints
      throw lastError;

    } catch (error) {
      console.error("Error submitting application:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`제출 중 오류가 발생했습니다. 다시 시도해주세요. (${message})`);
    }
  };

  // Check if there's saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setShowLoadDialog(true);
    }
  }, [storageKey]);

  // Load Turnstile script & render widget
  useEffect(() => {
    if (!turnstileSiteKey || !captchaRef.current) return;

    const renderWidget = () => {
      if (window.turnstile && captchaRef.current) {
        window.turnstile.render(captchaRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token) => setCaptchaToken(token),
          "error-callback": () => setCaptchaToken(null),
          "expired-callback": () => setCaptchaToken(null),
          refreshExpired: "auto",
        });
      }
    };

    const existing = document.querySelector(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
    );

    if (existing) {
      renderWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;
    document.head.appendChild(script);
  }, [turnstileSiteKey]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-4">
              ← 뒤로가기
            </Button>
            <h1 className="text-3xl text-primary">14기 {trackName} 지원서 작성</h1>
          </div>
          <Button variant="outline" onClick={() => setShowLoadDialog(true)}>
            불러오기
          </Button>
        </div>

        <div className="space-y-8">
          {/* Section 1: Personal Info */}
          <Card className="p-6">
            <h2 className="text-2xl mb-6 text-primary">1. 인적사항</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">성명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="홍길동"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="studentId">학번 *</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => updateField("studentId", e.target.value)}
                  placeholder="32xxxxxx"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="currentYear">현재 학년/학기 *</Label>
                <Input
                  id="currentYear"
                  value={formData.currentYear}
                  onChange={(e) => updateField("currentYear", e.target.value)}
                  placeholder="예: 2학년 1학기 재학 예정"
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="major">전공 *</Label>
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) => updateField("major", e.target.value)}
                    placeholder="컴퓨터공학과"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="doubleMajor">이중전공 (선택)</Label>
                  <Input
                    id="doubleMajor"
                    value={formData.doubleMajor}
                    onChange={(e) => updateField("doubleMajor", e.target.value)}
                    placeholder="경영학과"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">연락처 *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="010-xxxx-xxxx"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="example@dankook.ac.kr"
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Availability */}
          <Card className="p-6">
            <h2 className="text-2xl mb-6 text-primary">2. 활동 가능 여부</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="schedule">2025년 계획표 *</Label>
                <p className="text-sm text-muted-foreground mb-2 mt-1">
                  {track === "baby"
                    ? "멋쟁이사자처럼은 매주 수요일 세션과 여름방학 해커톤이 진행됩니다. 학업, 알바, 타 동아리 등 병행해야 할 주요 일정을 솔직하게 적어주세요."
                    : "운영진은 정기 세션 외에도 운영 회의 및 행사 기획에 참여해야 합니다. 1년간 중도 이탈 없이 책임감 있게 활동 가능한지 판단하기 위해 예정된 일정을 구체적으로 적어주세요."}
                </p>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">1학기</Label>
                    <Textarea
                      value={formData.schedule1}
                      onChange={(e) => updateField("schedule1", e.target.value)}
                      placeholder="학기 중 주요 일정을 입력해주세요"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">여름방학</Label>
                    <Textarea
                      value={formData.schedule2}
                      onChange={(e) => updateField("schedule2", e.target.value)}
                      placeholder="방학 중 주요 일정을 입력해주세요"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">2학기</Label>
                    <Textarea
                      value={formData.schedule3}
                      onChange={(e) => updateField("schedule3", e.target.value)}
                      placeholder="학기 중 주요 일정을 입력해주세요"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>면접 가능 시간 *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  가능한 날짜를 모두 선택해주세요.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="interview-sat"
                      checked={formData.interviewDates.includes("2월 22일(토)")}
                      onCheckedChange={() => toggleInterviewDate("2월 22일(토)")}
                    />
                    <label htmlFor="interview-sat" className="text-sm cursor-pointer">
                      2월 22일(토)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="interview-sun"
                      checked={formData.interviewDates.includes("2월 23일(일)")}
                      onCheckedChange={() => toggleInterviewDate("2월 23일(일)")}
                    />
                    <label htmlFor="interview-sun" className="text-sm cursor-pointer">
                      2월 23일(일)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Skills - BABY */}
          {track === "baby" && (
            <Card className="p-6">
              <h2 className="text-2xl mb-6 text-primary">3. 역량 및 경험</h2>
              <div className="space-y-6">
                <div>
                  <Label>관심 분야 (필수) *</Label>
                  <p className="text-sm text-muted-foreground mb-3 mt-1">
                    가장 배우고 싶은 분야를 선택해주세요.
                  </p>
                  <RadioGroup
                    value={(formData as BabyFormData).interestField}
                    onValueChange={(value) => updateField("interestField", value)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="frontend" id="interest-frontend" />
                      <label htmlFor="interest-frontend" className="text-sm cursor-pointer">
                        프론트엔드 (화면 구현)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="backend" id="interest-backend" />
                      <label htmlFor="interest-backend" className="text-sm cursor-pointer">
                        백엔드 (데이터 처리)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="design" id="interest-design" />
                      <label htmlFor="interest-design" className="text-sm cursor-pointer">
                        기획/디자인
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unsure" id="interest-unsure" />
                      <label htmlFor="interest-unsure" className="text-sm cursor-pointer">
                        아직 잘 모르겠음
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>코딩 경험 (선택)</Label>
                  <p className="text-sm text-muted-foreground mb-3 mt-1">
                    프로그래밍을 접해본 경험이 있나요? (없어도 무관합니다)
                  </p>
                  <RadioGroup
                    value={(formData as BabyFormData).codingExperience}
                    onValueChange={(value) => updateField("codingExperience", value)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="exp-none" />
                      <label htmlFor="exp-none" className="text-sm cursor-pointer">
                        경험 없음 (완전 처음)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="class" id="exp-class" />
                      <label htmlFor="exp-class" className="text-sm cursor-pointer">
                        교양/전공 수업만 들어봄
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="project" id="exp-project" />
                      <label htmlFor="exp-project" className="text-sm cursor-pointer">
                        독학이나 프로젝트를 해봄
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>활동 경력</Label>
                  <p className="text-sm text-muted-foreground mb-2 mt-1">
                    동아리, 알바, 혹은 본인이 무언가에 푹 빠져서 했던 활동이 있다면 적어주세요.
                  </p>
                  <div className="space-y-2">
                    {formData.activities.map((activity, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={activity}
                          onChange={(e) => updateActivity(index, e.target.value)}
                          placeholder="예: XX 동아리 부원 (2023~2024)"
                        />
                        {formData.activities.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeActivity(index)}
                          >
                            삭제
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addActivity} className="w-full">
                      + 경력 추가
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Section 3: Skills - STAFF */}
          {track === "staff" && (
            <Card className="p-6">
              <h2 className="text-2xl mb-6 text-primary">3. 역량 및 경험</h2>
              <div className="space-y-6">
                <div>
                  <Label>지원 직무 (필수) *</Label>
                  <RadioGroup
                    value={(formData as StaffFormData).position}
                    onValueChange={(value) => updateField("position", value)}
                    className="space-y-2 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="planning" id="pos-planning" />
                      <label htmlFor="pos-planning" className="text-sm cursor-pointer">
                        기획
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="frontend" id="pos-frontend" />
                      <label htmlFor="pos-frontend" className="text-sm cursor-pointer">
                        프론트엔드
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="backend" id="pos-backend" />
                      <label htmlFor="pos-backend" className="text-sm cursor-pointer">
                        백엔드
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="design" id="pos-design" />
                      <label htmlFor="pos-design" className="text-sm cursor-pointer">
                        디자인
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="techStack">기술 스택 (상세 입력) *</Label>
                  <p className="text-sm text-muted-foreground mb-2 mt-1">
                    본인이 활용할 수 있는 기술 스택(언어, 프레임워크, 툴 등)을 구체적으로 나열해 주세요.
                  </p>
                  <Textarea
                    id="techStack"
                    value={(formData as StaffFormData).techStack}
                    onChange={(e) => updateField("techStack", e.target.value)}
                    placeholder="예: React, TypeScript, Spring Boot, MySQL, Adobe XD 등"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio">포트폴리오 (필수) *</Label>
                  <p className="text-sm text-muted-foreground mb-2 mt-1">
                    본인의 역량을 보여줄 수 있는 GitHub, 블로그(Velog/Tistory), 노션, 혹은 포트폴리오 링크를 입력해주세요.
                  </p>
                  <Input
                    id="portfolio"
                    value={(formData as StaffFormData).portfolio}
                    onChange={(e) => updateField("portfolio", e.target.value)}
                    placeholder="https://github.com/username 또는 https://velog.io/@username"
                  />
                </div>

                <div>
                  <Label>활동 경력</Label>
                  <p className="text-sm text-muted-foreground mb-2 mt-1">
                    동아리, 프로젝트 경험을 간단히 기술해주세요.
                  </p>
                  <div className="space-y-2">
                    {formData.activities.map((activity, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={activity}
                          onChange={(e) => updateActivity(index, e.target.value)}
                          placeholder="예: XX 동아리 부원 (2023~2024)"
                        />
                        {formData.activities.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeActivity(index)}
                          >
                            삭제
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addActivity} className="w-full">
                      + 경력 추가
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Section 4: Essays - BABY */}
          {track === "baby" && (
            <Card className="p-6">
              <h2 className="text-2xl mb-6 text-primary">4. 에세이</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="essay1">Q1. 지원 동기 *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    멋쟁이사자처럼 14기에 지원하게 된 솔직한 동기와, 1년 뒤 본인이 기대하는 성장한 모습에 대해 적어주세요.
                  </p>
                  <Textarea
                    id="essay1"
                    value={formData.essay1}
                    onChange={(e) => updateField("essay1", e.target.value)}
                    rows={8}
                    className="mt-2"
                    placeholder="지원 동기와 기대하는 성장 모습을 작성해주세요..."
                  />
                  <p className="text-sm text-right text-muted-foreground mt-1">
                    {formData.essay1.length}/500자
                  </p>
                </div>

                <div>
                  <Label htmlFor="essay2">Q2. 몰입 경험 *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    개발 관련이 아니어도 좋습니다. 살면서 가장 힘들었거나 포기하고 싶었던 순간, 혹은 끈기 있게 도전하여 성취감을 느꼈던 경험을 들려주세요.
                  </p>
                  <Textarea
                    id="essay2"
                    value={formData.essay2}
                    onChange={(e) => updateField("essay2", e.target.value)}
                    rows={10}
                    className="mt-2"
                    placeholder="몰입했던 경험과 그 과정에서 느낀 점을 구체적으로 작성해주세요..."
                  />
                  <p className="text-sm text-right text-muted-foreground mt-1">
                    {formData.essay2.length}/600자
                  </p>
                </div>

                <div>
                  <Label htmlFor="essay3">Q3. 만들고 싶은 서비스 *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    평소 학교생활이나 일상에서 '이런 게 있으면 좋겠다'라고 느꼈던 불편함이 있나요? 이를 웹 서비스로 만든다면 어떤 모습일지 자유롭게 상상해 보세요.
                  </p>
                  <Textarea
                    id="essay3"
                    value={formData.essay3}
                    onChange={(e) => updateField("essay3", e.target.value)}
                    rows={8}
                    className="mt-2"
                    placeholder="만들고 싶은 서비스에 대해 자유롭게 작성해주세요..."
                  />
                  <p className="text-sm text-right text-muted-foreground mt-1">
                    {formData.essay3.length}/500자
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Section 4: Essays - STAFF */}
          {track === "staff" && (
            <Card className="p-6">
              <h2 className="text-2xl mb-6 text-primary">4. 에세이</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="essay1">Q1. 지원 동기 및 기여 방안 *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    운영진으로 지원한 동기는 무엇이며, 본인의 역량을 발휘하여 14기 아기사자들의 성장에 어떻게, 얼마나 기여할 수 있는지 구체적인 계획을 적어주세요.
                  </p>
                  <Textarea
                    id="essay1"
                    value={formData.essay1}
                    onChange={(e) => updateField("essay1", e.target.value)}
                    rows={10}
                    className="mt-2"
                    placeholder="지원 동기와 구체적인 기여 방안을 작성해주세요..."
                  />
                  <p className="text-sm text-right text-muted-foreground mt-1">
                    {formData.essay1.length}/600자
                  </p>
                </div>

                <div>
                  <Label htmlFor="essay2">Q2. 문제 해결 및 협업 *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    팀 프로젝트나 조직 생활 중 마주했던 갈등 상황이나 기술적 난관(Error)을 주도적으로 해결했던 경험을 구체적으로 서술해 주세요.
                  </p>
                  <Textarea
                    id="essay2"
                    value={formData.essay2}
                    onChange={(e) => updateField("essay2", e.target.value)}
                    rows={12}
                    className="mt-2"
                    placeholder="문제 해결 경험을 구체적으로 작성해주세요..."
                  />
                  <p className="text-sm text-right text-muted-foreground mt-1">
                    {formData.essay2.length}/800자
                  </p>
                </div>

                <div>
                  <Label htmlFor="essay3">Q3. 교육 및 운영 철학 *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    코딩을 처음 접하는 아기사자들이 어려움에 부딪혀 포기하려 할 때, 운영진으로서 어떻게 동기를 부여하고 이끌어갈 것인지 본인의 생각을 적어주세요.
                  </p>
                  <Textarea
                    id="essay3"
                    value={formData.essay3}
                    onChange={(e) => updateField("essay3", e.target.value)}
                    rows={10}
                    className="mt-2"
                    placeholder="교육 및 운영 철학을 작성해주세요..."
                  />
                  <p className="text-sm text-right text-muted-foreground mt-1">
                    {formData.essay3.length}/600자
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {turnstileSiteKey && (
          <Card className="p-4 border-dashed border-primary/30 bg-white">
            <h3 className="text-lg mb-2 text-primary">스팸 방지 확인</h3>
            <p className="text-sm text-muted-foreground mb-3">제출 전에 한 번만 확인해주세요.</p>
            <div ref={captchaRef} className="flex justify-center" />
          </Card>
        )}

        {/* Floating Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg py-4 z-50">
          <div className="container mx-auto px-4 max-w-4xl flex gap-4 justify-end">
            <Button variant="outline" onClick={saveFormData}>
              임시 저장
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              제출하기
            </Button>
          </div>
        </div>

        {/* Add padding to bottom for floating bar */}
        <div className="h-24"></div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>지원서를 제출하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              제출 후에는 수정이 불가능합니다. 입력하신 내용을 다시 한번 확인해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>제출</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Load Data Dialog */}
      <AlertDialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>임시 저장된 내용이 있습니다</AlertDialogTitle>
            <AlertDialogDescription>
              이전에 작성하던 내용을 불러오시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>새로 작성</AlertDialogCancel>
            <AlertDialogAction onClick={loadFormData}>불러오기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}