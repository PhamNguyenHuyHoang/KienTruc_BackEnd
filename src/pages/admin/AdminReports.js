// src/pages/admin/AdminReports.js
import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from "react-router-dom";
import { api } from "../../api/axios"; // Đảm bảo đường dẫn này chính xác
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card"; // Đảm bảo đường dẫn này chính xác
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"; // Đảm bảo đường dẫn này chính xác
import { Progress } from "../../components/ui/progress"; // Đảm bảo đường dẫn này chính xác
import { BarChart3, TrendingUp, Users, AlertCircle, Loader2, Clock, CheckCircle2, BookOpen, ClipboardList, PieChart, Activity } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"; // Đảm bảo đường dẫn này chính xác
import { Button } from "../../components/ui/button"; // Đảm bảo đường dẫn này chính xác
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ScrollArea } from "../../components/ui/scroll-area"; // Đảm bảo đường dẫn này chính xác

// Hàm tiện ích để trích xuất thông điệp lỗi thân thiện
const extractErrorMessage = (errorObj) => {
    if (typeof errorObj === 'string') return errorObj;
    if (errorObj?.response?.data) {
        const data = errorObj.response.data;
        if (typeof data === 'string') return data;
        if (data.message && typeof data.message === 'string') return data.message;
        if (data.error && typeof data.error === 'string') return data.error;
        if (data.path && data.status) {
             return `Lỗi ${data.status} tại ${data.path}. Chi tiết: ${data.message || data.error || 'Không có thông tin chi tiết.'}`;
        }
        if (typeof data === 'object' && data !== null) {
            for (const key in data) {
                if (typeof data[key] === 'string' && (key.toLowerCase().includes('message') || key.toLowerCase().includes('error') || key.toLowerCase().includes('detail'))) {
                    return data[key];
                }
            }
            try {
                return `Lỗi từ server: ${JSON.stringify(data).substring(0, 200)}...`;
            } catch (e) { /* ignore */ }
        }
    }
    if (errorObj?.message && typeof errorObj.message === 'string') {
        return errorObj.message;
    }
    return "Đã có lỗi không xác định xảy ra.";
};


const AdminReports = () => {
  const { loadingAuthGlobal, tokenInfo } = useOutletContext() || { loadingAuthGlobal: true, tokenInfo: null };

  const [reportData, setReportData] = useState({
    overallStats: null, // Mong đợi: totalStudents, registeredStudents, registrationRate, averageCreditsPerStudent
    conflictCheck: null, // Mong đợi: status, lastRun, conflictCount
    topRegisteredCourses: [],
    popularSections: [],
    quickStats: null, // Mong đợi: fullSectionsRate
  });

  const [loadingStates, setLoadingStates] = useState({
    overall: true,
    conflict: true,
    topCourses: true,
    popularSections: true,
    quickStats: true,
  });

  const [errors, setErrors] = useState({});

  // Hàm fetch dữ liệu thống kê tổng quan
  const fetchOverallStats = useCallback(async () => {
    if (!tokenInfo) return;
    setLoadingStates(prev => ({...prev, overall: true}));
    setErrors(prev => ({...prev, overall: null}));
    try {
      const response = await api.get('/api/thongke/tongquan');
      setReportData(prev => ({...prev, overallStats: response.data}));
    } catch (err) {
      const friendlyError = extractErrorMessage(err);
      toast.error(`Lỗi tải thống kê tổng quan: ${friendlyError}`);
      console.error("Error fetching overall stats:", err);
      setErrors(prev => ({...prev, overall: friendlyError}));
    } finally {
      setLoadingStates(prev => ({...prev, overall: false}));
    }
  }, [tokenInfo]);

  // Hàm fetch trạng thái kiểm tra xung đột
  const fetchConflictCheckStatus = useCallback(async () => {
    if (!tokenInfo) return;
    setLoadingStates(prev => ({...prev, conflict: true}));
    setErrors(prev => ({...prev, conflict: null}));
    try {
      const response = await api.get('/api/thongke/xungdot/trangthai');
      setReportData(prev => ({...prev, conflictCheck: response.data}));
    } catch (err) {
      const friendlyError = extractErrorMessage(err);
      toast.error(`Lỗi tải trạng thái xung đột: ${friendlyError}`);
      console.error("Error fetching conflict check status:", err);
      setErrors(prev => ({...prev, conflict: friendlyError}));
    } finally {
      setLoadingStates(prev => ({...prev, conflict: false}));
    }
  }, [tokenInfo]);

  // Hàm fetch các môn học được đăng ký nhiều nhất
  const fetchTopRegisteredCourses = useCallback(async () => {
    if (!tokenInfo) return;
    setLoadingStates(prev => ({...prev, topCourses: true}));
    setErrors(prev => ({...prev, topCourses: null}));
    try {
      const response = await api.get('/api/thongke/monhoc-pho-bien?limit=5');
      setReportData(prev => ({...prev, topRegisteredCourses: response.data || []}));
    } catch (err) {
      const friendlyError = extractErrorMessage(err);
      toast.error(`Lỗi tải môn học phổ biến: ${friendlyError}`);
      console.error("Error fetching top registered courses:", err);
      setErrors(prev => ({...prev, topCourses: friendlyError}));
    } finally {
      setLoadingStates(prev => ({...prev, topCourses: false}));
    }
  }, [tokenInfo]);

  // Hàm fetch các lớp học phần có nhiều sinh viên đăng ký nhất
  const fetchPopularSections = useCallback(async () => {
    if (!tokenInfo) return;
    setLoadingStates(prev => ({...prev, popularSections: true}));
    setErrors(prev => ({...prev, popularSections: null}));
    try {
      const response = await api.get('/api/thongke/lophocphan-dong-nhat?limit=5');
      setReportData(prev => ({...prev, popularSections: response.data || []}));
    } catch (err) {
      const friendlyError = extractErrorMessage(err);
      toast.error(`Lỗi tải lớp học phần đông: ${friendlyError}`);
      console.error("Error fetching popular sections:", err);
      setErrors(prev => ({...prev, popularSections: friendlyError}));
    } finally {
      setLoadingStates(prev => ({...prev, popularSections: false}));
    }
  }, [tokenInfo]);

  // Hàm fetch các thống kê nhanh
   const fetchQuickStats = useCallback(async () => {
    if (!tokenInfo) return;
    setLoadingStates(prev => ({...prev, quickStats: true}));
    setErrors(prev => ({...prev, quickStats: null}));
    try {
      const response = await api.get('/api/thongke/nhanh');
      setReportData(prev => ({...prev, quickStats: response.data }));
    } catch (err) {
      const friendlyError = extractErrorMessage(err);
      toast.error(`Lỗi tải thống kê nhanh: ${friendlyError}`);
      console.error("Error fetching quick stats:", err);
      setErrors(prev => ({...prev, quickStats: friendlyError}));
    } finally {
      setLoadingStates(prev => ({...prev, quickStats: false}));
    }
  }, [tokenInfo]);


  useEffect(() => {
     if (!loadingAuthGlobal && tokenInfo) {
      fetchOverallStats();
      fetchConflictCheckStatus();
      fetchTopRegisteredCourses();
      fetchPopularSections();
      fetchQuickStats();
    } else if (!loadingAuthGlobal && !tokenInfo) {
        setLoadingStates({
            overall: false, conflict: false, topCourses: false,
            popularSections: false, quickStats: false
        });
        setErrors({ general: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."});
        toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }, [fetchOverallStats, fetchConflictCheckStatus, fetchTopRegisteredCourses, fetchPopularSections, fetchQuickStats, loadingAuthGlobal, tokenInfo]);

  const timeAgo = (isoString) => {
    if (!isoString) return 'Chưa rõ';
    try {
        const date = new Date(isoString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 5) return "vài giây trước";
        let interval = Math.floor(seconds / 31536000); if (interval >= 1) return interval + " năm trước";
        interval = Math.floor(seconds / 2592000); if (interval >= 1) return interval + " tháng trước";
        interval = Math.floor(seconds / 86400); if (interval >= 1) return interval + " ngày trước";
        interval = Math.floor(seconds / 3600); if (interval >= 1) return interval + " giờ trước";
        interval = Math.floor(seconds / 60); if (interval >= 1) return interval + " phút trước";
        return Math.max(0, Math.floor(seconds)) + " giây trước";
    } catch (e) { return 'Không hợp lệ'; }
  };

  const getConflictStatusProps = (status) => {
    switch (status) {
      case 'OK': return { Icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', text: 'Không có xung đột' };
      case 'CONFLICTS_FOUND': return { Icon: AlertCircle, color: 'text-yellow-600 dark:text-yellow-400', text: 'Có xung đột' };
      case 'ERROR': return { Icon: AlertCircle, color: 'text-red-600 dark:text-red-400', text: 'Lỗi kiểm tra' };
      default: return { Icon: Clock, color: 'text-muted-foreground dark:text-gray-500', text: 'Chưa chạy/Không rõ' };
    }
  };

  if (loadingAuthGlobal) {
    return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2 text-muted-foreground dark:text-gray-400">Đang xác thực...</p></div>;
  }
  if (errors?.general && !tokenInfo) {
    return <Alert variant="destructive" className="m-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Lỗi</AlertTitle><AlertDescription>{errors.general}</AlertDescription></Alert>;
  }

  const conflictStatusInfo = getConflictStatusProps(reportData?.conflictCheck?.status);
//   const isLoadingAnyCard = loadingStates.overall || loadingStates.conflict || loadingStates.quickStats || loadingStates.topCourses || loadingStates.popularSections; // Biến này có thể không cần thiết nữa nếu không dùng
  const isLoadingQuickStatsCards = loadingStates.overall || loadingStates.conflict || loadingStates.quickStats;


  return (
    <div className="flex flex-col gap-6 p-4 md:p-6"> {/* Thêm padding cho toàn trang */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold dark:text-white">
            <BarChart3 className="h-6 w-6 text-primary" /> Báo cáo & Thống kê
          </CardTitle>
          <CardDescription className="dark:text-gray-400">Tổng hợp các số liệu quan trọng về tình hình đăng ký học phần trong hệ thống.</CardDescription>
        </CardHeader>
      </Card>

      {isLoadingQuickStatsCards && !reportData.overallStats && !reportData.conflictCheck && !reportData.quickStats && (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_,i) => <Card key={`skeleton-${i}`} className="dark:bg-gray-800 dark:border-gray-700 h-40 flex justify-center items-center"><Loader2 className="h-7 w-7 animate-spin text-primary"/></Card>)}
         </div>
      )}

      {/* Các thẻ thống kê nhanh */}
      {(!isLoadingQuickStatsCards || reportData.overallStats || reportData.conflictCheck || reportData.quickStats) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> {/* Giữ lại grid-cols-4 cho 4 thẻ chính */}
          {/* Card: Tỷ lệ SV đã ĐK */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 dark:text-gray-400"><Users className="h-4 w-4"/>Tỷ lệ SV đã ĐK</CardDescription>
              {loadingStates.overall ? <Loader2 className="h-7 w-7 animate-spin text-primary my-1"/> :
              errors?.overall ? <AlertCircle className="h-7 w-7 text-red-500 my-1" title={errors.overall}/> : <CardTitle className="text-4xl dark:text-white">{reportData?.overallStats?.registrationRate ?? 0}%</CardTitle>
              }
            </CardHeader>
            <CardContent><div className="text-xs text-muted-foreground dark:text-gray-500">{loadingStates.overall ? "Đang tải..." : errors?.overall || `${reportData?.overallStats?.registeredStudents?.toLocaleString() ?? 0} / ${reportData?.overallStats?.totalStudents?.toLocaleString() ?? 0} SV`}</div></CardContent>
            {!loadingStates.overall && reportData?.overallStats && !errors?.overall && <CardFooter><Progress value={reportData.overallStats.registrationRate} aria-label={`${reportData.overallStats.registrationRate}%`} className="[&>div]:bg-primary" /></CardFooter>}
          </Card>

          {/* Card: Số TC trung bình/SV */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 dark:text-gray-400"><Activity className="h-4 w-4"/>Số TC trung bình/SV</CardDescription>
              {loadingStates.overall ? <Loader2 className="h-7 w-7 animate-spin text-primary my-1"/> :
              errors?.overall ? <AlertCircle className="h-7 w-7 text-red-500 my-1" title={errors.overall}/> :<CardTitle className="text-4xl dark:text-white">{reportData?.overallStats?.averageCreditsPerStudent?.toFixed(1) ?? 'N/A'}</CardTitle>}
            </CardHeader>
            <CardContent><div className="text-xs text-muted-foreground dark:text-gray-500">{loadingStates.overall ? "Đang tải..." : errors?.overall || `Dựa trên ${reportData?.overallStats?.registeredStudents?.toLocaleString() ?? 0} SV đã ĐK.`}</div></CardContent>
          </Card>

          {/* Card: Kiểm tra xung đột */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 dark:text-gray-400"><AlertCircle className="h-4 w-4"/>Kiểm tra xung đột</CardDescription>
              {loadingStates.conflict ? <Loader2 className="h-7 w-7 animate-spin text-primary my-1"/> :
              errors?.conflict ? <AlertCircle className="h-7 w-7 text-red-500 my-1" title={errors.conflict}/> :
                  <CardTitle className={`text-2xl flex items-center gap-2 ${conflictStatusInfo.color}`}>
                      {React.createElement(conflictStatusInfo.Icon, { className: `h-6 w-6` })}
                      {conflictStatusInfo.text}
                  </CardTitle>
              }
            </CardHeader>
            <CardContent><div className="text-xs text-muted-foreground dark:text-gray-500">{loadingStates.conflict ? "Đang tải..." : errors?.conflict || `Lần cuối: ${timeAgo(reportData?.conflictCheck?.lastRun)} ${reportData?.conflictCheck?.conflictCount > 0 ? `(${reportData.conflictCheck.conflictCount} xung đột)` : ''}`}</div></CardContent>
            {!loadingStates.conflict && !errors?.conflict && reportData?.conflictCheck?.status === 'CONFLICTS_FOUND' && <CardFooter><Button size="sm" variant="outline" asChild className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200"><Link to="/pages/admin/conflicts">Xem chi tiết</Link></Button></CardFooter>}
          </Card>

          {/* Card: Lớp học phần đầy */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1 dark:text-gray-400"><ClipboardList className="h-4 w-4"/>Lớp học phần đầy</CardDescription>
              {loadingStates.quickStats ? <Loader2 className="h-7 w-7 animate-spin text-primary my-1"/> :
              errors?.quickStats ? <AlertCircle className="h-7 w-7 text-red-500 my-1" title={errors.quickStats}/> : <CardTitle className="text-4xl dark:text-white">{reportData?.quickStats?.fullSectionsRate ?? 0}%</CardTitle>}
              </CardHeader>
              <CardContent><div className="text-xs text-muted-foreground dark:text-gray-500">{loadingStates.quickStats ? "Đang tải..." : errors?.quickStats || `Tỷ lệ các lớp đã đạt sĩ số tối đa.`}</div></CardContent>
          </Card>
        </div>
      )}

      {/* Grid cho các bảng thống kê chi tiết */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2"> {/* Điều chỉnh grid cho responsive */}
        {/* Card: Top Môn học được ĐK */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white"><TrendingUp className="h-5 w-5 text-blue-500 dark:text-blue-400" /> Top Môn học được ĐK</CardTitle>
            <CardDescription className="dark:text-gray-400">Các môn học có số lượt đăng ký cao nhất (tối đa 5).</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStates.topCourses ? <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div> :
            errors?.topCourses ? <Alert variant="destructive"><AlertCircle className="h-4 w-4"/><AlertTitle>Lỗi</AlertTitle><AlertDescription>{errors.topCourses}</AlertDescription></Alert> :
            reportData?.topRegisteredCourses?.length > 0 ? (
              <ScrollArea className="h-[300px] w-full"> {/* Đảm bảo ScrollArea có chiều rộng */}
              <Table>
                <TableHeader><TableRow className="dark:border-gray-700"><TableHead className="dark:text-gray-300">Mã MH</TableHead><TableHead className="dark:text-gray-300">Tên Môn học</TableHead><TableHead className="text-right dark:text-gray-300">Lượt ĐK</TableHead></TableRow></TableHeader>
                <TableBody>
                  {reportData.topRegisteredCourses.map(course => (
                    <TableRow key={course.maMonHoc} className="dark:border-gray-700 hover:bg-muted/50 dark:hover:bg-gray-700/50">
                      <TableCell className="font-medium dark:text-gray-100">{course.maMonHoc}</TableCell>
                      <TableCell className="dark:text-gray-200">{course.tenMonHoc}</TableCell>
                      <TableCell className="text-right dark:text-gray-200">{course.registrationCount?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </ScrollArea>
            ) : ( <p className="text-sm text-muted-foreground dark:text-gray-400 italic text-center py-4">Không có dữ liệu.</p> )}
          </CardContent>
        </Card>

        {/* Card: Top Lớp học phần đông */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white"><Users className="h-5 w-5 text-green-500 dark:text-green-400" /> Top Lớp học phần đông</CardTitle>
            <CardDescription className="dark:text-gray-400">Các lớp học phần có số lượng SV đăng ký cao nhất (tối đa 5).</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStates.popularSections ? <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div> :
            errors?.popularSections ? <Alert variant="destructive"><AlertCircle className="h-4 w-4"/><AlertTitle>Lỗi</AlertTitle><AlertDescription>{errors.popularSections}</AlertDescription></Alert> :
            reportData?.popularSections?.length > 0 ? (
              <ScrollArea className="h-[300px] w-full"> {/* Đảm bảo ScrollArea có chiều rộng */}
              <Table>
                <TableHeader><TableRow className="dark:border-gray-700"><TableHead className="dark:text-gray-300">Mã LHP</TableHead><TableHead className="dark:text-gray-300">Tên Lớp học phần</TableHead><TableHead className="text-right dark:text-gray-300">SL ĐK/Max</TableHead></TableRow></TableHeader>
                <TableBody>
                  {reportData.popularSections.map(section => (
                    <TableRow key={section.maLopHocPhan} className="dark:border-gray-700 hover:bg-muted/50 dark:hover:bg-gray-700/50">
                      <TableCell className="font-medium dark:text-gray-100">{section.maLopHocPhan}</TableCell>
                      <TableCell className="dark:text-gray-200">{section.tenLopHocPhan}</TableCell>
                      <TableCell className="text-right dark:text-gray-200">{section.currentEnrollment?.toLocaleString()}/{section.maxEnrollment?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </ScrollArea>
            ) : ( <p className="text-sm text-muted-foreground dark:text-gray-400 italic text-center py-4">Không có dữ liệu.</p> )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
