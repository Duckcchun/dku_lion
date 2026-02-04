import { Button } from "./ui/button";
import { CheckCircle2 } from "lucide-react";

interface SuccessPageProps {
  onBackToHome: () => void;
}

export function SuccessPage({ onBackToHome }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <CheckCircle2 className="w-24 h-24 text-primary" />
        </div>

        <h1 className="text-3xl md:text-4xl mb-4 text-gray-900">
          지원서 제출이 완료되었습니다
        </h1>

        <p className="text-lg text-muted-foreground mb-4">
          제출하신 지원서가 정상적으로 접수되었습니다.
          <br />
          운영진에게 자동으로 알림이 발송되었습니다. ✉️
        </p>

        <p className="text-muted-foreground mb-8">
          서류 합격 발표는 개별 문자로 안내됩니다.
          <br />
          합격 시 대면 면접에 참여해주시기 바랍니다.
        </p>

        <div className="bg-blue-50 border border-primary/20 rounded-lg p-4 mb-8 text-sm text-left">
          <p className="font-semibold text-primary mb-3">📋 주요 일정</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">모집 마감</span>
              <span className="font-semibold text-primary">3월 10일</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">서류 발표 ✨</span>
              <span className="font-semibold text-primary">3월 11일</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">면접</span>
              <span className="font-semibold text-primary">3월 12일 ~ 3월 13일</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">최종 발표 ✨</span>
              <span className="font-semibold text-primary">3월 15일</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">아기사자, 운영진 전체 OT</span>
              <span className="font-semibold text-primary">3월 18일</span>
            </div>
          </div>
        </div>

        <Button onClick={onBackToHome} className="bg-primary hover:bg-primary/90">
          홈으로 돌아가기
        </Button>

        <p className="text-sm text-muted-foreground mt-8">
          문의사항이 있으시면 아래로 연락주세요
          <br />
          📧 qasw1733@gmail.com
          <br />
          📱 010-6286-1733
        </p>
      </div>
    </div>
  );
}