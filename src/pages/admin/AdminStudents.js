// src/pages/admin/AdminStudents.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../api/axios";
import {
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  Loader2,
  AlertCircle,
  Search,
  Info,
  UserSquare2,
  XIcon,
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

const initialAddStudentForm = {
  maSinhVien: "",
  hoTen: "",
  email: "",
  gioiTinh: "",
  ngaySinh: "", // yyyy-MM-dd
  noiSinh: "",
  lopHoc: "",
  khoaHoc: "",
  bacDaoTao: "",
  loaiHinhDaoTao: "",
  maNganh: "",
  avatarUrl: "",
  matKhau: "",
  confirmMatKhau: "",
};

const initialEditStudentForm = {
  maSinhVien: "",
  hoTen: "",
  email: "",
  gioiTinh: "",
  ngaySinh: "",
  noiSinh: "",
  lopHoc: "",
  khoaHoc: "",
  bacDaoTao: "",
  loaiHinhDaoTao: "",
  maNganh: "",
  avatarUrl: "",
  matKhau: "", // thêm
  confirmMatKhau: "", // thêm
};

const TABLE_COL_SPAN = 7;

const AdminStudents = () => {
  const { loadingAuthGlobal, tokenInfo } = useOutletContext() || {
    loadingAuthGlobal: true,
    tokenInfo: null,
  };

  const [students, setStudents] = useState([]);
  const [nganhHocs, setNganhHocs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState(initialAddStudentForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [viewingStudentDetails, setViewingStudentDetails] = useState(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [studentIdToDelete, setStudentIdToDelete] = useState(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false);

  // Fetch ngành học
  const fetchNganhHoc = useCallback(async () => {
    if (!tokenInfo) return;
    try {
      const response = await api.get("/nganhhoc");
      setNganhHocs(response.data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách ngành học.");
      setNganhHocs([]);
    }
  }, [tokenInfo]);

  // Fetch sinh viên
  const fetchStudents = useCallback(async () => {
    if (!tokenInfo) return;
    setLoadingData(true);
    setError(null);
    try {
      const response = await api.get("/sinhvien");
      console.log("fetchStudents response.data:", response.data); // <-- kiểm tra ở đây
      setStudents(response.data || []);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải danh sách sinh viên.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoadingData(false);
    }
  }, [tokenInfo]);

  useEffect(() => {
    if (!loadingAuthGlobal && tokenInfo) {
      fetchStudents();
      fetchNganhHoc();
    } else if (!loadingAuthGlobal && !tokenInfo) {
      setLoadingData(false);
      setError(
        "Phiên làm việc đã hết hạn hoặc không hợp lệ. Không thể tải dữ liệu."
      );
    }
  }, [fetchStudents, fetchNganhHoc, loadingAuthGlobal, tokenInfo]);

  // Filter sinh viên theo search term
  const filteredStudents = useMemo(() => {
    const lower = searchTerm.toLowerCase().trim();
    if (!lower) return students;
    return students.filter(
      (sv) =>
        (sv.maSinhVien && sv.maSinhVien.toLowerCase().includes(lower)) ||
        (sv.hoTen && sv.hoTen.toLowerCase().includes(lower)) ||
        (sv.email && sv.email.toLowerCase().includes(lower)) ||
        (sv.taiKhoan?.tenDangNhap &&
          sv.taiKhoan.tenDangNhap.toLowerCase().includes(lower)) ||
        (sv.lopHoc && sv.lopHoc.toLowerCase().includes(lower)) ||
        (sv.nganhHoc?.tenNganh &&
          sv.nganhHoc.tenNganh.toLowerCase().includes(lower))
    );
  }, [searchTerm, students]);

  const openAddDialog = () => {
    setStudentForm(initialAddStudentForm);
    setEditingStudent(null);
    setFormError("");
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (student) => {
    setEditingStudent(student);
    setStudentForm({
      maSinhVien: student.maSinhVien || "",
      hoTen: student.hoTen || "",
      email: student.email || "",
      gioiTinh: student.gioiTinh || "",
      ngaySinh: student.ngaySinh ? formatDateForInput(student.ngaySinh) : "",
      noiSinh: student.noiSinh || "",
      lopHoc: student.lopHoc || "",
      khoaHoc: student.khoaHoc || "",
      bacDaoTao: student.bacDaoTao || "",
      loaiHinhDaoTao: student.loaiHinhDaoTao || "",
      maNganh: student.maNganh || "",
      avatarUrl: student.avatarUrl || "",
      matKhau: "",
      confirmMatKhau: "",
    });
    setFormError("");
    setIsEditDialogOpen(true);
  };

  const openDetailViewDialog = (student) => {
    setViewingStudentDetails(student);
    setIsDetailViewOpen(true);
  };

  const handleInitiateDelete = (studentId) => {
    if (!studentId) {
      toast.error("Mã sinh viên không hợp lệ để xóa.");
      return;
    }
    setStudentIdToDelete(studentId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleGioiTinhChange = (value) => {
    setStudentForm((prev) => ({ ...prev, gioiTinh: value }));
  };

  const closeDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDetailViewOpen(false);
    setIsConfirmDeleteDialogOpen(false);
    setEditingStudent(null);
    setViewingStudentDetails(null);
    setStudentIdToDelete(null);
    setStudentForm(initialAddStudentForm);
    setFormError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNganhChange = (value) => {
    setStudentForm((prev) => ({
      ...prev,
      maNganh: value, // Cập nhật giá trị `maNganh` trong form
    }));
  };

  // Format ngày sinh cho input date (yyyy-MM-dd)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      // Nếu dateString là ISO dạng yyyy-MM-dd hoặc yyyy-MM-ddTHH:mm:ss
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      // Lấy yyyy-MM-dd
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  // Format hiển thị ngày sinh (dd/MM/yyyy)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString("vi-VN");
    } catch {
      return "N/A";
    }
  };

  // --- Thêm sinh viên (POST /api/sinhvien) ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const {
      maSinhVien,
      hoTen,
      email,
      gioiTinh,
      ngaySinh,
      noiSinh,
      lopHoc,
      khoaHoc,
      bacDaoTao,
      loaiHinhDaoTao,
      maNganh,
      avatarUrl,
      matKhau,
      confirmMatKhau,
    } = studentForm;

    if (!maSinhVien || !hoTen || !email || !matKhau || !confirmMatKhau) {
      setFormError(
        "Vui lòng điền đầy đủ Mã SV, Họ tên, Email, Mật khẩu và Xác nhận mật khẩu."
      );
      return;
    }
    if (!maSinhVien.toLowerCase().startsWith("sv")) {
      setFormError("Mã SV phải bắt đầu bằng 'sv' hoặc 'SV'.");
      return;
    }
    if (matKhau.length < 6) {
      setFormError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (matKhau !== confirmMatKhau) {
      setFormError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setFormError("Định dạng email không hợp lệ.");
      return;
    }
    if (ngaySinh && !/^\d{4}-\d{2}-\d{2}$/.test(ngaySinh)) {
      setFormError("Định dạng ngày sinh không hợp lệ (YYYY-MM-DD).");
      return;
    }
    if (ngaySinh && new Date(ngaySinh) > new Date()) {
      setFormError("Ngày sinh không thể là một ngày trong tương lai.");
      return;
    }

    setIsSaving(true);

    const payload = {
      maSinhVien: maSinhVien.trim(),
      hoTen: hoTen.trim(),
      email: email.trim(),
      gioiTinh: gioiTinh || null,
      ngaySinh: ngaySinh || null,
      noiSinh: noiSinh || null,
      lopHoc: lopHoc || null,
      khoaHoc: khoaHoc || null,
      bacDaoTao: bacDaoTao || null,
      loaiHinhDaoTao: loaiHinhDaoTao || null,
      avatarUrl: avatarUrl || null,
      maNganh: maNganh || null,

      matKhau: matKhau,
      confirmMatKhau: confirmMatKhau,
    };

    try {
      // Thêm sinh viên qua POST /api/sinhvien
      // Nếu backend không hỗ trợ matKhau, bạn cần tạo tài khoản trước qua /auth/register rồi cập nhật chi tiết sau.
      // Mình giả sử backend hỗ trợ nhận matKhau luôn cho đơn giản.
      await api.post("/sinhvien", payload);

      toast.success(`Đã thêm sinh viên ${payload.maSinhVien} thành công.`);
      await fetchStudents();
      closeDialogs();
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Thêm sinh viên thất bại.";
      setFormError(errMsg);
      toast.error(`Thêm thất bại: ${errMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Sửa sinh viên (PUT /api/sinhvien/{maSinhVien}) ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) {
      toast.error("Không có sinh viên nào được chọn để sửa.");
      return;
    }
    setFormError("");

    const {
      hoTen,
      email,
      gioiTinh,
      ngaySinh,
      noiSinh,
      lopHoc,
      khoaHoc,
      bacDaoTao,
      loaiHinhDaoTao,
      maNganh,
      avatarUrl,
      matKhau, // thêm
      confirmMatKhau, // thêm
    } = studentForm;

    if (!hoTen || !email) {
      setFormError("Họ tên và Email không được để trống.");
      return;
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setFormError("Định dạng email không hợp lệ.");
      return;
    }
    if (ngaySinh && !/^\d{4}-\d{2}-\d{2}$/.test(ngaySinh) && ngaySinh !== "") {
      setFormError("Định dạng ngày sinh không hợp lệ (YYYY-MM-DD).");
      return;
    }
    if (ngaySinh && new Date(ngaySinh) > new Date()) {
      setFormError("Ngày sinh không thể là một ngày trong tương lai.");
      return;
    }
    // Validate mật khẩu nếu có nhập
    if (matKhau || confirmMatKhau) {
      if (matKhau.length < 6) {
        setFormError("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
      }
      if (matKhau !== confirmMatKhau) {
        setFormError("Mật khẩu và xác nhận mật khẩu không khớp.");
        return;
      }
    }

    setIsSaving(true);

    const payload = {
      hoTen: hoTen.trim(),
      email: email.trim(),
      gioiTinh: gioiTinh || null,
      ngaySinh: ngaySinh || null,
      noiSinh: noiSinh || null,
      lopHoc: lopHoc || null,
      khoaHoc: khoaHoc || null,
      bacDaoTao: bacDaoTao || null,
      loaiHinhDaoTao: loaiHinhDaoTao || null,
      avatarUrl: avatarUrl || null,
      maNganh: maNganh || null,
    };
    // Nếu có nhập mật khẩu mới thì gửi kèm
    if (matKhau && matKhau === confirmMatKhau) {
      payload.matKhau = matKhau;
      payload.confirmMatKhau = confirmMatKhau;
    }
    console.log("Ngành học đã chọn: ", studentForm.maNganh);

    try {
      const response = await api.put(
        `/sinhvien/${editingStudent.maSinhVien}`,
        payload
      );

      const updatedStudent = response.data;
      setStudents((prev) =>
        prev.map((sv) =>
          sv.maSinhVien === editingStudent.maSinhVien ? updatedStudent : sv
        )
      );
      toast.success("Cập nhật thông tin sinh viên thành công!");
      closeDialogs();
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || "Cập nhật thất bại.";
      setFormError(errMsg);
      toast.error(`Cập nhật thất bại: ${errMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Xóa sinh viên (DELETE /api/sinhvien/{maSinhVien}) ---
  const handleDeleteStudentConfirm = async () => {
    const idToDelete = studentIdToDelete;
    if (!idToDelete) {
      toast.error("Mã sinh viên để xóa không hợp lệ. Vui lòng thử lại.");
      closeDialogs();
      return;
    }

    setIsSaving(true);

    try {
      await api.delete(`/sinhvien/${idToDelete}`);
      setStudents((prev) => prev.filter((sv) => sv.maSinhVien !== idToDelete));
      toast.success(`Xóa sinh viên ${idToDelete} thành công!`);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        `Xóa sinh viên ${idToDelete} thất bại.`;
      toast.error(`Xóa thất bại: ${errMsg}`);
    } finally {
      setIsSaving(false);
      closeDialogs();
    }
  };

  if (loadingAuthGlobal || loadingData) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground dark:text-gray-400">
          Đang tải dữ liệu sinh viên...
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
                <Users className="h-6 w-6 text-primary" /> Quản lý Sinh viên
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Xem, thêm, sửa, xóa thông tin sinh viên và tài khoản.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Thêm Sinh viên
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg dark:bg-gray-800 dark:border-gray-700">
                <form onSubmit={handleAddSubmit}>
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">
                      Thêm Sinh viên mới
                    </DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                      Nhập thông tin chi tiết để tạo sinh viên mới.
                    </DialogDescription>
                  </DialogHeader>
                  {formError && (
                    <Alert variant="destructive" className="my-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Lỗi</AlertTitle>
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                  <ScrollArea className="max-h-[70vh] p-1 pr-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4 ">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-maSinhVien"
                          className="dark:text-gray-300"
                        >
                          Mã SV*
                        </Label>
                        <Input
                          id="add-maSinhVien"
                          name="maSinhVien"
                          value={studentForm.maSinhVien}
                          onChange={handleFormChange}
                          required
                          placeholder="VD: sv0001"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-hoTen"
                          className="dark:text-gray-300"
                        >
                          Họ tên*
                        </Label>
                        <Input
                          id="add-hoTen"
                          name="hoTen"
                          value={studentForm.hoTen}
                          onChange={handleFormChange}
                          required
                          placeholder="Nguyễn Văn A"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-email"
                          className="dark:text-gray-300"
                        >
                          Email*
                        </Label>
                        <Input
                          id="add-email"
                          name="email"
                          type="email"
                          value={studentForm.email}
                          onChange={handleFormChange}
                          required
                          placeholder="email@example.com"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-gioiTinh"
                          className="dark:text-gray-300"
                        >
                          Giới tính
                        </Label>
                        <Select
                          onValueChange={handleGioiTinhChange}
                          value={studentForm.gioiTinh || ""}
                        >
                          <SelectTrigger
                            id="add-gioiTinh"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem
                              value="Nam"
                              className="dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              Nam
                            </SelectItem>
                            <SelectItem
                              value="Nữ"
                              className="dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              Nữ
                            </SelectItem>
                            <SelectItem
                              value="Khác"
                              className="dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              Khác
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-ngaySinh"
                          className="dark:text-gray-300"
                        >
                          Ngày sinh
                        </Label>
                        <Input
                          id="add-ngaySinh"
                          name="ngaySinh"
                          type="date"
                          value={studentForm.ngaySinh}
                          onChange={handleFormChange}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-noiSinh"
                          className="dark:text-gray-300"
                        >
                          Nơi sinh
                        </Label>
                        <Input
                          id="add-noiSinh"
                          name="noiSinh"
                          value={studentForm.noiSinh}
                          onChange={handleFormChange}
                          placeholder="VD: Hà Nội"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-lopHoc"
                          className="dark:text-gray-300"
                        >
                          Lớp học
                        </Label>
                        <Input
                          id="add-lopHoc"
                          name="lopHoc"
                          value={studentForm.lopHoc}
                          onChange={handleFormChange}
                          placeholder="VD: DHKTPM16A"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-khoaHoc"
                          className="dark:text-gray-300"
                        >
                          Khóa học
                        </Label>
                        <Input
                          id="add-khoaHoc"
                          name="khoaHoc"
                          value={studentForm.khoaHoc}
                          onChange={handleFormChange}
                          placeholder="VD: 2020-2024"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-bacDaoTao"
                          className="dark:text-gray-300"
                        >
                          Bậc đào tạo
                        </Label>
                        <Input
                          id="add-bacDaoTao"
                          name="bacDaoTao"
                          value={studentForm.bacDaoTao}
                          onChange={handleFormChange}
                          placeholder="VD: Đại học"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-loaiHinhDaoTao"
                          className="dark:text-gray-300"
                        >
                          Loại hình ĐT
                        </Label>
                        <Input
                          id="add-loaiHinhDaoTao"
                          name="loaiHinhDaoTao"
                          value={studentForm.loaiHinhDaoTao}
                          onChange={handleFormChange}
                          placeholder="VD: Chính quy"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-maNganh"
                          className="dark:text-gray-300"
                        >
                          Ngành học
                        </Label>
                        <Select
                          onValueChange={handleNganhChange}
                          value={studentForm.maNganh || ""}
                        >
                          <SelectTrigger
                            id="add-maNganh"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <SelectValue placeholder="Chọn ngành học" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {nganhHocs.length === 0 && (
                              <SelectItem
                                value="loading-nganh"
                                disabled
                                className="dark:text-gray-400"
                              >
                                Đang tải ngành...
                              </SelectItem>
                            )}
                            {nganhHocs
                              .filter(
                                (nganh) =>
                                  nganh.maNganh && nganh.maNganh.trim() !== ""
                              )
                              .map((nganh) => (
                                <SelectItem
                                  key={nganh.maNganh}
                                  value={nganh.maNganh}
                                  className="dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                  {nganh.tenNganh} ({nganh.maNganh})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-avatarUrl"
                          className="dark:text-gray-300"
                        >
                          Link Ảnh đại diện
                        </Label>
                        <Input
                          id="add-avatarUrl"
                          name="avatarUrl"
                          value={studentForm.avatarUrl}
                          onChange={handleFormChange}
                          placeholder="https://example.com/avatar.png"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-matKhau"
                          className="dark:text-gray-300"
                        >
                          Mật khẩu*
                        </Label>
                        <Input
                          id="add-matKhau"
                          name="matKhau"
                          type="password"
                          value={studentForm.matKhau}
                          onChange={handleFormChange}
                          required
                          minLength={6}
                          placeholder="Ít nhất 6 ký tự"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-confirmMatKhau"
                          className="dark:text-gray-300"
                        >
                          Xác nhận Mật khẩu*
                        </Label>
                        <Input
                          id="add-confirmMatKhau"
                          name="confirmMatKhau"
                          type="password"
                          value={studentForm.confirmMatKhau}
                          onChange={handleFormChange}
                          required
                          placeholder="Nhập lại mật khẩu"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </ScrollArea>
                  <DialogFooter>
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
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}{" "}
                      Thêm Sinh viên
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-6 relative">
            <Input
              placeholder="Tìm Mã SV, Họ tên, Email, Lớp, Ngành..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-10"
              aria-label="Tìm kiếm sinh viên"
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
        <CardContent>
          {error && !loadingData && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loadingData && !error && (
            <ScrollArea className="h-[calc(100vh-380px)]">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="w-[100px] sticky top-0 bg-card z-10 dark:bg-gray-800 dark:text-gray-300">
                      Mã SV
                    </TableHead>
                    <TableHead className="sticky top-0 bg-card z-10 dark:bg-gray-800 dark:text-gray-300">
                      Họ tên
                    </TableHead>
                    <TableHead className="sticky top-0 bg-card z-10 dark:bg-gray-800 dark:text-gray-300">
                      Email
                    </TableHead>
                    <TableHead className="hidden md:table-cell sticky top-0 bg-card z-10 dark:bg-gray-800 dark:text-gray-300">
                      Lớp
                    </TableHead>
                    <TableHead className="hidden lg:table-cell sticky top-0 bg-card z-10 dark:bg-gray-800 dark:text-gray-300">
                      Ngành
                    </TableHead>
                    <TableHead className="hidden md:table-cell sticky top-0 bg-card z-10 dark:bg-gray-800 dark:text-gray-300">
                      Tài khoản ĐN
                    </TableHead>
                    <TableHead className="text-right sticky top-0 bg-card z-10 dark:bg-gray-800 dark:text-gray-300">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((sv) => (
                      <TableRow
                        key={sv.maSinhVien}
                        className="hover:bg-muted/50 dark:hover:bg-gray-700/50 dark:border-gray-700"
                      >
                        <TableCell className="font-medium dark:text-gray-100">
                          {sv.maSinhVien}
                        </TableCell>
                        <TableCell className="dark:text-gray-200">
                          {sv.hoTen || (
                            <span className="italic text-yellow-500 dark:text-yellow-400">
                              Cần cập nhật
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="dark:text-gray-200">
                          {sv.email || (
                            <span className="italic text-yellow-500 dark:text-yellow-400">
                              Cần cập nhật
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell dark:text-gray-200">
                          {sv.lopHoc || "N/A"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell dark:text-gray-200">
                          {sv.tenNganh || "N/A"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell dark:text-gray-200">
                          {sv.tenDangNhap || "Chưa liên kết"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                                className="dark:hover:bg-gray-700"
                              >
                                <MoreHorizontal className="h-4 w-4" />{" "}
                                <span className="sr-only">Mở menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="dark:bg-gray-900 dark:border-gray-700"
                            >
                              <DropdownMenuLabel className="dark:text-gray-300">
                                Hành động
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="dark:bg-gray-700" />
                              <DropdownMenuItem
                                onClick={() => openDetailViewDialog(sv)}
                                className="cursor-pointer dark:hover:!bg-gray-700 dark:text-gray-200"
                              >
                                <Info className="mr-2 h-4 w-4" /> Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEditDialog(sv)}
                                className="cursor-pointer dark:hover:!bg-gray-700 dark:text-gray-200"
                              >
                                <Pencil className="mr-2 h-4 w-4" /> Sửa thông
                                tin
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="dark:bg-gray-700" />
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleInitiateDelete(sv.maSinhVien);
                                }}
                                className="text-red-500 focus:text-red-500 dark:text-red-400 dark:hover:!bg-red-900/30 dark:focus:bg-red-900/40 cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Xóa Sinh
                                viên
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="dark:border-gray-700">
                      <TableCell
                        colSpan={TABLE_COL_SPAN}
                        className="h-24 text-center text-muted-foreground dark:text-gray-400"
                      >
                        {searchTerm
                          ? `Không tìm thấy sinh viên với từ khóa "${searchTerm}".`
                          : "Không có sinh viên nào."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground dark:text-gray-400">
            Hiển thị <strong>{filteredStudents.length}</strong> trên tổng số{" "}
            <strong>{students.length}</strong> sinh viên.
          </div>
        </CardFooter>
      </Card>

      {/* Dialog Sửa Sinh viên */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl dark:bg-gray-800 dark:border-gray-700">
          {editingStudent && (
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  Sửa thông tin Sinh viên
                </DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Cập nhật thông tin chi tiết cho sinh viên:{" "}
                  <span className="font-semibold">
                    {editingStudent.maSinhVien}
                  </span>
                </DialogDescription>
              </DialogHeader>
              {formError && (
                <Alert variant="destructive" className="my-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Lỗi</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <ScrollArea className="max-h-[70vh] pr-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4 ">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-maSinhVien"
                      className="dark:text-gray-300"
                    >
                      Mã SV
                    </Label>
                    <Input
                      id="edit-maSinhVien"
                      value={studentForm.maSinhVien}
                      readOnly
                      disabled
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-hoTen" className="dark:text-gray-300">
                      Họ tên*
                    </Label>
                    <Input
                      id="edit-hoTen"
                      name="hoTen"
                      value={studentForm.hoTen}
                      onChange={handleFormChange}
                      required
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-email" className="dark:text-gray-300">
                      Email*
                    </Label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      value={studentForm.email}
                      onChange={handleFormChange}
                      required
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-gioiTinh"
                      className="dark:text-gray-300"
                    >
                      Giới tính
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setStudentForm((prev) => ({ ...prev, gioiTinh: value }))
                      }
                      value={studentForm.gioiTinh || ""}
                    >
                      <SelectTrigger
                        id="edit-gioiTinh"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem
                          value="Nam"
                          className="dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          Nam
                        </SelectItem>
                        <SelectItem
                          value="Nữ"
                          className="dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          Nữ
                        </SelectItem>
                        <SelectItem
                          value="Khác"
                          className="dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          Khác
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-ngaySinh"
                      className="dark:text-gray-300"
                    >
                      Ngày sinh
                    </Label>
                    <Input
                      id="edit-ngaySinh"
                      name="ngaySinh"
                      type="date"
                      value={studentForm.ngaySinh}
                      onChange={handleFormChange}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-noiSinh"
                      className="dark:text-gray-300"
                    >
                      Nơi sinh
                    </Label>
                    <Input
                      id="edit-noiSinh"
                      name="noiSinh"
                      value={studentForm.noiSinh}
                      onChange={handleFormChange}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="VD: Hà Nội"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-lopHoc" className="dark:text-gray-300">
                      Lớp học
                    </Label>
                    <Input
                      id="edit-lopHoc"
                      name="lopHoc"
                      value={studentForm.lopHoc}
                      onChange={handleFormChange}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="VD: DHKTPM16A"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-khoaHoc"
                      className="dark:text-gray-300"
                    >
                      Khóa học
                    </Label>
                    <Input
                      id="edit-khoaHoc"
                      name="khoaHoc"
                      value={studentForm.khoaHoc}
                      onChange={handleFormChange}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="VD: 2020-2024"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-bacDaoTao"
                      className="dark:text-gray-300"
                    >
                      Bậc đào tạo
                    </Label>
                    <Input
                      id="edit-bacDaoTao"
                      name="bacDaoTao"
                      value={studentForm.bacDaoTao}
                      onChange={handleFormChange}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="VD: Đại học"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-loaiHinhDaoTao"
                      className="dark:text-gray-300"
                    >
                      Loại hình ĐT
                    </Label>
                    <Input
                      id="edit-loaiHinhDaoTao"
                      name="loaiHinhDaoTao"
                      value={studentForm.loaiHinhDaoTao}
                      onChange={handleFormChange}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="VD: Chính quy"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-maNganh"
                      className="dark:text-gray-300"
                    >
                      Ngành học
                    </Label>
                    <Select
                      onValueChange={handleNganhChange}
                      value={studentForm.maNganh || ""}
                    >
                      <SelectTrigger
                        id="edit-maNganh"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <SelectValue placeholder="Chọn ngành học" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        {nganhHocs.length === 0 && (
                          <SelectItem
                            value="loading-nganh"
                            disabled
                            className="dark:text-gray-400"
                          >
                            Đang tải ngành...
                          </SelectItem>
                        )}
                        {nganhHocs
                          .filter(
                            (nganh) =>
                              nganh.maNganh && nganh.maNganh.trim() !== ""
                          )
                          .map((nganh) => (
                            <SelectItem
                              key={nganh.maNganh}
                              value={nganh.maNganh}
                              className="dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              {nganh.tenNganh} ({nganh.maNganh})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-avatarUrl"
                      className="dark:text-gray-300"
                    >
                      Link Ảnh đại diện
                    </Label>
                    <Input
                      id="edit-avatarUrl"
                      name="avatarUrl"
                      value={studentForm.avatarUrl}
                      onChange={handleFormChange}
                      placeholder="https://example.com/avatar.png"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-matKhau"
                      className="dark:text-gray-300"
                    >
                      Mật khẩu mới
                    </Label>
                    <Input
                      id="edit-matKhau"
                      name="matKhau"
                      type="password"
                      value={studentForm.matKhau}
                      onChange={handleFormChange}
                      placeholder="Để trống nếu không đổi mật khẩu"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-confirmMatKhau"
                      className="dark:text-gray-300"
                    >
                      Xác nhận mật khẩu mới
                    </Label>
                    <Input
                      id="edit-confirmMatKhau"
                      name="confirmMatKhau"
                      type="password"
                      value={studentForm.confirmMatKhau}
                      onChange={handleFormChange}
                      placeholder="Nhập lại mật khẩu mới"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4">
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
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}{" "}
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Xem Chi Tiết Sinh Viên */}
      <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
        <DialogContent className="sm:max-w-lg dark:bg-gray-800 dark:border-gray-700">
          {viewingStudentDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="dark:text-white flex items-center gap-2 text-xl">
                  <UserSquare2 className="h-6 w-6 text-primary" /> Chi tiết Sinh
                  viên: {viewingStudentDetails.maSinhVien}
                </DialogTitle>
                <DialogDescription className="dark:text-gray-400 pt-1">
                  Thông tin đầy đủ của sinh viên.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-3">
                <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-3 py-4 text-sm">
                  {viewingStudentDetails.avatarUrl ? (
                    <>
                      <span className="font-semibold dark:text-gray-300 self-start pt-1">
                        Ảnh đại diện:
                      </span>
                      <Avatar className="h-28 w-28 border dark:border-gray-600">
                        <AvatarImage
                          src={viewingStudentDetails.avatarUrl}
                          alt={`Ảnh đại diện ${
                            viewingStudentDetails.hoTen ||
                            viewingStudentDetails.maSinhVien
                          }`}
                        />
                        <AvatarFallback className="dark:bg-gray-700 dark:text-gray-300 text-3xl">
                          {(
                            viewingStudentDetails.hoTen ||
                            viewingStudentDetails.maSinhVien
                          )
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold dark:text-gray-300">
                        Ảnh đại diện:
                      </span>
                      <span className="italic text-muted-foreground dark:text-gray-500">
                        Chưa có ảnh
                      </span>
                    </>
                  )}
                  <span className="font-semibold dark:text-gray-300">
                    Mã SV:
                  </span>{" "}
                  <span className="dark:text-gray-200 font-medium">
                    {viewingStudentDetails.maSinhVien}
                  </span>
                  <span className="font-semibold dark:text-gray-300">
                    Họ tên:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingStudentDetails.hoTen || (
                      <span className="italic text-yellow-500 dark:text-yellow-400">
                        Cần cập nhật
                      </span>
                    )}
                  </span>
                  <span className="font-semibold dark:text-gray-300">
                    Email:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingStudentDetails.email || (
                      <span className="italic text-yellow-500 dark:text-yellow-400">
                        Cần cập nhật
                      </span>
                    )}
                  </span>
                  <span className="font-semibold dark:text-gray-300">
                    Giới tính:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingStudentDetails.gioiTinh || "N/A"}
                  </span>
                  <span className="font-semibold dark:text-gray-300">
                    Ngày sinh:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {formatDateForDisplay(viewingStudentDetails.ngaySinh)}
                  </span>
                  <span className="font-semibold dark:text-gray-300">
                    Nơi sinh:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingStudentDetails.noiSinh || "N/A"}
                  </span>
                  <span className="font-semibold dark:text-gray-300">
                    Lớp học:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingStudentDetails.lopHoc || "N/A"}
                  </span>
                  <span className="font-semibold dark:text-gray-300">
                    Khóa học:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingStudentDetails.khoaHoc || "N/A"}
                  </span>
                  <span className="font-semibold dark:text-gray-300">
                    Bậc đào tạo:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingStudentDetails.bacDaoTao || "N/A"}
                  </span>
                  <span className="font-semibold dark:text-gray-300">
                    Loại hình ĐT:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingStudentDetails.loaiHinhDaoTao || "N/A"}
                  </span>
                  <span className="font-semibold dark:text-gray-300">
                    Ngành học:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingStudentDetails.nganhHoc?.tenNganh || "N/A"}{" "}
                    {viewingStudentDetails.nganhHoc?.maNganh
                      ? `(${viewingStudentDetails.nganhHoc.maNganh})`
                      : ""}
                  </span>
                  <span className="font-semibold dark:text-gray-300">
                    Tài khoản ĐN:
                  </span>{" "}
                  <span className="dark:text-gray-200">
                    {viewingStudentDetails.taiKhoan?.tenDangNhap || "N/A"}
                  </span>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4">
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

      {/* AlertDialog xác nhận xóa */}
      <AlertDialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
      >
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Xác nhận xóa?
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa sinh
              viên có mã "{studentIdToDelete}"? Tài khoản liên kết cũng sẽ bị
              xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={closeDialogs}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudentConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminStudents;
