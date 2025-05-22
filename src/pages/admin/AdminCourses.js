// src/pages/admin/AdminCourses.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../api/axios";
import {
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  BookOpenCheck,
  Loader2,
  AlertCircle,
  Search,
  Info,
  XIcon,
  CalendarRange,
  Users as UsersIcon,
  User,
  MapPin,
  ClockIcon,
  Tag,
  Library,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { toast } from "react-toastify";
import {
  AlertDialog,
  // AlertDialogAction, // Replaced with Button for consistency
  // AlertDialogCancel, // Replaced with Button for consistency
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Badge } from "../../components/ui/badge";

// Helper function to extract user-friendly error messages
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


const initialCourseForm = {
  tenLopHocPhan: "",
  hocKy: "",
  namHoc: "",
  thu: "",
  tietBatDau: "",
  tietKetThuc: "",
  diaDiem: "",
  soLuongSinhVienToiDa: 50,
  giangVien: "",
  maMonHoc: "",
};

const TABLE_COL_SPAN = 8; // Adjusted based on visible columns

const AdminCourses = () => {
  // MODIFIED: Bypass all client-side authorization checks
  const outletVars = useOutletContext(); 
  // eslint-disable-next-line no-unused-vars
  const loadingAuthGlobal = false; // Simulate authentication is always complete
  // eslint-disable-next-line no-unused-vars
  const tokenInfo = outletVars?.tokenInfo || { 
      role: 'admin_mock_client_auth_fully_bypassed', 
      userId: 'mock_user_client_auth_fully_bypassed',
      message: 'Client-side authorization checks fully bypassed for this component.' 
  };

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [courseIdToDelete, setCourseIdToDelete] = useState(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false);
  const [viewingCourseDetails, setViewingCourseDetails] = useState(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  // Fetch course and subject lists
  const fetchCoursesAndSubjects = useCallback(async () => {
    // Client-side token check removed as auth is bypassed for this component
    setLoading(true);
    setError(null); // Clear previous errors before fetching
    let courseData = [];
    let subjectData = [];
    let fetchError = null; // Accumulate errors from individual fetches

    try {
      console.log(
        "AdminCourses: Attempting to load courses and subjects..."
      );
      const courseRes = await api.get("/lophocphan").catch((err) => {
        console.error("Error loading courses:", err);
        const detailedError = getDetailedErrorMessage(err);
        toast.error(`Lỗi tải danh sách lớp học phần: ${detailedError}`);
        fetchError = fetchError ? `${fetchError}\nLỗi LHP: ${detailedError}` : `Lỗi LHP: ${detailedError}`;
        return { data: [] }; // Graceful degradation
      });
      courseData = courseRes.data || [];

      const subjectRes = await api.get("/monhoc").catch((err) => {
        console.error("Error loading subjects:", err);
        const detailedError = getDetailedErrorMessage(err);
        toast.error(`Lỗi tải danh sách môn học: ${detailedError}`);
        fetchError = fetchError ? `${fetchError}\nLỗi Môn học: ${detailedError}` : `Lỗi Môn học: ${detailedError}`;
        return { data: [] }; // Graceful degradation
      });
      subjectData = subjectRes.data || [];

      setCourses(courseData);
      setSubjects(subjectData);
      
      if (fetchError) {
        setError(fetchError); // Set accumulated error if any
      } else if (courseData.length > 0 || subjectData.length > 0) {
        console.log("AdminCourses: Data loaded successfully (or partially).");
        setError(null); // Clear global error if fetches were successful or partially successful without specific errors
      } else {
        console.log("AdminCourses: No courses or subjects found, or both API calls failed silently.");
        // setError("Không tìm thấy dữ liệu lớp học phần hoặc môn học."); // Optional
      }

    } catch (err) {
      // This catch is for unexpected errors not caught by individual .catch()
      console.error("AdminCourses: A critical error occurred during data fetching.", err);
      const detailedError = getDetailedErrorMessage(err);
      setError(detailedError); // Set this as the primary error
      toast.error(`Lỗi nghiêm trọng khi tải dữ liệu: ${detailedError}`);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed 'error' from dependency array to prevent re-fetch loops on error state change.

  useEffect(() => {
    // Client-side auth checks removed, directly call fetch
    fetchCoursesAndSubjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const filteredCourses = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowerSearchTerm) return courses;
    return courses.filter(
      (hp) =>
        (hp.maLopHocPhan &&
          hp.maLopHocPhan.toLowerCase().includes(lowerSearchTerm)) ||
        (hp.tenLopHocPhan &&
          hp.tenLopHocPhan.toLowerCase().includes(lowerSearchTerm)) ||
        (hp.maMonHoc && hp.maMonHoc.toLowerCase().includes(lowerSearchTerm)) ||
        (hp.tenMonHoc &&
          hp.tenMonHoc.toLowerCase().includes(lowerSearchTerm)) ||
        (hp.giangVien &&
          hp.giangVien.toLowerCase().includes(lowerSearchTerm)) ||
        (hp.hocKy && hp.hocKy.toLowerCase().includes(lowerSearchTerm)) ||
        (hp.namHoc && hp.namHoc.toLowerCase().includes(lowerSearchTerm))
    );
  }, [searchTerm, courses]);

  const openAddDialog = () => {
    setCourseForm(initialCourseForm);
    setEditingCourse(null);
    setFormError("");
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (course) => {
    setEditingCourse(course);
    setCourseForm({
      tenLopHocPhan: course.tenLopHocPhan || "",
      hocKy: course.hocKy || "",
      namHoc: course.namHoc || "",
      thu: course.thu || "",
      tietBatDau: String(course.tietBatDau || ""), 
      tietKetThuc: String(course.tietKetThuc || ""), 
      diaDiem: course.diaDiem || "",
      soLuongSinhVienToiDa: course.soLuongSinhVienToiDa ?? 0,
      giangVien: course.giangVien || "",
      maMonHoc: course.maMonHoc || "",
    });
    setFormError("");
    setIsEditDialogOpen(true);
  };
  
  const openDetailCourseDialog = (course) => {
    setViewingCourseDetails(course);
    setIsDetailViewOpen(true);
  };

  const handleInitiateDelete = (courseId) => {
    if (!courseId) {
      toast.error("Mã lớp học phần không hợp lệ.");
      return;
    }
    setCourseIdToDelete(courseId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const closeDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDetailViewOpen(false);
    setIsConfirmDeleteDialogOpen(false);
    setEditingCourse(null);
    setViewingCourseDetails(null);
    setCourseIdToDelete(null);
    setCourseForm(initialCourseForm);
    setFormError("");
  };

  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue =
      type === "number" ? (value === "" ? "" : parseInt(value, 10)) : value;
    setCourseForm((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSubjectSelectChange = (maMonHocValue) => {
    setCourseForm((prev) => {
      const selectedSubject = subjects.find(
        (s) => s.maMonHoc === maMonHocValue
      );
      const defaultTenLop = selectedSubject
        ? `${selectedSubject.tenMonHoc} - Nhóm 1`
        : prev.tenLopHocPhan;
      return {
        ...prev,
        maMonHoc: maMonHocValue,
        tenLopHocPhan:
          !prev.tenLopHocPhan || prev.tenLopHocPhan.includes(" - Nhóm ")
            ? defaultTenLop
            : prev.tenLopHocPhan,
      };
    });
  };

  const validateForm = (form) => {
    if (
      !form.maMonHoc ||
      !form.tenLopHocPhan.trim() ||
      !form.hocKy.trim() ||
      !form.namHoc.trim() ||
      !form.thu.trim() ||
      !String(form.tietBatDau).trim() || 
      !String(form.tietKetThuc).trim() || 
      !form.diaDiem.trim()
    ) {
      setFormError("Vui lòng điền đầy đủ các trường có dấu (*).");
      return false;
    }
    if (
      isNaN(parseInt(form.soLuongSinhVienToiDa)) ||
      parseInt(form.soLuongSinhVienToiDa) < 0
    ) {
      setFormError("Sĩ số tối đa phải là một số không âm.");
      return false;
    }
    if (!/^\d{4}-\d{4}$/.test(form.namHoc.trim())) {
      setFormError("Định dạng năm học không hợp lệ (VD: 2024-2025).");
      return false;
    }
    if (!/^HK[1-3]$|^HKHE$/i.test(form.hocKy.trim())) {
      setFormError("Học kỳ không hợp lệ (VD: HK1, HK2, HK3, HKHE).");
      return false;
    }
    if (
      !/^(Tiết\s*)?\d+([-\s,Tiết\s\d]*)$/i.test(String(form.tietBatDau).trim()) ||
      !/^(Tiết\s*)?\d+([-\s,Tiết\s\d]*)$/i.test(String(form.tietKetThuc).trim())
    ) {
      setFormError("Định dạng tiết học không hợp lệ (VD: 1 hoặc Tiết 1-3).");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(courseForm)) return;

    setIsSaving(true);
    const payload = { ...courseForm };
    payload.soLuongSinhVienToiDa = parseInt(payload.soLuongSinhVienToiDa, 10);
    payload.tietBatDau = parseInt(String(payload.tietBatDau).replace(/\D/g, ''), 10); 
    payload.tietKetThuc = parseInt(String(payload.tietKetThuc).replace(/\D/g, ''), 10);


    try {
      await api.post("/lophocphan", payload);
      toast.success("Thêm lớp học phần thành công!");
      fetchCoursesAndSubjects(); 
      closeDialogs();
    } catch (err) {
      const detailedError = getDetailedErrorMessage(err);
      setFormError(detailedError);
      toast.error(`Thêm thất bại: ${detailedError}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCourse || !validateForm(courseForm)) return;

    setIsSaving(true);
    const payload = { ...courseForm };
    payload.soLuongSinhVienToiDa = parseInt(payload.soLuongSinhVienToiDa, 10);
    payload.tietBatDau = parseInt(String(payload.tietBatDau).replace(/\D/g, ''), 10); 
    payload.tietKetThuc = parseInt(String(payload.tietKetThuc).replace(/\D/g, ''), 10); 

    try {
      await api.put(`/lophocphan/${editingCourse.maLopHocPhan}`, payload);
      toast.success("Cập nhật lớp học phần thành công!");
      fetchCoursesAndSubjects(); 
      closeDialogs();
    } catch (err) { 
      const detailedError = getDetailedErrorMessage(err);
      setFormError(detailedError);
      toast.error(`Cập nhật thất bại: ${detailedError}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourseConfirm = async () => {
    const idToDelete = courseIdToDelete;
    if (!idToDelete) {
      toast.error("Mã lớp học phần không hợp lệ.");
      closeDialogs();
      return;
    }
    setIsSaving(true); 
    try {
      await api.delete(`/lophocphan/${idToDelete}`);
      fetchCoursesAndSubjects();
      toast.success(`Xóa lớp học phần ${idToDelete} thành công!`);
    } catch (err) {
      const detailedError = getDetailedErrorMessage(err);
      toast.error(`Xóa thất bại: ${detailedError}`);
    } finally {
      setIsSaving(false);
      closeDialogs();
    }
  };
  
  if (loading && courses.length === 0 && subjects.length === 0) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground dark:text-gray-400">
          Đang tải dữ liệu trang...
        </p>
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-lg border dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-semibold dark:text-white">
                <BookOpenCheck className="h-6 w-6 text-primary" /> Quản lý Lớp
                học phần
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Xem, thêm, sửa, xóa thông tin các lớp học phần.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) closeDialogs(); else setIsAddDialogOpen(true); }}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  onClick={openAddDialog}
                  className="gap-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Thêm Lớp HP
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
                <form onSubmit={handleAddSubmit}>
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">
                      Thêm Lớp học phần mới
                    </DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                      Điền thông tin chi tiết cho lớp học phần. Các trường có dấu (*) là bắt buộc.
                    </DialogDescription>
                  </DialogHeader>
                  {formError && (
                    <Alert variant="destructive" className="my-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Lỗi Form</AlertTitle>
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                  <ScrollArea className="max-h-[65vh] p-1 pr-3"> 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-maMonHoc"
                          className="dark:text-gray-300"
                        >
                          Môn học*
                        </Label>
                        <Select
                          name="maMonHoc"
                          value={courseForm.maMonHoc}
                          onValueChange={handleSubjectSelectChange}
                        >
                          <SelectTrigger
                            id="add-maMonHoc"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <SelectValue placeholder="Chọn môn học" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {subjects.length > 0 ? (
                              subjects.map((subject) => (
                                <SelectItem
                                  key={subject.maMonHoc}
                                  value={subject.maMonHoc}
                                  className="dark:text-gray-200 dark:hover:!bg-gray-700"
                                >
                                  {subject.maMonHoc} - {subject.tenMonHoc} (
                                  {subject.soTinChi} TC)
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem
                                value="loading-subjects"
                                disabled
                                className="dark:text-gray-400"
                              >
                                {loading && subjects.length === 0 ? "Đang tải môn học..." : "Không có môn học"}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-tenLopHocPhan"
                          className="dark:text-gray-300"
                        >
                          Tên Lớp học phần*
                        </Label>
                        <Input
                          id="add-tenLopHocPhan"
                          name="tenLopHocPhan"
                          value={courseForm.tenLopHocPhan}
                          onChange={handleFormChange}
                          required
                          placeholder="VD: Lập trình Java - Nhóm 1"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-hocKy"
                          className="dark:text-gray-300"
                        >
                          Học kỳ*
                        </Label>
                        <Input
                          id="add-hocKy"
                          name="hocKy"
                          value={courseForm.hocKy}
                          onChange={handleFormChange}
                          required
                          placeholder="VD: HK1, HK2, HKHE"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-namHoc"
                          className="dark:text-gray-300"
                        >
                          Năm học*
                        </Label>
                        <Input
                          id="add-namHoc"
                          name="namHoc"
                          value={courseForm.namHoc}
                          onChange={handleFormChange}
                          required
                          placeholder="VD: 2024-2025"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-giangVien"
                          className="dark:text-gray-300"
                        >
                          Giảng viên
                        </Label>
                        <Input
                          id="add-giangVien"
                          name="giangVien"
                          value={courseForm.giangVien}
                          onChange={handleFormChange}
                          placeholder="VD: Nguyễn Văn A"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="add-thu" className="dark:text-gray-300">
                          Lịch học (Thứ)*
                        </Label>
                        <Input
                          id="add-thu"
                          name="thu"
                          value={courseForm.thu}
                          onChange={handleFormChange}
                          required
                          placeholder="VD: Thứ 2, Thứ 4"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="add-tietBatDau"
                            className="dark:text-gray-300"
                          >
                            Tiết bắt đầu*
                          </Label>
                          <Input
                            id="add-tietBatDau"
                            name="tietBatDau"
                            value={courseForm.tietBatDau}
                            onChange={handleFormChange}
                            required
                            placeholder="VD: 1 hoặc Tiết 1"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="add-tietKetThuc"
                            className="dark:text-gray-300"
                          >
                            Tiết kết thúc*
                          </Label>
                          <Input
                            id="add-tietKetThuc"
                            name="tietKetThuc"
                            value={courseForm.tietKetThuc}
                            onChange={handleFormChange}
                            required
                            placeholder="VD: 3 hoặc Tiết 3"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-diaDiem"
                          className="dark:text-gray-300"
                        >
                          Địa điểm*
                        </Label>
                        <Input
                          id="add-diaDiem"
                          name="diaDiem"
                          value={courseForm.diaDiem}
                          onChange={handleFormChange}
                          required
                          placeholder="VD: P.A101, Online"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-soLuongSinhVienToiDa"
                          className="dark:text-gray-300"
                        >
                          Sĩ số tối đa*
                        </Label>
                        <Input
                          id="add-soLuongSinhVienToiDa"
                          name="soLuongSinhVienToiDa"
                          type="number"
                          value={courseForm.soLuongSinhVienToiDa}
                          onChange={handleFormChange}
                          required
                          min="0"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </ScrollArea>
                  <DialogFooter className="pt-4 border-t dark:border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeDialogs}
                      disabled={isSaving}
                      className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={!courseForm.maMonHoc || isSaving}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
                      Lưu Lớp HP
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-6 relative">
            <Input
              placeholder="Tìm Mã/Tên LHP, Mã/Tên MH, GV, Kỳ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-10"
              aria-label="Tìm kiếm lớp học phần"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchTerm("")}
                aria-label="Xóa tìm kiếm"
              >
                <XIcon className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error && !loading && (
            <div className="p-6">
                <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi Tải Dữ Liệu</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
          )}
          {loading && !error && (courses.length === 0 && subjects.length === 0) && (
             <div className="flex justify-center items-center p-10 min-h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground dark:text-gray-400">Đang tải danh sách...</p>
            </div>
          )}

          {!loading && (
            <ScrollArea className="h-[calc(100vh-450px)] md:h-[calc(100vh-400px)]"> 
              <Table className="min-w-full">
                <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-900 shadow-sm">
                  <TableRow className="border-b border-gray-200 dark:border-gray-700">
                    <TableHead className="w-[100px] py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Mã LHP
                    </TableHead>
                    <TableHead className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Tên Lớp học phần
                    </TableHead>
                    <TableHead className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Môn học (TC)
                    </TableHead>
                    <TableHead className="hidden md:table-cell py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Học kỳ
                    </TableHead>
                    <TableHead className="hidden lg:table-cell py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Lịch học
                    </TableHead>
                    <TableHead className="hidden md:table-cell py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Giảng viên
                    </TableHead>
                    <TableHead className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Sĩ số (ĐK/Max)
                    </TableHead>
                    <TableHead className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((hp) => (
                      <TableRow
                        key={hp.maLopHocPhan}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <TableCell className="py-3 px-4 text-sm text-gray-700 dark:text-gray-100 font-medium">
                          {hp.maLopHocPhan}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                          {hp.tenLopHocPhan}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                          <div className="font-medium">{hp.maMonHoc}</div>
                          <div className="text-xs text-muted-foreground dark:text-gray-400">
                            {hp.tenMonHoc} ({hp.soTinChi || "N/A"} TC)
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                          {hp.hocKy} - {hp.namHoc}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs dark:text-gray-300 py-3 px-4">
                          {hp.thu
                            ? `${hp.thu}, Tiết ${hp.tietBatDau}-${hp.tietKetThuc}, ${hp.diaDiem}`
                            : "Chưa có"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                          {hp.giangVien || "N/A"}
                        </TableCell>
                        <TableCell className="text-center py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                          <Badge
                            variant={
                              hp.soLuongDaDangKy >= hp.soLuongSinhVienToiDa
                                ? "destructive"
                                : "secondary"
                            }
                            className="dark:bg-gray-700 dark:text-gray-200"
                          >
                            {hp.soLuongDaDangKy ?? 0}/
                            {hp.soLuongSinhVienToiDa ?? "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                              >
                                <MoreHorizontal className="h-4 w-4" />{" "}
                                <span className="sr-only">Mở menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md w-48"
                            >
                              <DropdownMenuLabel className="dark:text-gray-300 px-2 py-1.5 text-xs">
                                Hành động
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                              <DropdownMenuItem
                                onClick={() => openDetailCourseDialog(hp)}
                                className="cursor-pointer text-gray-700 hover:!bg-gray-100 dark:text-gray-200 dark:hover:!bg-gray-700 dark:focus:bg-gray-700 flex items-center px-2 py-1.5 text-sm"
                              >
                                <Info className="mr-2 h-4 w-4" /> Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEditDialog(hp)}
                                className="cursor-pointer text-gray-700 hover:!bg-gray-100 dark:text-gray-200 dark:hover:!bg-gray-700 dark:focus:bg-gray-700 flex items-center px-2 py-1.5 text-sm"
                              >
                                <Pencil className="mr-2 h-4 w-4" /> Sửa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleInitiateDelete(hp.maLopHocPhan);
                                }}
                                className="text-red-500 focus:text-red-500 dark:text-red-400 hover:!bg-red-100 dark:hover:!bg-red-900/30 focus:bg-red-100 dark:focus:bg-red-900/40 cursor-pointer flex items-center px-2 py-1.5 text-sm"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                     !error && !loading && ( 
                        <TableRow className="border-b border-gray-200 dark:border-gray-700">
                        <TableCell
                            colSpan={TABLE_COL_SPAN}
                            className="h-24 text-center text-muted-foreground dark:text-gray-400 py-3 px-4"
                        >
                            {searchTerm
                            ? `Không tìm thấy lớp học phần với từ khóa "${searchTerm}".`
                            : "Chưa có lớp học phần nào."}
                        </TableCell>
                        </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>

        <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-xs text-muted-foreground dark:text-gray-400">
            Hiển thị <strong>{filteredCourses.length}</strong> trên tổng số{" "}
            <strong>{courses.length}</strong> lớp học phần.
          </div>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) closeDialogs(); else setIsEditDialogOpen(true); }}>
        <DialogContent className="sm:max-w-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
          {editingCourse && (
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  Sửa thông tin Lớp học phần
                </DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Cập nhật chi tiết cho lớp:{" "}
                  <span className="font-semibold">
                    {editingCourse.maLopHocPhan} - {editingCourse.tenLopHocPhan}
                  </span>. Các trường có dấu (*) là bắt buộc.
                </DialogDescription>
              </DialogHeader>
              {formError && (
                <Alert variant="destructive" className="my-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Lỗi Form</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <ScrollArea className="max-h-[65vh] p-1 pr-3"> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-maMonHoc"
                      className="dark:text-gray-300"
                    >
                      Môn học*
                    </Label>
                    <Select
                      name="maMonHoc"
                      value={courseForm.maMonHoc}
                      onValueChange={handleSubjectSelectChange}
                      required
                    >
                      <SelectTrigger
                        id="edit-maMonHoc"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <SelectValue placeholder="Chọn môn học" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        {subjects.map((subject) => (
                          <SelectItem
                            key={subject.maMonHoc}
                            value={subject.maMonHoc}
                            className="dark:text-gray-200 dark:hover:!bg-gray-700"
                          >
                            {subject.maMonHoc} - {subject.tenMonHoc} (
                            {subject.soTinChi} TC)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-tenLopHocPhan"
                      className="dark:text-gray-300"
                    >
                      Tên Lớp học phần*
                    </Label>
                    <Input
                      id="edit-tenLopHocPhan"
                      name="tenLopHocPhan"
                      value={courseForm.tenLopHocPhan}
                      onChange={handleFormChange}
                      required
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-hocKy" className="dark:text-gray-300">
                      Học kỳ*
                    </Label>
                    <Input
                      id="edit-hocKy"
                      name="hocKy"
                      value={courseForm.hocKy}
                      onChange={handleFormChange}
                      required
                      placeholder="VD: HK1"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-namHoc" className="dark:text-gray-300">
                      Năm học*
                    </Label>
                    <Input
                      id="edit-namHoc"
                      name="namHoc"
                      value={courseForm.namHoc}
                      onChange={handleFormChange}
                      required
                      placeholder="VD: 2024-2025"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-giangVien"
                      className="dark:text-gray-300"
                    >
                      Giảng viên
                    </Label>
                    <Input
                      id="edit-giangVien"
                      name="giangVien"
                      value={courseForm.giangVien}
                      onChange={handleFormChange}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-thu" className="dark:text-gray-300">
                      Lịch học (Thứ)*
                    </Label>
                    <Input
                      id="edit-thu"
                      name="thu"
                      value={courseForm.thu}
                      onChange={handleFormChange}
                      required
                      placeholder="VD: Thứ 2, Thứ 4"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="edit-tietBatDau"
                        className="dark:text-gray-300"
                      >
                        Tiết bắt đầu*
                      </Label>
                      <Input
                        id="edit-tietBatDau"
                        name="tietBatDau"
                        value={courseForm.tietBatDau}
                        onChange={handleFormChange}
                        required
                        placeholder="VD: 1"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="edit-tietKetThuc"
                        className="dark:text-gray-300"
                      >
                        Tiết kết thúc*
                      </Label>
                      <Input
                        id="edit-tietKetThuc"
                        name="tietKetThuc"
                        value={courseForm.tietKetThuc}
                        onChange={handleFormChange}
                        required
                        placeholder="VD: 3"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-diaDiem"
                      className="dark:text-gray-300"
                    >
                      Địa điểm*
                    </Label>
                    <Input
                      id="edit-diaDiem"
                      name="diaDiem"
                      value={courseForm.diaDiem}
                      onChange={handleFormChange}
                      required
                      placeholder="VD: P.A101"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-soLuongSinhVienToiDa"
                      className="dark:text-gray-300"
                    >
                      Sĩ số tối đa*
                    </Label>
                    <Input
                      id="edit-soLuongSinhVienToiDa"
                      name="soLuongSinhVienToiDa"
                      type="number"
                      value={courseForm.soLuongSinhVienToiDa}
                      onChange={handleFormChange}
                      required
                      min="0"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4 border-t dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialogs}
                  disabled={isSaving}
                  className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={!courseForm.maMonHoc || isSaving}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Xem Chi Tiết Lớp Học Phần */}
      <Dialog open={isDetailViewOpen} onOpenChange={(isOpen) => { if (!isOpen) closeDialogs(); else setIsDetailViewOpen(true); }}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
          {viewingCourseDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="dark:text-white flex items-center gap-2 text-xl">
                  <BookOpenCheck className="h-6 w-6 text-primary" /> Chi tiết
                  Lớp Học Phần
                </DialogTitle>
                <DialogDescription className="dark:text-gray-400 pt-1">
                  {viewingCourseDetails.maLopHocPhan} -{" "}
                  {viewingCourseDetails.tenLopHocPhan}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[65vh] pr-3"> 
                <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-3 py-4 text-sm">
                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <Tag className="inline mr-2 h-4 w-4" />
                    Mã LHP:
                  </span>{" "}
                  <span className="dark:text-gray-200 font-medium">
                    {viewingCourseDetails.maLopHocPhan}
                  </span>
                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <Library className="inline mr-2 h-4 w-4" />
                    Môn học:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingCourseDetails.tenMonHoc} (
                    {viewingCourseDetails.maMonHoc} -{" "}
                    {viewingCourseDetails.soTinChi || "N/A"} TC)
                  </span>
                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <CalendarRange className="inline mr-2 h-4 w-4" />
                    Học kỳ:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingCourseDetails.hocKy} - {viewingCourseDetails.namHoc}
                  </span>
                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <ClockIcon className="inline mr-2 h-4 w-4" />
                    Lịch học:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingCourseDetails.thu}, Tiết{" "}
                    {viewingCourseDetails.tietBatDau} -{" "}
                    {viewingCourseDetails.tietKetThuc}
                  </span>
                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <MapPin className="inline mr-2 h-4 w-4" />
                    Địa điểm:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingCourseDetails.diaDiem}
                  </span>
                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <User className="inline mr-2 h-4 w-4" />
                    Giảng viên:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingCourseDetails.giangVien || "Chưa có"}
                  </span>
                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <UsersIcon className="inline mr-2 h-4 w-4" />
                    Sĩ số:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingCourseDetails.soLuongDaDangKy ?? 0} /{" "}
                    {viewingCourseDetails.soLuongSinhVienToiDa}
                  </span>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4 border-t dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={closeDialogs}
                  className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200"
                >
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog xác nhận xóa Lớp Học Phần */}
      <AlertDialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={(isOpen) => { if (!isOpen) closeDialogs(); else setIsConfirmDeleteDialogOpen(true); }}
      >
        <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Xác nhận xóa?
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa lớp
              học phần có mã "{courseIdToDelete}"? Các dữ liệu liên quan (như đăng ký của sinh viên) cũng có thể bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t dark:border-gray-700 pt-4">
            <Button
              variant="outline"
              onClick={closeDialogs}
              disabled={isSaving}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourseConfirm}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận Xóa
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
export default AdminCourses;
