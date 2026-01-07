import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import logoImage from "../../assets/dku_lion.png";

interface AdminLoginProps {
  onLogin: (token: string) => void;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const adminToken = (import.meta.env.VITE_ADMIN_TOKEN as string | undefined)?.trim();

  const handleLogin = () => {
    setError("");

    if (!token.trim()) {
      setError("토큰을 입력해주세요.");
      return;
    }

    if (!adminToken) {
      setError("관리자 토큰이 설정되지 않았습니다.");
      return;
    }

    setIsLoading(true);

    // 토큰 검증 (간단한 지연으로 로딩 표시)
    setTimeout(() => {
      if (token.trim() === adminToken) {
        onLogin(token);
      } else {
        setError("토큰이 올바르지 않습니다.");
      }
      setIsLoading(false);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-12">
          <img
            src={logoImage}
            alt="단국대학교 멋쟁이사자처럼"
            className="h-24 w-auto mb-6 object-contain"
          />
          <h1 className="text-2xl font-bold text-primary mb-2">관리자 로그인</h1>
          <p className="text-sm text-muted-foreground">지원서 현황을 확인하세요</p>
        </div>

        {/* Login Card */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="token">관리자 토큰</Label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  if (error) setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="토큰을 입력해주세요"
                className={`mt-2 ${error ? "border-red-500 focus:ring-red-500" : ""}`}
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>로그인 중...</span>
                </div>
              ) : (
                "로그인"
              )}
            </Button>
          </div>
        </Card>

        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full"
        >
          ← 돌아가기
        </Button>
      </div>
    </div>
  );
}
