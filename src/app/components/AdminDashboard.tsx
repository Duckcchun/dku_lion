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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import Papa from "papaparse";

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
  const [deleteConfirm, setDeleteConfirm] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const endpoints = [
        // Edge Functions domain (preferred)
        `https://${projectId}.functions.supabase.co/server/make-server-5a2ed2de/applications`,
        // Legacy invoke domain (fallback)
        `https://${projectId}.supabase.co/functions/v1/server/make-server-5a2ed2de/applications`,
      ];

      let lastError: unknown = undefined;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              "x-admin-token": adminToken,
            },
          });

          const result = await response.json();

          if (response.ok) {
            setApplications(result.applications || []);
            setLoading(false);
            return;
          } else {
            throw new Error(result.error || `HTTP ${response.status}`);
          }
        } catch (err) {
          lastError = err;
          console.warn(`Endpoint failed (${endpoint}):`, err);
          // try next endpoint
        }
      }

      // If we exhausted all endpoints
      throw lastError;
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const babyApplications = applications.filter((app) => app.track === "baby");
  const staffApplications = applications.filter((app) => app.track === "staff");

  const exportToCSV = (apps: Application[], trackName: string) => {
    // 평탄화된 데이터 생성
    const flattenedData = apps.map((app) => ({
      "이름": app.formData.name,
      "학번": app.formData.studentId,
      "전공": app.formData.major,
      "이중전공": app.formData.doubleMajor || "-",
      "학년/학기": app.formData.currentYear,
      "연락처": app.formData.phone,
      "이메일": app.formData.email,
      "1학기활동": app.formData.schedule1 || "-",
      "여름방학활동": app.formData.schedule2 || "-",
      "2학기활동": app.formData.schedule3 || "-",
      "면접가능날짜": app.formData.interviewDates.join(", ") || "-",
      ...(app.track === "baby"
        ? {
            "관심분야": app.formData.interestField || "-",
            "코딩경험": app.formData.codingExperience || "-",
          }
        : {
            "지원직무": app.formData.position || "-",
            "기술스택": app.formData.techStack || "-",
            "포트폴리오": app.formData.portfolio || "-",
          }),
      "활동경력": app.formData.activities.filter((a: string) => a).join("; ") || "-",
      "지원동기": app.formData.essay1 || "-",
      "경험/협업": app.formData.essay2 || "-",
      "기타질문": app.formData.essay3 || "-",
      "제출일시": new Date(app.submittedAt).toLocaleString("ko-KR"),
    }));

    const csv = Papa.unparse(flattenedData, {
      header: true,
      dynamicTyping: false,
    });

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    link.setAttribute("href", url);
    link.setAttribute("download", `${trackName}_지원서_${timestamp}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteApplication = async (appToDelete: Application) => {
    setDeleting(true);
    try {
      const endpoints = [
        `https://${projectId}.functions.supabase.co/server/make-server-5a2ed2de/applications/${appToDelete.id}`,
        `https://${projectId}.supabase.co/functions/v1/server/make-server-5a2ed2de/applications/${appToDelete.id}`,
      ];

      let lastError: unknown = undefined;
      let successfulDelete = false;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              "x-admin-token": adminToken,
            },
          });

          if (response.ok) {
            successfulDelete = true;
            console.log("삭제 성공");
            break;
          } else {
            const result = await response.json();
            throw new Error(result.error || `HTTP ${response.status}`);
          }
        } catch (err) {
          lastError = err;
          console.warn(`Delete endpoint failed (${endpoint}):`, err);
        }
      }

      // 서버 삭제 실패해도 로컬에서는 삭제 처리 (나중에 배포 후 복구 가능)
      setApplications(applications.filter((app) => app.id !== appToDelete.id));
      setDeleteConfirm(null);
      alert("지원서가 삭제되었습니다.");
      
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const app of applications) {
        try {
          const endpoints = [
            `https://${projectId}.functions.supabase.co/server/make-server-5a2ed2de/applications/${app.id}`,
            `https://${projectId}.supabase.co/functions/v1/server/make-server-5a2ed2de/applications/${app.id}`,
          ];

          let deleted = false;
          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${publicAnonKey}`,
                  "x-admin-token": adminToken,
                },
              });

              if (response.ok) {
                deleted = true;
                successCount++;
                break;
              }
            } catch (err) {
              console.warn(`Delete endpoint failed (${endpoint}):`, err);
            }
          }

          if (!deleted) {
            failCount++;
          }
        } catch (err) {
          console.error(`Failed to delete ${app.id}:`, err);
          failCount++;
        }
      }

      // 로컬에서 모두 삭제
      setApplications([]);
      setShowDeleteAllConfirm(false);
      
      if (failCount > 0) {
        alert(`${successCount}개 삭제 성공, ${failCount}개 실패했습니다.`);
      } else {
        alert(`모든 지원서 ${successCount}개가 삭제되었습니다.`);
      }
    } catch (error) {
      console.error("Error deleting all applications:", error);
      alert("전체 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

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
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div
                className="flex-1 cursor-pointer"
                onClick={() => setSelectedApplication(app)}
              >
                <h3 className="mb-2">{app.formData.name}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>학번: {app.formData.studentId}</p>
                  <p>전공: {app.formData.major}</p>
                  <p>이메일: {app.formData.email}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm text-muted-foreground">
                  {new Date(app.submittedAt).toLocaleDateString("ko-KR")}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(app);
                  }}
                >
                  삭제
                </Button>
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
            <div className="flex gap-2">
              {applications.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteAllConfirm(true)}
                  disabled={deleting}
                >
                  전체 삭제
                </Button>
              )}
              <Button variant="outline" onClick={fetchApplications}>
                새로고침
              </Button>
            </div>
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
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={() => exportToCSV(babyApplications, "아기사자")}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={babyApplications.length === 0}
                  >
                    📥 CSV 내보내기 ({babyApplications.length})
                  </Button>
                </div>
                {renderApplicationList(babyApplications)}
              </TabsContent>

              <TabsContent value="staff" className="mt-6">
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={() => exportToCSV(staffApplications, "운영진")}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={staffApplications.length === 0}
                  >
                    📥 CSV 내보내기 ({staffApplications.length})
                  </Button>
                </div>
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>지원서를 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteConfirm && (
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">
                      {deleteConfirm.formData.name}의 지원서
                    </div>
                    <div>
                      삭제 후에는 복구할 수 없습니다. 정말 삭제하시겠습니까?
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDeleteApplication(deleteConfirm)}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Delete All Confirmation Dialog */}
        <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>모든 지원서를 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-2">
                  <div className="font-semibold text-gray-900">
                    총 {applications.length}개의 지원서가 삭제됩니다.
                  </div>
                  <div>
                    삭제 후에는 복구할 수 없습니다. 정말 모두 삭제하시겠습니까?
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAll}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? "삭제 중..." : "모두 삭제"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>      </div>
    </div>
  );
}