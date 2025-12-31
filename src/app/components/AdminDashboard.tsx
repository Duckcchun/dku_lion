import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface Application {
  id: string;
  track: string;
  formData: any;
  submittedAt: string;
}

interface AdminDashboardProps {
  onBack: () => void;
  adminToken: string;
}

export function AdminDashboard({ onBack, adminToken }: AdminDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/applications`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "x-admin-token": adminToken,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setApplications(result.applications || []);
      } else {
        console.error("Failed to fetch applications:", result);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const babyApplications = applications.filter((app) => app.track === "baby");
  const staffApplications = applications.filter((app) => app.track === "staff");

  const renderApplicationList = (apps: Application[]) => {
    if (apps.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          아직 지원서가 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {apps.map((app) => (
          <Card
            key={app.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedApplication(app)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="mb-2">{app.formData.name}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>학번: {app.formData.studentId}</p>
                  <p>전공: {app.formData.major}</p>
                  <p>이메일: {app.formData.email}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(app.submittedAt).toLocaleDateString("ko-KR")}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            ← 뒤로가기
          </Button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl text-primary">지원서 관리 대시보드</h1>
            <Button variant="outline" onClick={fetchApplications}>
              새로고침
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">로딩 중...</div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">전체 지원서</p>
                    <p className="text-3xl text-primary">{applications.length}</p>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">아기사자</p>
                    <p className="text-3xl text-primary">{babyApplications.length}</p>
                  </div>
                  <div className="text-4xl">🦁</div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">운영진</p>
                    <p className="text-3xl text-primary">{staffApplications.length}</p>
                  </div>
                  <div className="text-4xl">👑</div>
                </div>
              </Card>
            </div>

            <Tabs defaultValue="baby">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="baby">
                  아기사자 ({babyApplications.length})
                </TabsTrigger>
                <TabsTrigger value="staff">
                  운영진 ({staffApplications.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="baby" className="mt-6">
                {renderApplicationList(babyApplications)}
              </TabsContent>

              <TabsContent value="staff" className="mt-6">
                {renderApplicationList(staffApplications)}
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Application Detail Dialog */}
        <Dialog
          open={!!selectedApplication}
          onOpenChange={() => setSelectedApplication(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>지원서 상세</DialogTitle>
              <DialogDescription>
                {selectedApplication && (
                  <>
                    제출일:{" "}
                    {new Date(selectedApplication.submittedAt).toLocaleString("ko-KR")}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedApplication && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-primary">1. 인적사항</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">성명:</span>{" "}
                      {selectedApplication.formData.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">학번:</span>{" "}
                      {selectedApplication.formData.studentId}
                    </div>
                    <div>
                      <span className="text-muted-foreground">현재 학년/학기:</span>{" "}
                      {selectedApplication.formData.currentYear}
                    </div>
                    <div>
                      <span className="text-muted-foreground">전공:</span>{" "}
                      {selectedApplication.formData.major}
                    </div>
                    <div>
                      <span className="text-muted-foreground">이중전공:</span>{" "}
                      {selectedApplication.formData.doubleMajor || "-"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">연락처:</span>{" "}
                      {selectedApplication.formData.phone}
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">이메일:</span>{" "}
                      {selectedApplication.formData.email}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-primary">2. 활동 가능 여부</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">1학기:</span>{" "}
                      {selectedApplication.formData.schedule1 || "-"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">여름방학:</span>{" "}
                      {selectedApplication.formData.schedule2 || "-"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">2학기:</span>{" "}
                      {selectedApplication.formData.schedule3 || "-"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">면접 가능:</span>{" "}
                      {selectedApplication.formData.interviewDates.join(", ") || "-"}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-primary">3. 역량 및 경험</h3>
                  <div className="space-y-2 text-sm">
                    {selectedApplication.track === "baby" ? (
                      <>
                        <div>
                          <span className="text-muted-foreground">관심 분야:</span>{" "}
                          {selectedApplication.formData.interestField || "-"}
                        </div>
                        <div>
                          <span className="text-muted-foreground">코딩 경험:</span>{" "}
                          {selectedApplication.formData.codingExperience || "-"}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-muted-foreground">지원 직무:</span>{" "}
                          {selectedApplication.formData.position || "-"}
                        </div>
                        <div>
                          <span className="text-muted-foreground">기술 스택:</span>{" "}
                          <div className="whitespace-pre-wrap mt-1 bg-gray-50 p-2 rounded">
                            {selectedApplication.formData.techStack || "-"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">포트폴리오:</span>{" "}
                          <a 
                            href={selectedApplication.formData.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {selectedApplication.formData.portfolio || "-"}
                          </a>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="text-muted-foreground">활동 경력:</span>
                      <ul className="ml-4 mt-1 list-disc">
                        {selectedApplication.formData.activities.map(
                          (activity: string, index: number) =>
                            activity && <li key={index}>{activity}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-primary">4. 에세이</h3>
                  <div className="space-y-4">
                    {selectedApplication.track === "baby" ? (
                      <>
                        <div>
                          <p className="text-sm mb-2">
                            Q1. 지원 동기 (500자)
                          </p>
                          <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">
                            {selectedApplication.formData.essay1 || "-"}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm mb-2">
                            Q2. 몰입 경험 (600자)
                          </p>
                          <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">
                            {selectedApplication.formData.essay2 || "-"}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm mb-2">
                            Q3. 만들고 싶은 서비스 (500자)
                          </p>
                          <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">
                            {selectedApplication.formData.essay3 || "-"}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm mb-2">
                            Q1. 지원 동기 및 기여 방안 (600자)
                          </p>
                          <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">
                            {selectedApplication.formData.essay1 || "-"}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm mb-2">
                            Q2. 문제 해결 및 협업 (800자)
                          </p>
                          <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">
                            {selectedApplication.formData.essay2 || "-"}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm mb-2">
                            Q3. 교육 및 운영 철학 (600자)
                          </p>
                          <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">
                            {selectedApplication.formData.essay3 || "-"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}