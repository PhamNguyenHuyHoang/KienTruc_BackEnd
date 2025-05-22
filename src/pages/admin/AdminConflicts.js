// src/pages/admin/AdminConflicts.js
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useOutletContext, Link } from "react-router-dom";
import { api } from "../../api/axios"; // Đảm bảo đường dẫn này chính xác
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { CalendarX2, AlertCircle, CheckCircle2, Loader2, Search as SearchIcon, XIcon, FileDown, BarChart3, Edit3, Eye, RefreshCw, ArrowUpDown, UserCheck, BookOpenCheck } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { toast } from 'react-toastify';
import { ScrollArea } from "../../components/ui/scroll-area";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
// import { Separator } from "../../components/ui/separator"; 
// ^^^ LỖI MODULE NOT FOUND: Component Separator không tìm thấy. 
// Nếu bạn đang dùng shadcn/ui, hãy thử chạy: `npx shadcn-ui@latest add separator`
// Sau đó bỏ comment dòng import ở trên và dòng <Separator ... /> ở dưới.

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

// Helper function to create a more detailed error message based on status code
const getDetailedErrorMessage = (err) => {
    const statusCode = err.response?.status;
    let baseMessage = extractErrorMessage(err);

    if (!err.response && err.message === 'Network Error') {
        return "Lỗi mạng: Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối internet của bạn.";
    }
    if (statusCode === 401) {
        return `Lỗi xác thực (401): ${baseMessage}. (Lưu ý: Kiểm tra phía client đã được bỏ qua, lỗi này từ backend).`;
    }
    if (statusCode === 403) {
        return `Từ chối truy cập (403): ${baseMessage}. (Lưu ý: Kiểm tra phía client đã được bỏ qua, lỗi này từ backend).`;
    }
    if (statusCode >= 400 && statusCode < 500) {
        return `Lỗi từ phía bạn (${statusCode}): ${baseMessage}.`;
    }
    if (statusCode >= 500) {
        return `Lỗi máy chủ (${statusCode}): ${baseMessage}. Vui lòng thử lại sau hoặc liên hệ quản trị viên.`;
    }
    return baseMessage; 
};

// Định nghĩa các hằng số cho bộ lọc và sắp xếp
const SEVERITY_OPTIONS = [
    { value: "all", label: "Tất cả mức độ" },
    { value: "Cao", label: "Cao" },
    { value: "Trung bình", label: "Trung bình" },
    { value: "Thấp", label: "Thấp" },
];
const severityOrder = { "Cao": 3, "Trung bình": 2, "Thấp": 1 };

const STATUS_OPTIONS = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "moi", label: "Mới" },
    { value: "dang_xu_ly", label: "Đang xử lý" },
    { value: "da_xu_ly", label: "Đã xử lý" },
];
const statusOrder = { "moi": 3, "dang_xu_ly": 2, "da_xu_ly": 1 };

const SORT_OPTIONS = [
    { value: "createdAt_desc", label: "Ngày tạo (Mới nhất)" },
    { value: "createdAt_asc", label: "Ngày tạo (Cũ nhất)" },
    { value: "severity_desc", label: "Mức độ (Cao → Thấp)" },
    { value: "severity_asc", label: "Mức độ (Thấp → Cao)" },
    { value: "status_desc", label: "Trạng thái (Mới → Đã xử lý)" },
    { value: "status_asc", label: "Trạng thái (Đã xử lý → Mới)" },
];

// Hàm lấy màu cho badge mức độ
const getSeverityBadgeColor = (severity) => {
    switch (severity) {
        case 'Cao': return 'bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-300 border-red-500';
        case 'Trung bình': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/70 dark:text-orange-300 border-orange-500';
        case 'Thấp': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/70 dark:text-yellow-300 border-yellow-500';
        default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-500';
    }
};

// Hàm lấy màu cho badge trạng thái
const getStatusBadgeColor = (status) => {
    switch (status) {
        case 'moi': return 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100 border-gray-400';
        case 'dang_xu_ly': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300 border-blue-500';
        case 'da_xu_ly': return 'bg-green-100 text-green-700 dark:bg-green-900/70 dark:text-green-300 border-green-500';
        default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-500';
    }
};


const AdminConflicts = () => {
  // MODIFIED: Bypass all client-side authorization checks
  // const { loadingAuthGlobal, tokenInfo } = useOutletContext() || { loadingAuthGlobal: true, tokenInfo: null };
  const outletVars = useOutletContext(); // Keep for potential other context values
  const loadingAuthGlobal = false; // Simulate authentication is always complete
  const tokenInfo = outletVars?.tokenInfo || { // Use real token if provided by context, otherwise mock
      role: 'admin_mock_client_auth_fully_bypassed', 
      userId: 'mock_user_client_auth_fully_bypassed',
      message: 'Client-side authorization checks fully bypassed for this component.' 
  };


  const [isLoadingCheck, setIsLoadingCheck] = useState(false);
  const [isLoadingFetch, setIsLoadingFetch] = useState(true); 
  const [conflicts, setConflicts] = useState([]);
  const [error, setError] = useState(null); // This error state is for API call errors, not auth errors on client
  const [lastChecked, setLastChecked] = useState(null);
  
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.length > 0 ? SORT_OPTIONS[0].value : "createdAt_desc");

  // State for student-specific conflict check
  const [maSinhVienInput, setMaSinhVienInput] = useState("");
  const [maLopHocPhanInput, setMaLopHocPhanInput] = useState("");
  const [trungLichResult, setTrungLichResult] = useState(null);
  const [isLoadingTrungLich, setIsLoadingTrungLich] = useState(false);
  const [trungLichError, setTrungLichError] = useState(null);


  // Gọi API kiểm tra xung đột (admin general check)
  const handleCheckConflicts = useCallback(async () => {
    // Client-side token check removed
    setIsLoadingCheck(true);
    setError(null);
    try {
      const response = await api.post('/api/xungdot/kiemtra-tatca');
      const conflictData = response.data?.conflicts || []; 
      const newLastChecked = response.data?.lastChecked ? new Date(response.data.lastChecked) : new Date();
      
      setConflicts(conflictData);
      setLastChecked(newLastChecked);
      if (conflictData.length > 0) {
          toast.warn(`Đã tìm thấy ${conflictData.length} xung đột mới!`);
      } else {
          toast.success("Kiểm tra hoàn tất, không tìm thấy xung đột mới.");
      }
    } catch (err) {
      const detailedError = getDetailedErrorMessage(err);
      setError(detailedError);
      toast.error(`Lỗi kiểm tra xung đột: ${detailedError}`);
    } finally {
      setIsLoadingCheck(false);
    }
  }, []); // Dependencies removed as client-side auth checks are bypassed
  
  // Fetch xung đột đã tồn tại (admin general list)
  const fetchExistingConflicts = useCallback(async (isRefresh = false) => {
    // Client-side token/auth checks removed
    setIsLoadingFetch(true); 
    if (isRefresh) setError(null);

    try {
        const response = await api.get('/api/xungdot/danhsach');
        const fetchedConflicts = response.data?.conflicts || []; 
        const fetchedLastChecked = response.data?.lastChecked ? new Date(response.data.lastChecked) : null;
        
        setConflicts(fetchedConflicts);
        if(fetchedLastChecked) setLastChecked(fetchedLastChecked);
        
        if (isRefresh) {
            toast.success("Dữ liệu xung đột đã được làm mới.");
        } else if (fetchedConflicts.length > 0 && !fetchedLastChecked && !isRefresh) { 
            toast.info(`Tìm thấy ${fetchedConflicts.length} xung đột từ hệ thống.`);
        }
    } catch (err) {
        const detailedError = getDetailedErrorMessage(err);
        setError(detailedError); 
        // Avoid toast on initial load if it's an auth error from backend, as client check is bypassed
        if (isRefresh || conflicts.length > 0 || (err.response && err.response.status !== 401 && err.response.status !== 403) ) { 
             toast.error("Không thể tải dữ liệu xung đột: " + detailedError);
        }
    } finally {
        setIsLoadingFetch(false); 
    }
  }, [conflicts.length]); 

  useEffect(() => {
    // Auth checks removed, directly call fetch
    fetchExistingConflicts();
  }, [fetchExistingConflicts]);

  const handleRefreshData = () => {
    fetchExistingConflicts(true);
  };

  // Cập nhật trạng thái xung đột (admin general update)
  const handleUpdateConflictStatus = useCallback(async (conflictId, newStatus) => {
    // Client-side token check removed
    toast.info(`Đang cập nhật trạng thái cho xung đột...`);
    try {
        await api.put(`/api/xungdot/${conflictId}/status`, { status: newStatus });
        
        setConflicts(prevConflicts =>
          prevConflicts.map(c =>
            c.id === conflictId ? { ...c, status: newStatus } : c
          )
        );
        const statusLabel = STATUS_OPTIONS.find(s=>s.value === newStatus)?.label || newStatus;
        toast.success(`Đã cập nhật trạng thái của xung đột thành "${statusLabel}".`);
    } catch (err) {
        const detailedError = getDetailedErrorMessage(err);
        toast.error(`Lỗi cập nhật trạng thái: ${detailedError}`);
    }
  }, []);

  // NEW: Function to check student-specific schedule conflict
  const handleKiemTraTrungLichSinhVien = useCallback(async () => {
    // Client-side token check removed
    if (!maSinhVienInput.trim() || !maLopHocPhanInput.trim()) {
        toast.warn("Vui lòng nhập Mã Sinh Viên và Mã Lớp Học Phần.");
        return;
    }
    setIsLoadingTrungLich(true);
    setTrungLichResult(null);
    setTrungLichError(null);
    try {
        const response = await api.get(`/api/dangkyhocphan/trung-lich`, {
            params: {
                maSinhVien: maSinhVienInput,
                maLopHocPhan: maLopHocPhanInput
            }
        });
        setTrungLichResult(response.data); 
        if (typeof response.data === 'string' && response.data.startsWith("✅")) {
            toast.success("Kiểm tra hoàn tất: " + response.data);
        } else if (typeof response.data === 'string' && response.data.startsWith("⚠️")) {
            toast.warn("Kiểm tra hoàn tất: " + response.data);
        } else {
            toast.info("Kiểm tra hoàn tất.");
        }

    } catch (err) {
        const detailedError = getDetailedErrorMessage(err);
        setTrungLichError(detailedError);
        toast.error(`Lỗi kiểm tra trùng lịch sinh viên: ${detailedError}`);
    } finally {
        setIsLoadingTrungLich(false);
    }
  }, [maSinhVienInput, maLopHocPhanInput]);


  const formatDateTime = (dateInput) => {
    if (!dateInput) return 'Chưa rõ';
    try {
      return new Date(dateInput).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return 'Không hợp lệ'; }
  };

  const processedConflicts = useMemo(() => {
    let results = [...conflicts]; 

    if (filterType !== "all") {
      results = results.filter(c => c.type === filterType);
    }
    if (filterSeverity !== "all") {
      results = results.filter(c => c.severity === filterSeverity);
    }
    if (filterStatus !== "all") {
      results = results.filter(c => c.status === filterStatus);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(c =>
        (c.id && String(c.id).toLowerCase().includes(lowerSearchTerm)) ||
        (c.details && c.details.toLowerCase().includes(lowerSearchTerm)) ||
        (c.resolutionSuggestion && c.resolutionSuggestion.toLowerCase().includes(lowerSearchTerm)) ||
        (c.conflictingClasses && c.conflictingClasses.some(cls =>
            (cls.maLopHocPhan && cls.maLopHocPhan.toLowerCase().includes(lowerSearchTerm)) ||
            (cls.tenLopHocPhan && cls.tenLopHocPhan.toLowerCase().includes(lowerSearchTerm)) ||
            (cls.giangVien && cls.giangVien.toLowerCase().includes(lowerSearchTerm)) ||
            (cls.diaDiem && cls.diaDiem.toLowerCase().includes(lowerSearchTerm))
        ))
      );
    }

    if (SORT_OPTIONS.length > 0) {
        const [sortKey, sortDirection] = sortOption.split('_');
        results.sort((a, b) => {
            let valA, valB;

            if (sortKey === 'createdAt') {
                valA = new Date(a.createdAt).getTime();
                valB = new Date(b.createdAt).getTime();
            } else if (sortKey === 'severity') {
                valA = severityOrder[a.severity] || 0;
                valB = severityOrder[b.severity] || 0;
            } else if (sortKey === 'status') {
                valA = statusOrder[a.status] || 0;
                valB = statusOrder[b.status] || 0;
            } else { 
                return 0;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return results;
  }, [conflicts, filterType, filterSeverity, filterStatus, searchTerm, sortOption]);

  const conflictStats = useMemo(() => {
    const stats = {
        total: conflicts.length, 
        filtered: processedConflicts.length, 
        bySeverity: { Cao: 0, 'Trung bình': 0, Thấp: 0 },
        byStatus: { moi: 0, dang_xu_ly: 0, da_xu_ly: 0 },
    };
    conflicts.forEach(c => { 
        if (stats.bySeverity.hasOwnProperty(c.severity)) stats.bySeverity[c.severity]++;
        if (stats.byStatus.hasOwnProperty(c.status)) stats.byStatus[c.status]++;
    });
    return stats;
  }, [conflicts, processedConflicts.length]);

  const handleExportCSV = () => {
    if (processedConflicts.length === 0) {
        toast.info("Không có dữ liệu để xuất.");
        return;
    }
    const headers = [
        "ID Xung đột", "Loại", "Mức độ", "Trạng thái", "Nguyên nhân chi tiết", "Gợi ý xử lý", "Ngày tạo",
        "Mã LHP 1", "Tên LHP 1", "Giảng viên LHP 1", "Thời gian LHP 1", "Địa điểm LHP 1",
        "Mã LHP 2", "Tên LHP 2", "Giảng viên LHP 2", "Thời gian LHP 2", "Địa điểm LHP 2",
    ];
    const rows = processedConflicts.map(c => {
        const rowData = [
            c.id,
            c.type,
            c.severity,
            STATUS_OPTIONS.find(s => s.value === c.status)?.label || c.status,
            `"${(c.details || '').replace(/"/g, '""')}"`,
            `"${(c.resolutionSuggestion || '').replace(/"/g, '""')}"`,
            formatDateTime(c.createdAt),
        ];
        for (let i = 0; i < 2; i++) {
            const cls = c.conflictingClasses?.[i];
            rowData.push(cls?.maLopHocPhan || '');
            rowData.push(cls?.tenLopHocPhan || '');
            rowData.push(cls?.giangVien || '');
            rowData.push(cls?.thoiGian || '');
            rowData.push(cls?.diaDiem || '');
        }
        return rowData.join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join("\n"); 
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
    link.setAttribute("download", `xung_dot_lich_hoc_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất CSV thành công!");
  };

  // Client-side auth render guards removed. UI will render based on data/error states.
  // if (loadingAuthGlobal) { ... } // Removed
  // if (!tokenInfo && !loadingAuthGlobal) { ... } // Removed

  return (
    <ScrollArea className="h-screen p-1 sm:p-2 md:p-4 bg-muted/40 dark:bg-gray-900">
      <TooltipProvider>
        <Card className="shadow-lg border dark:bg-gray-800 dark:border-gray-700 w-full">
          <CardHeader className="shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                    <CardTitle className="flex items-center gap-2 text-2xl font-semibold dark:text-white">
                    <CalendarX2 className="h-6 w-6 text-primary" />
                    Kiểm tra Xung đột Lịch học (Admin)
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400 mt-1">
                    Quản lý, phát hiện và xử lý các lớp học phần bị trùng lịch trong toàn hệ thống.
                    <br/>
                    <span className="text-xs italic">
                        {lastChecked ? `Lần kiểm tra cuối (toàn hệ thống): ${formatDateTime(lastChecked)}.` : (isLoadingFetch ? "Đang tải lịch sử kiểm tra..." : "Chưa có dữ liệu kiểm tra toàn hệ thống.")}
                    </span>
                    </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleRefreshData} variant="outline" size="sm" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700" disabled={isLoadingFetch || isLoadingCheck}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Làm mới DS Xung đột
                    </Button>
                    <Button onClick={handleExportCSV} variant="outline" size="sm" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700" disabled={processedConflicts.length === 0 || isLoadingFetch || isLoadingCheck}>
                        <FileDown className="mr-2 h-4 w-4" /> Xuất CSV Xung đột
                    </Button>
                    <Button onClick={handleCheckConflicts} disabled={isLoadingCheck || isLoadingFetch} className="bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600 dark:hover:bg-orange-700">
                    {isLoadingCheck ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang KT Toàn bộ...</>
                    ) : ( 'Chạy KT Toàn bộ' )}
                    </Button>
                </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col items-stretch gap-6">
            {/* NEW: Student Specific Conflict Check Section */}
            <Card className="w-full bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700/50 shrink-0">
                <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-lg font-medium flex items-center dark:text-gray-200">
                        <UserCheck className="h-5 w-5 mr-2 text-green-500" />
                        Kiểm tra Trùng lịch cho Sinh viên
                    </CardTitle>
                    <CardDescription className="text-xs dark:text-gray-400">
                        Kiểm tra một lớp học phần cụ thể có bị trùng lịch với các lớp đã đăng ký của một sinh viên không.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="maSinhVienInput" className="text-xs dark:text-gray-300">Mã Sinh Viên:</Label>
                            <Input 
                                id="maSinhVienInput" 
                                type="text" 
                                placeholder="Nhập mã sinh viên..." 
                                value={maSinhVienInput} 
                                onChange={(e) => setMaSinhVienInput(e.target.value)} 
                                className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <Label htmlFor="maLopHocPhanInput" className="text-xs dark:text-gray-300">Mã Lớp Học Phần:</Label>
                            <Input 
                                id="maLopHocPhanInput" 
                                type="text" 
                                placeholder="Nhập mã lớp học phần..." 
                                value={maLopHocPhanInput} 
                                onChange={(e) => setMaLopHocPhanInput(e.target.value)} 
                                className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                    <Button onClick={handleKiemTraTrungLichSinhVien} disabled={isLoadingTrungLich} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800">
                        {isLoadingTrungLich ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang kiểm tra...</>
                        ) : ( <><BookOpenCheck className="mr-2 h-4 w-4" /> Kiểm tra Trùng lịch SV</> )}
                    </Button>
                    {isLoadingTrungLich && <p className="text-sm text-muted-foreground dark:text-gray-400 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý yêu cầu...</p>}
                    {trungLichError && !isLoadingTrungLich && (
                        <Alert variant="destructive" className="dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Lỗi Kiểm tra Trùng lịch Sinh viên</AlertTitle>
                            <AlertDescription>{trungLichError}</AlertDescription>
                        </Alert>
                    )}
                    {trungLichResult && !isLoadingTrungLich && !trungLichError && (
                         <Alert variant={trungLichResult.startsWith("✅") ? "success" : (trungLichResult.startsWith("⚠️") ? "warning" : "default")} 
                                className={`${trungLichResult.startsWith("✅") ? 'dark:bg-green-900/30 dark:border-green-700 dark:text-green-300' : 
                                            (trungLichResult.startsWith("⚠️") ? 'dark:bg-yellow-900/40 dark:border-yellow-700 dark:text-yellow-300' :
                                            'dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300')}`}>
                            {trungLichResult.startsWith("✅") ? <CheckCircle2 className="h-4 w-4" /> : (trungLichResult.startsWith("⚠️") ? <AlertCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />)}
                            <AlertTitle>Kết quả Kiểm tra</AlertTitle>
                            <AlertDescription>{trungLichResult}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
            
            {/* <Separator className="my-4 dark:bg-gray-700" /> */}
            {/* ^^^ Tạm thời comment out Separator do lỗi module not found */}


            {/* Statistics Section (Admin General) - tokenInfo check removed for client bypass */}
            {!isLoadingFetch && !error && conflicts.length > 0 && (
                <Card className="w-full bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700/50 shrink-0">
                    <CardHeader className="pb-2 pt-3">
                        <CardTitle className="text-base font-medium flex items-center dark:text-gray-200">
                            <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                            Thống kê Xung đột Toàn Hệ thống (Tổng: {conflictStats.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 pb-3 dark:text-gray-300">
                        <div className="flex items-center"><strong>Mức độ Cao:</strong> <Badge variant="destructive" className="ml-1.5 px-1.5 py-0.5 text-xs">{conflictStats.bySeverity.Cao}</Badge></div>
                        <div className="flex items-center"><strong>Mức độ TB:</strong> <Badge className="ml-1.5 px-1.5 py-0.5 text-xs bg-orange-400 text-white">{conflictStats.bySeverity['Trung bình']}</Badge></div>
                        <div className="flex items-center"><strong>Mức độ Thấp:</strong> <Badge className="ml-1.5 px-1.5 py-0.5 text-xs bg-yellow-400 text-black">{conflictStats.bySeverity.Thấp}</Badge></div>
                        <div className="flex items-center"><strong>Trạng thái Mới:</strong> <Badge variant="secondary" className="ml-1.5 px-1.5 py-0.5 text-xs">{conflictStats.byStatus.moi}</Badge></div>
                        <div className="flex items-center"><strong>Đang xử lý:</strong> <Badge className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-500 text-white">{conflictStats.byStatus.dang_xu_ly}</Badge></div>
                        <div className="flex items-center"><strong>Đã xử lý:</strong> <Badge className="ml-1.5 px-1.5 py-0.5 text-xs bg-green-500 text-white">{conflictStats.byStatus.da_xu_ly}</Badge></div>
                    </CardContent>
                </Card>
            )}

            {/* Filter and Sort Section (Admin General) - tokenInfo check removed */}
            {!isLoadingFetch && !error && (conflicts.length > 0 || lastChecked) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <div className="relative lg:col-span-2">
                        <Label htmlFor="conflict-search" className="text-xs text-muted-foreground dark:text-gray-400">Tìm kiếm Xung đột HT:</Label>
                        <div className="relative">
                            <Input id="conflict-search" type="text" placeholder="ID, mã LHP, GV, phòng, chi tiết..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"/>
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400 mt-0.5" />
                            {searchTerm && (<Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 mt-0.5" onClick={() => setSearchTerm('')}><XIcon className="h-4 w-4 text-muted-foreground dark:text-gray-400"/></Button>)}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="conflict-filter-type" className="text-xs text-muted-foreground dark:text-gray-400">Loại xung đột HT:</Label>
                        <Select value={filterType} onValueChange={setFilterType}><SelectTrigger id="conflict-filter-type" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"><SelectValue placeholder="Loại xung đột" /></SelectTrigger><SelectContent className="dark:bg-gray-800 dark:border-gray-700"><SelectItem value="all" className="dark:text-gray-200 dark:hover:bg-gray-700">Tất cả loại</SelectItem><SelectItem value="Giảng viên" className="dark:text-gray-200 dark:hover:bg-gray-700">Giảng viên</SelectItem><SelectItem value="Phòng học" className="dark:text-gray-200 dark:hover:bg-gray-700">Phòng học</SelectItem></SelectContent></Select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="conflict-filter-severity" className="text-xs text-muted-foreground dark:text-gray-400">Mức độ XĐ HT:</Label>
                        <Select value={filterSeverity} onValueChange={setFilterSeverity}><SelectTrigger id="conflict-filter-severity" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"><SelectValue placeholder="Mức độ" /></SelectTrigger><SelectContent className="dark:bg-gray-800 dark:border-gray-700">{SEVERITY_OPTIONS.map(opt => (<SelectItem key={opt.value} value={opt.value} className="dark:text-gray-200 dark:hover:bg-gray-700">{opt.label}</SelectItem>))}</SelectContent></Select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="conflict-filter-status" className="text-xs text-muted-foreground dark:text-gray-400">Trạng thái XĐ HT:</Label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger id="conflict-filter-status" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"><SelectValue placeholder="Trạng thái" /></SelectTrigger><SelectContent className="dark:bg-gray-800 dark:border-gray-700">{STATUS_OPTIONS.map(opt => (<SelectItem key={opt.value} value={opt.value} className="dark:text-gray-200 dark:hover:bg-gray-700">{opt.label}</SelectItem>))}</SelectContent></Select>
                    </div>
                    <div className="flex flex-col gap-1 lg:col-start-3"> 
                        <Label htmlFor="conflict-sort" className="text-xs text-muted-foreground dark:text-gray-400">Sắp xếp XĐ HT:</Label>
                        <Select value={sortOption} onValueChange={setSortOption}><SelectTrigger id="conflict-sort" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"><ArrowUpDown className="h-3 w-3 mr-1.5 text-muted-foreground" /><SelectValue placeholder="Thứ tự sắp xếp" /></SelectTrigger><SelectContent className="dark:bg-gray-800 dark:border-gray-700">{SORT_OPTIONS.map(opt => (<SelectItem key={opt.value} value={opt.value} className="dark:text-gray-200 dark:hover:bg-gray-700">{opt.label}</SelectItem>))}</SelectContent></Select>
                    </div>
                </div>
            )}
            
            <div className="w-full flex flex-col flex-grow min-h-[300px]">
              {/* Loading State for fetching general conflicts - tokenInfo check removed */}
              {isLoadingFetch && (
                <div className="flex-grow flex items-center justify-center p-6 text-muted-foreground dark:text-gray-400">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Đang tải dữ liệu xung đột toàn hệ thống...</span>
                </div>
              )}

              {/* Error State for fetching general conflicts - tokenInfo check removed */}
              {/* This will show if API calls fail for any reason, including backend auth if applicable */}
              {!isLoadingFetch && error && (
                <div className="flex-grow flex items-center justify-center p-4">
                    <Alert variant="destructive" className="max-w-lg dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Lỗi Tải Dữ Liệu Xung Đột Hệ Thống</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
              )}
              
              {/* Empty State - No data at all - tokenInfo check removed */}
              {!isLoadingFetch && !error && !lastChecked && conflicts.length === 0 && (
                 <div className="flex-grow flex items-center justify-center p-4">
                    <Alert variant="default" className="max-w-lg dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Chưa có dữ liệu Xung đột Hệ thống</AlertTitle>
                    <AlertDescription>Hiện tại chưa có dữ liệu xung đột nào được ghi nhận trong toàn hệ thống. Hãy thử "Chạy KT Toàn bộ" để phát hiện xung đột hoặc "Làm mới DS Xung đột" nếu bạn nghĩ rằng đã có dữ liệu.</AlertDescription>
                    </Alert>
                 </div>
              )}
              
              {/* Empty State - Check run, no conflicts found - tokenInfo check removed */}
              {!isLoadingFetch && !error && lastChecked && conflicts.length === 0 && !isLoadingCheck && (
                 <div className="flex-grow flex items-center justify-center p-4">
                    <Alert variant="success" className="max-w-lg dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
                    <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                    <AlertTitle>Hoàn tất Kiểm tra Toàn Hệ thống</AlertTitle>
                    <AlertDescription>Không tìm thấy xung đột nào trong lịch học toàn hệ thống từ lần kiểm tra cuối.</AlertDescription>
                    </Alert>
                 </div>
              )}
              
              {/* Conflicts List Area - tokenInfo check removed */}
              {!isLoadingFetch && !error && conflicts.length > 0 && (
                <div className="flex flex-col flex-grow space-y-4">
                   <h3 className="text-lg font-semibold text-primary dark:text-sky-400 shrink-0">
                         Danh sách Xung đột Toàn Hệ thống ({conflictStats.filtered} {conflictStats.filtered !== conflictStats.total ? `trên tổng ${conflictStats.total}` : ''})
                   </h3>
                    {processedConflicts.length > 0 ? (
                       <div className="flex-grow relative">
                         <ScrollArea className="absolute inset-0 border rounded-md dark:border-gray-700">
                           <div className="p-1 sm:p-2 md:p-4 space-y-4">
                           {processedConflicts.map((conflict) => (
                             <div key={conflict.id} className="p-3 rounded-md border bg-background dark:bg-gray-700/40 dark:border-gray-600/70 shadow-sm hover:shadow-md transition-shadow">
                               <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                      <Badge variant={conflict.type === 'Giảng viên' ? 'destructive' : 'secondary'} className={`text-xs px-2 py-0.5 ${conflict.type === 'Giảng viên' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'}`}>{conflict.type}</Badge>
                                      <Badge className={`text-xs px-2 py-0.5 border ${getSeverityBadgeColor(conflict.severity)}`}>{conflict.severity}</Badge>
                                      <Badge className={`text-xs px-2 py-0.5 border ${getStatusBadgeColor(conflict.status)}`}>{STATUS_OPTIONS.find(s => s.value === conflict.status)?.label || conflict.status}</Badge>
                                  </div>
                                  <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                      <Select value={conflict.status} onValueChange={(newStatus) => handleUpdateConflictStatus(conflict.id, newStatus)}>
                                          <SelectTrigger className="h-8 text-xs w-full sm:w-[150px] dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"><Edit3 className="h-3 w-3 mr-1.5" /><SelectValue placeholder="Đổi trạng thái..." /></SelectTrigger>
                                          <SelectContent className="dark:bg-gray-700 dark:border-gray-600">{STATUS_OPTIONS.filter(s => s.value !== 'all').map(opt => (<SelectItem key={opt.value} value={opt.value} className="text-xs dark:text-gray-200 dark:hover:bg-gray-600">{opt.label}</SelectItem>))}</SelectContent>
                                      </Select>
                                  </div>
                               </div>
                               <p className="text-sm font-semibold dark:text-gray-100 mb-1">{conflict.details}</p>
                               {conflict.resolutionSuggestion && (<p className="text-xs italic text-blue-600 dark:text-blue-400 mb-2"><strong className="font-medium">Gợi ý xử lý:</strong> {conflict.resolutionSuggestion}</p>)}
                               <div className="pl-1 text-xs text-muted-foreground dark:text-gray-400 space-y-1.5">
                                  <p className="font-medium text-gray-700 dark:text-gray-300">Các lớp liên quan:</p>
                                  {conflict.conflictingClasses?.map((cls, clsIndex) => (
                                      <div key={cls.classId || `${cls.maLopHocPhan}_${clsIndex}`} className="ml-2 p-2 border-l-2 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/70 rounded-r-md flex justify-between items-center">
                                          <div><strong className="dark:text-gray-200">{cls.maLopHocPhan}</strong> ({cls.tenLopHocPhan})<div className="text-[11px] text-gray-500 dark:text-gray-500">{cls.thoiGian} @ {cls.diaDiem} (GV: {cls.giangVien || 'N/A'})</div></div>
                                          <Tooltip><TooltipTrigger asChild><Link to={`/admin/lop-hoc-phan/${cls.classId || cls.maLopHocPhan}`}><Button variant="outline" size="icon" className="h-7 w-7 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"><Eye className="h-3.5 w-3.5" /></Button></Link></TooltipTrigger><TooltipContent className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"><p>Xem chi tiết LHP {cls.maLopHocPhan}</p></TooltipContent></Tooltip>
                                      </div>
                                  ))}
                               </div>
                               <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-right">ID: {String(conflict.id)?.substring(0,15)}... | Tạo: {formatDateTime(conflict.createdAt)}</p>
                             </div>
                           ))}
                           </div>
                         </ScrollArea>
                       </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center">
                            <p className="text-sm text-muted-foreground dark:text-gray-400 italic text-center py-4">
                                Không có xung đột toàn hệ thống nào khớp với bộ lọc và tiêu chí tìm kiếm hiện tại.
                            </p>
                        </div>
                    )}
                   <p className="text-sm text-muted-foreground dark:text-gray-400 pt-2 shrink-0">
                       Vui lòng kiểm tra và điều chỉnh lịch của các lớp học phần bị xung đột trong toàn hệ thống.
                   </p>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="dark:border-t dark:border-gray-700 pt-4 shrink-0">
            <div className="text-xs text-muted-foreground dark:text-gray-400">
                {/* tokenInfo check removed from footer message */}
                {lastChecked ? `Dữ liệu xung đột toàn hệ thống hiển thị từ lần kiểm tra cuối lúc ${formatDateTime(lastChecked)}.` : 
                 "Chưa thực hiện kiểm tra xung đột toàn hệ thống."}
            </div>
          </CardFooter>
        </Card>
      </TooltipProvider>
    </ScrollArea>
  );
};

export default AdminConflicts;
