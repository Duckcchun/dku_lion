import { Button } from "./ui/button";
import { Card } from "./ui/card";
import logoImage from "../../assets/dku_lion.png";

interface LandingPageProps {
  onSelectTrack: (track: "baby" | "staff") => void;
}

export function LandingPage({ onSelectTrack }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-6 md:py-12 flex flex-col items-center text-center">
        <img
          src={logoImage}
          alt="단국대학교 멋쟁이사자처럼"
          className="h-36 md:h-48 lg:h-56 w-auto mb-8 object-contain"
        />
        
        <h1 className="text-2xl md:text-4xl mb-12 text-primary">
          멋쟁이사자처럼 단국대학교 14기 모집
        </h1>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
          <Button
            onClick={() => onSelectTrack("baby")}
            className="flex-1 h-auto py-8 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">🦁</span>
              <span className="text-xl">아기사자 지원하기</span>
              <span className="text-sm opacity-90">개발 입문</span>
            </div>
          </Button>

          <Button
            onClick={() => onSelectTrack("staff")}
            variant="outline"
            className="flex-1 h-auto py-8 px-6 border-2 border-primary text-primary hover:bg-primary/5 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">👑</span>
              <span className="text-xl">운영진 지원하기</span>
              <span className="text-sm opacity-90">교육 & 운영</span>
            </div>
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <h2 className="text-3xl text-center mb-8 text-primary">멋쟁이사자처럼이란?</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          전국 대학생 IT 창업 동아리로, 프로그래밍을 배우고 싶은 대학생들이 모여<br />
          아이디어를 실제 서비스로 만들어내는 Tech 커뮤니티입니다.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-4 text-center">
            <div className="text-3xl mb-2">💻</div>
            <h3 className="text-xl mb-2 text-primary">정규 세션</h3>
            <p className="text-sm text-muted-foreground">
              매주 진행되는<br />
              프론트엔드/백엔드 교육
            </p>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="text-xl mb-2 text-primary">해커톤</h3>
            <p className="text-sm text-muted-foreground">
              여름방학 집중 프로젝트<br />
              아이디어를 서비스로 구현
            </p>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-3xl mb-2">🤝</div>
            <h3 className="text-xl mb-2 text-primary">네트워킹</h3>
            <p className="text-sm text-muted-foreground">
              전국 대학 멋사와 교류<br />
              IT 업계 선배와의 만남
            </p>
          </Card>
        </div>
      </section>

      {/* Info Section */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex justify-center mb-12">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-xl mb-4 text-primary">📅 주요 일정</h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center justify-between gap-6">
                <span>서류 마감</span>
                <span className="text-primary text-right shrink-0">3월 10일</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span>대면 면접</span>
                <span className="text-primary text-right shrink-0">3월 12일 ~ 3월 13일</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span>합격자 OT</span>
                <span className="text-primary text-right shrink-0">3월 18일</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground space-y-2">
          <p className="text-lg">문의하기</p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-sm text-center">
            <a 
              href="tel:010-6286-1733"
              className="inline-flex items-center gap-2 hover:text-primary transition-colors"
            >
              📱<span>Phone: 010-6286-1733</span>
            </a>
            <a 
              href="mailto:qasw1733@gmail.com"
              className="inline-flex items-center gap-2 hover:text-primary transition-colors"
            >
              ✉️<span>Email: qasw1733@gmail.com</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}