// src/pages/admin/AdminDashboard.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useOutletContext } from "react-router-dom";
import { api } from "../../api/axios"; // Giả định đường dẫn đúng
import { Link } from 'react-router-dom';
import {
    Users, BookOpenCheck, Library, ListChecks, AlertCircle, CheckCircle2, Clock, Loader2, UserCog
    // Icons Activity, TrendingUp, FilterX, Search removed as their sections are gone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"; // Giả định đường dẫn đúng
import { Progress } from "../../components/ui/progress"; // Giả định đường dẫn đúng
import { Button } from "../../components/ui/button"; // Giả định đường dẫn đúng
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"; // Giả định đường dẫn đúng
// Avatar, Table, Input components are removed as their parent sections are gone
import { Badge } from "../../components/ui/badge"; // Giả định đường dẫn đúng
import { toast } from 'react-toastify';
import { ScrollArea } from "../../components/ui/scroll-area"; // Giả định đường dẫn đúng

// Component Card thống kê tái sử dụng
const StatCard = ({ title, value, icon: Icon, description, linkTo, isLoading, valueSuffix = '' }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground dark:text-gray-400">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Loader2 className="h-7 w-7 animate-spin text-primary my-1" />
      ) : (
        <div className="text-3xl font-bold dark:text-white">
          {value?.toLocaleString() ?? '0'}{valueSuffix}
        </div>
      )}
      {description && !isLoading && <p className="text-xs text-muted-foreground dark:text-gray-400 pt-1">{description}</p>}
      {linkTo && !isLoading && (
        <Button variant="link" asChild className="px-0 pt-2 h-auto text-xs text-primary hover:underline dark:text-blue-400">
          <Link to={linkTo}>Xem chi tiết &rarr;</Link>
        </Button>
      )}
    </CardContent>
  </Card>
);

// Component Skeleton cho StatCard
const SkeletonCard = () => (
  <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
      <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full animate-pulse"></div>
    </CardContent>
  </Card>
);

// SkeletonListItem and SkeletonTableRow are removed as their parent components are gone.

const AdminDashboard = () => {
  const { loadingAuthGlobal, tokenInfo } = useOutletContext() || { loadingAuthGlobal: true, tokenInfo: null };

  const [stats, setStats] = useState({
    students: 0, administrators: 0, subjects: 0, sections: 0,
    // newRegistrations24h and studentCompletionRate removed from here
  });
  // recentActivity state removed
  const [quickStats, setQuickStats] = useState({ // This remains for now, can be adjusted if needed
    averageRegisteredCredits: 0,
    conflictStatus: 'UNKNOWN',
    conflictLastRun: null,
    fullSectionsRate: 0,
  });
  // topCourses state removed

  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [partialError, setPartialError] = useState(false);

  // activitySearchTerm and topCoursesSearchTerm removed

  const statCardsDefinition = [
    { id: 'students', title: "Tổng Sinh viên", value: stats.students, icon: Users, linkTo: "/pages/admin/students" },
    { id: 'administrators', title: "Tổng Quản trị viên", value: stats.administrators, icon: UserCog, linkTo: "/pages/admin/lecturers" },
    { id: 'subjects', title: "Tổng Môn học", value: stats.subjects, icon: Library, linkTo: "/pages/admin/subjects" },
    { id: 'sections', title: "Tổng Lớp Học phần", value: stats.sections, icon: BookOpenCheck, linkTo: "/pages/admin/courses" },
    // StatCards for newRegistrations24h and studentCompletionRate removed
  ];

  const fetchData = useCallback(async () => {
    if (!tokenInfo) {
        setLoadingData(false);
        setError("Không thể tải dữ liệu dashboard do chưa xác thực. Vui lòng đăng nhập lại.");
        toast.warn("Phiên làm việc không hợp lệ hoặc đã hết hạn.");
        return;
    }
    setLoadingData(true);
    setError(null);
    setPartialError(false);
    let hasAnyError = false;

    try {
      console.log("AdminDashboard: Bắt đầu tải dữ liệu dashboard...");

      const results = await Promise.allSettled([
        api.get("/sinhvien"),
        api.get("/quantrivien"),
        api.get("/monhoc"),
        api.get("/lophocphan"),
        // Mock API calls for newRegistrations24h and studentCompletionRate are removed
        // Assuming quickStats will be fetched from a real API or calculated differently later.
        // For now, we'll keep its mock generation if you intend to connect it to an API later.
        // If quickStats is also to be removed or not fetched, this Promise should be removed too.
        new Promise(resolve => setTimeout(() => resolve({ data: { // This is for quickStats
            averageRegisteredCredits: 14.7,
            conflictStatus: ['OK', 'CONFLICTS_FOUND', 'ERROR'][Math.floor(Math.random()*3)],
            conflictLastRun: new Date(Date.now() - 1000 * 60 * 60 * Math.floor(3 + Math.random())).toISOString(),
            fullSectionsRate: Math.floor(Math.random() * 20) + 5,
        } }), 700)), // Adjusted timing slightly
      ]);

      const [studentsRes, adminsRes, subjectsRes, coursesRes, quickStatsRes] = results;


      const getDataOrHandleError = (res, name, defaultValue = {}) => {
        if (res.status === 'fulfilled' && res.value?.data) {
          return res.value.data;
        }
        console.error(`Lỗi tải dữ liệu ${name}:`, res.reason || res.value?.statusText || 'Unknown error');
        toast.error(`Không thể tải dữ liệu ${name}. Một số thông tin có thể bị thiếu.`);
        hasAnyError = true;
        return defaultValue;
      };

      const fetchedStudents = getDataOrHandleError(studentsRes, 'Sinh viên', []);
      const fetchedAdmins = getDataOrHandleError(adminsRes, 'Quản trị viên', []);
      const fetchedSubjects = getDataOrHandleError(subjectsRes, 'Môn học', []);
      const fetchedCourses = getDataOrHandleError(coursesRes, 'Lớp học phần', []);
      // newRegistrationsData and completionRateData removed
      const fetchedQuickStats = getDataOrHandleError(quickStatsRes, 'Thống kê nhanh', { averageRegisteredCredits: 0, conflictStatus: 'UNKNOWN', conflictLastRun: null, fullSectionsRate: 0 });


      setStats(prev => ({
        ...prev,
        students: fetchedStudents.length,
        administrators: fetchedAdmins.length,
        subjects: fetchedSubjects.length,
        sections: fetchedCourses.length,
        // newRegistrations24h and studentCompletionRate removed from stats update
      }));

      // mockRecentActivity and mockTopCourses generation removed
      // setRecentActivity and setTopCourses calls removed

      setQuickStats({ // Set quickStats from fetched data (currently mocked)
          averageRegisteredCredits: fetchedQuickStats.averageRegisteredCredits ?? 0,
          conflictStatus: fetchedQuickStats.conflictStatus ?? 'UNKNOWN',
          conflictLastRun: fetchedQuickStats.conflictLastRun ?? null,
          fullSectionsRate: fetchedQuickStats.fullSectionsRate ?? 0,
      });


      if (hasAnyError) {
        setPartialError(true);
        toast.warn("Một số dữ liệu không thể tải. Thông tin trên dashboard có thể không đầy đủ.");
      }

    } catch (err) {
      console.error("AdminDashboard: Lỗi nghiêm trọng khi tải dữ liệu dashboard:", err);
      const errMsg = "Không thể tải toàn bộ dữ liệu dashboard. Vui lòng thử lại sau.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoadingData(false);
      console.log("AdminDashboard: Hoàn tất tải dữ liệu.");
    }
  }, [tokenInfo]);

  useEffect(() => {
    if (!loadingAuthGlobal && tokenInfo) {
      fetchData();
    } else if (!loadingAuthGlobal && !tokenInfo) {
        setLoadingData(false);
        setError("Phiên làm việc đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        toast.error("Yêu cầu xác thực để xem trang này.");
    }
  }, [fetchData, loadingAuthGlobal, tokenInfo]);

  const timeAgo = (isoString) => {
    if (!isoString) return 'Chưa rõ';
    try {
        const date = new Date(isoString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 5) return "vài giây trước";
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return interval + " năm trước";
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return interval + " tháng trước";
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return interval + " ngày trước";
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + " giờ trước";
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + " phút trước";
        return Math.max(0, Math.floor(seconds)) + " giây trước";
    } catch (e) { return 'Thời gian không hợp lệ'; }
  };

  const getConflictStatusProps = (status) => {
    switch (status) {
      case 'OK': return { Icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', text: 'Không có xung đột' };
      case 'CONFLICTS_FOUND': return { Icon: AlertCircle, color: 'text-yellow-600 dark:text-yellow-400', text: 'Đã tìm thấy xung đột' };
      case 'ERROR': return { Icon: AlertCircle, color: 'text-red-600 dark:text-red-400', text: 'Lỗi kiểm tra' };
      default: return { Icon: Clock, color: 'text-muted-foreground dark:text-gray-500', text: 'Chưa rõ' };
    }
  };

  // filteredRecentActivity and filteredTopCourses useMemo hooks removed

  // Chart rendering functions are removed

  if (loadingAuthGlobal) {
    return <div className="flex justify-center items-center p-10 h-screen"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }
  if (error && !partialError) {
     return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
            <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi Tải Dữ Liệu Tổng Quan</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <Button onClick={fetchData} className="mt-4">Thử lại</Button>
            </Alert>
        </div>
     );
  }

  return (
    <ScrollArea className="h-screen">
    <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8">
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight dark:text-white">
          Tổng quan Hệ thống
        </h1>
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          Các số liệu chính trong hệ thống đăng ký học phần.
          {partialError && <span className="text-yellow-500 dark:text-yellow-400"> (Một số dữ liệu có thể bị thiếu)</span>}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> {/* Adjusted grid columns */}
        {loadingData && !error ? (
          statCardsDefinition.map((cardDef) => <SkeletonCard key={cardDef.id} />)
        ) : (
          statCardsDefinition.map(cardDef => (
            <StatCard
              key={cardDef.id}
              title={cardDef.title}
              value={cardDef.value}
              icon={cardDef.icon}
              linkTo={cardDef.linkTo}
              description={cardDef.description} // Descriptions for removed cards will not appear
              valueSuffix={cardDef.valueSuffix}
              isLoading={loadingData}
            />
          ))
        )}
      </div>

      {/* Recent Activity Card and Top Courses Table Card are removed */}
      {/* Grid for Quick Stats */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
         <Card className="lg:col-span-3 shadow-sm dark:bg-gray-800 dark:border-gray-700">
           <CardHeader>
             <CardTitle className="flex items-center gap-2 text-lg dark:text-white"><ListChecks className="h-5 w-5" /> Thống kê nhanh</CardTitle>
             <CardDescription className="dark:text-gray-400">Một số chỉ số và trạng thái hệ thống.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             {loadingData ? (
                <div className="space-y-4 py-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 animate-pulse mt-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 animate-pulse mt-2"></div>
                </div>
             ) :
             <>
              <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground dark:text-gray-400">Tỷ lệ lớp HP đầy:</span>
                  <Badge variant={quickStats.fullSectionsRate > 50 ? "destructive" : "secondary"} className="text-xs dark:bg-gray-700 dark:text-gray-200">
                     {quickStats.fullSectionsRate?.toFixed(0) ?? '0'}%
                  </Badge>
              </div>
              <Progress value={quickStats.fullSectionsRate ?? 0} aria-label={`${quickStats.fullSectionsRate ?? 0}% học phần đầy`} className="h-2"/>

              <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-muted-foreground dark:text-gray-400">Số TC ĐK TB/SV:</span>
                  <span className="font-semibold dark:text-white">{quickStats.averageRegisteredCredits?.toFixed(1) ?? '0.0'}</span>
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-muted-foreground dark:text-gray-400">Kiểm tra xung đột:</span>
                  <div className="flex items-center gap-1">
                      {React.createElement(getConflictStatusProps(quickStats.conflictStatus).Icon, { className: `h-4 w-4 ${getConflictStatusProps(quickStats.conflictStatus).color}` })}
                      <span className={`font-medium text-xs ${getConflictStatusProps(quickStats.conflictStatus).color}`}>
                          {getConflictStatusProps(quickStats.conflictStatus).text}
                      </span>
                  </div>
              </div>
               <p className="text-xs text-muted-foreground dark:text-gray-500 text-right -mt-1">
                    Lần cuối: {timeAgo(quickStats.conflictLastRun)}
               </p>
               <Button size="sm" variant="outline" asChild className="w-full mt-3 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200">
                  <Link to="/pages/admin/conflicts">Chạy / Xem chi tiết xung đột</Link>
               </Button>
              </>
            }
           </CardContent>
         </Card>
       </div>
        {/* Chart sections are removed */}
    </div>
    </ScrollArea>
  );
};
export default AdminDashboard;
