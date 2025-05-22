import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../api/axios"; // Đảm bảo axios instance này đã cấu hình gửi token
import MultiSelectPrerequisites from "../../pages/admin/MultiSelectPrerequisites";
import {
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  BookCopy,
  Loader2,
  AlertCircle,
  Search,
  Info,
  XIcon,
  Library,
  Tag,
  FileText,
  CheckSquare,
  ListChecks,
  Hourglass,
  Sigma,
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
} from "../../components/ui/alert-dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

// Hàm tiện ích để trích xuất thông điệp lỗi thân thiện
const extractErrorMessage = (errorObj) => {
  if (typeof errorObj === "string") return errorObj;
  if (errorObj?.response?.data) {
    const data = errorObj.response.data;
    if (typeof data === "string") return data;
    if (data.message && typeof data.message === "string") return data.message;
    if (data.error && typeof data.error === "string") return data.error;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors
        .map(
          (err) =>
            `${err.field ? err.field + ": " : ""}${
              err.defaultMessage || err.message
            }`
        )
        .join("; ");
    }
    if (data.path && data.status) {
      return `Lỗi ${data.status} tại ${data.path}. Chi tiết: ${
        data.message || data.error || "Không có thông tin chi tiết."
      }`;
    }
    if (typeof data === "object" && data !== null) {
      for (const key in data) {
        if (
          typeof data[key] === "string" &&
          (key.toLowerCase().includes("message") ||
            key.toLowerCase().includes("error") ||
            key.toLowerCase().includes("detail"))
        ) {
          return data[key];
        }
      }
      try {
        return `Lỗi từ server: ${JSON.stringify(data).substring(0, 200)}...`;
      } catch (e) {
        /* Bỏ qua lỗi JSON.stringify */
      }
    }
  }
  if (errorObj?.message && typeof errorObj.message === "string") {
    return errorObj.message;
  }
  return "Đã có lỗi không xác định xảy ra.";
};

// Giá trị khởi tạo cho form môn học
export const initialSubjectFormValues = {
  maMonHoc: "",
  tenMonHoc: "",
  soTinChi: 1,
  moTa: "",
  tienQuyet: [], // Sẽ là mảng các mã môn học (string)
  thoiLuongLyThuyet: 0,
  thoiLuongThucHanh: 0,
  trangThai: "Đang mở",
};

// Component Form cho việc thêm/sửa môn học
const SubjectForm = ({
  initialData = initialSubjectFormValues,
  onSubmit,
  onCancel,
  isSaving,
  formError,
  setFormError,
  allSubjectsForPrerequisites, // Danh sách tất cả môn học để chọn tiên quyết
  isEditMode = false,
  dialogIdPrefix = "form",
}) => {
  const [formData, setFormData] = React.useState(initialData);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Xử lý thay đổi input trong form
  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue =
      type === "number" ? (value === "" ? "" : parseInt(value, 10)) : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (formError) setFormError("");
  };

  // Xử lý thay đổi danh sách môn tiên quyết
  const handlePrerequisitesChange = React.useCallback(
    (selectedMaMonHocArray) => {
      // Đảm bảo giá trị là duy nhất
      const uniqueSelectedMaMonHocArray = Array.from(
        new Set(selectedMaMonHocArray)
      );
      setFormData((prev) => ({
        ...prev,
        tienQuyet: uniqueSelectedMaMonHocArray, // Lưu mảng các mã môn học
      }));
      if (formError) setFormError("");
    },
    [formError, setFormError]
  );

  // Kiểm tra tính hợp lệ của form
  const validateForm = (formToValidate) => {
    if (!formToValidate.tenMonHoc.trim()) {
      setFormError("Tên môn học không được để trống.");
      return false;
    }
    if (
      isNaN(parseInt(formToValidate.soTinChi)) ||
      parseInt(formToValidate.soTinChi) <= 0
    ) {
      setFormError("Số tín chỉ phải là một số nguyên dương lớn hơn 0.");
      return false;
    }
    if (
      formToValidate.thoiLuongLyThuyet &&
      (isNaN(parseInt(formToValidate.thoiLuongLyThuyet)) ||
        parseInt(formToValidate.thoiLuongLyThuyet) < 0)
    ) {
      setFormError("Thời lượng lý thuyết phải là một số không âm.");
      return false;
    }
    if (
      formToValidate.thoiLuongThucHanh &&
      (isNaN(parseInt(formToValidate.thoiLuongThucHanh)) ||
        parseInt(formToValidate.thoiLuongThucHanh) < 0)
    ) {
      setFormError("Thời lượng thực hành phải là một số không âm.");
      return false;
    }
    if (!formToValidate.trangThai.trim()) {
      setFormError("Trạng thái không được để trống.");
      return false;
    }
    setFormError("");
    return true;
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm(formData)) return;

    // Chuẩn bị payload gửi lên API
    const payload = {
      ...formData,
      maMonHoc: isEditMode
        ? formData.maMonHoc // Giữ nguyên mã môn học khi sửa
        : formData.maMonHoc.trim() === ""
        ? null // Gửi null nếu mã trống để backend tự sinh
        : formData.maMonHoc.trim(),
      soTinChi: parseInt(formData.soTinChi, 10),
      thoiLuongLyThuyet: parseInt(formData.thoiLuongLyThuyet, 10) || 0,
      thoiLuongThucHanh: parseInt(formData.thoiLuongThucHanh, 10) || 0,
      monTienQuyet: formData.tienQuyet,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      {formError && (
        <Alert variant="destructive" className="my-3">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi Form</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <ScrollArea className="max-h-[calc(70vh-50px)] p-1 pr-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
          {/* Các trường form */}
          <div className="space-y-1.5">
            <Label
              htmlFor={`${dialogIdPrefix}-maMonHoc`}
              className="dark:text-gray-300"
            >
              Mã Môn học
            </Label>
            <Input
              id={`${dialogIdPrefix}-maMonHoc`}
              name="maMonHoc"
              value={formData.maMonHoc}
              onChange={handleFormChange}
              placeholder="VD: MHxxx"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              readOnly={isEditMode}
              disabled={isEditMode}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor={`${dialogIdPrefix}-tenMonHoc`}
              className="dark:text-gray-300"
            >
              Tên Môn học*
            </Label>
            <Input
              id={`${dialogIdPrefix}-tenMonHoc`}
              name="tenMonHoc"
              value={formData.tenMonHoc}
              onChange={handleFormChange}
              required
              placeholder="VD: Lập trình Web"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor={`${dialogIdPrefix}-soTinChi`}
              className="dark:text-gray-300"
            >
              Số tín chỉ*
            </Label>
            <Input
              id={`${dialogIdPrefix}-soTinChi`}
              name="soTinChi"
              type="number"
              value={formData.soTinChi}
              onChange={handleFormChange}
              required
              min="1"
              placeholder="VD: 3"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor={`${dialogIdPrefix}-trangThai`}
              className="dark:text-gray-300"
            >
              Trạng thái*
            </Label>
            <Select
              name="trangThai"
              value={formData.trangThai}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, trangThai: value }));
                if (formError) setFormError("");
              }}
              required
            >
              <SelectTrigger
                id={`${dialogIdPrefix}-trangThai`}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem
                  value="Đang mở"
                  className="dark:text-gray-200 dark:hover:!bg-gray-700"
                >
                  Đang mở
                </SelectItem>
                <SelectItem
                  value="Đã đóng"
                  className="dark:text-gray-200 dark:hover:!bg-gray-700"
                >
                  Đã đóng
                </SelectItem>
                <SelectItem
                  value="Sắp mở"
                  className="dark:text-gray-200 dark:hover:!bg-gray-700"
                >
                  Sắp mở
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor={`${dialogIdPrefix}-thoiLuongLyThuyet`}
              className="dark:text-gray-300"
            >
              Tiết Lý thuyết
            </Label>
            <Input
              id={`${dialogIdPrefix}-thoiLuongLyThuyet`}
              name="thoiLuongLyThuyet"
              type="number"
              value={formData.thoiLuongLyThuyet}
              onChange={handleFormChange}
              min="0"
              placeholder="VD: 30"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor={`${dialogIdPrefix}-thoiLuongThucHanh`}
              className="dark:text-gray-300"
            >
              Tiết Thực hành
            </Label>
            <Input
              id={`${dialogIdPrefix}-thoiLuongThucHanh`}
              name="thoiLuongThucHanh"
              type="number"
              value={formData.thoiLuongThucHanh}
              onChange={handleFormChange}
              min="0"
              placeholder="VD: 15"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label
              htmlFor={`${dialogIdPrefix}-multiselect-tienquyet`} // Ensure unique ID for accessibility
              className="dark:text-gray-300"
            >
              Môn tiên quyết
            </Label>
            <MultiSelectPrerequisites
              id={`${dialogIdPrefix}-multiselect-tienquyet`}
              options={allSubjectsForPrerequisites}
              selectedValues={formData.tienQuyet}
              onChange={handlePrerequisitesChange}
              placeholder="Chọn các môn tiên quyết..."
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label
              htmlFor={`${dialogIdPrefix}-moTa`}
              className="dark:text-gray-300"
            >
              Mô tả
            </Label>
            <Textarea
              id={`${dialogIdPrefix}-moTa`}
              name="moTa"
              value={formData.moTa}
              onChange={handleFormChange}
              placeholder="Nhập mô tả chi tiết cho môn học..."
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
            />
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-4 border-t dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{" "}
          {isEditMode ? "Lưu thay đổi" : "Lưu Môn học"}
        </Button>
      </DialogFooter>
    </form>
  );
};

const TABLE_COL_SPAN_SUBJECTS = 7;

// Component chính quản lý môn học
const AdminSubjects = () => {
  const outletContext = useOutletContext();
  const tokenInfo = outletContext?.tokenInfo;
  const loadingAuthGlobal = outletContext?.loadingAuthGlobal ?? true;

  const [subjects, setSubjects] = useState([]);
  const [allSubjectsForPrerequisites, setAllSubjectsForPrerequisites] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false);

  const [currentSubjectFormData, setCurrentSubjectFormData] = useState(
    initialSubjectFormValues
  );
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [subjectIdToDelete, setSubjectIdToDelete] = useState(null);
  const [viewingSubjectDetails, setViewingSubjectDetails] = useState(null);

  // Hàm tiện ích xử lý hiển thị môn tiên quyết loại bỏ trùng, hiện tên + mã
  const getDisplayTienQuyet = (tienQuyetArray, allSubjects) => {
    if (!Array.isArray(tienQuyetArray) || tienQuyetArray.length === 0)
      return "Không";
    const uniqueCodes = Array.from(new Set(tienQuyetArray));
    return uniqueCodes
      .map((code) => {
        const subj = allSubjects.find((s) => s.maMonHoc === code);
        return subj ? `${subj.tenMonHoc} (${code})` : code;
      })
      .join(", ");
  };

  // Hàm đóng tất cả dialog và reset state
  const closeDialogs = useCallback(() => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDetailViewOpen(false);
    setIsConfirmDeleteDialogOpen(false);
    setViewingSubjectDetails(null);
    setSubjectIdToDelete(null);
    setCurrentSubjectFormData(initialSubjectFormValues);
    setFormError("");
  }, []);

  const fetchSubjectsData = useCallback(async () => {
    if (!tokenInfo) {
      setError(
        "Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/monhoc");
      const fetchedSubjects = res.data || [];
      setSubjects(fetchedSubjects);
      setAllSubjectsForPrerequisites(
        fetchedSubjects.map((s) => ({
          maMonHoc: s.maMonHoc,
          tenMonHoc: s.tenMonHoc,
        }))
      );
    } catch (err) {
      const friendlyError = extractErrorMessage(err);
      setError("Không thể tải danh sách môn học. " + friendlyError);
      toast.error("Lỗi tải danh sách môn học: " + friendlyError);
      if (err.response && err.response.status === 403) {
        setError(
          "Bạn không có quyền truy cập tài nguyên này. " + friendlyError
        );
      }
    } finally {
      setLoading(false);
    }
  }, [tokenInfo]);

  useEffect(() => {
    if (!loadingAuthGlobal && tokenInfo) {
      fetchSubjectsData();
    } else if (!loadingAuthGlobal && !tokenInfo) {
      setError(
        "Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
      );
      setLoading(false);
      setSubjects([]);
      setAllSubjectsForPrerequisites([]);
    }
  }, [fetchSubjectsData, loadingAuthGlobal, tokenInfo]);

  const filteredSubjects = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowerSearchTerm) return subjects;
    return subjects.filter(
      (mh) =>
        (mh.maMonHoc && mh.maMonHoc.toLowerCase().includes(lowerSearchTerm)) ||
        (mh.tenMonHoc &&
          mh.tenMonHoc.toLowerCase().includes(lowerSearchTerm)) ||
        (mh.trangThai &&
          mh.trangThai.toLowerCase().includes(lowerSearchTerm)) ||
        mh.soTinChi?.toString().includes(lowerSearchTerm)
    );
  }, [searchTerm, subjects]);

  const openAddDialog = () => {
    setCurrentSubjectFormData(initialSubjectFormValues);
    setFormError("");
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (subject) => {
    const tienQuyetMaArray = Array.isArray(subject.tienQuyet)
      ? subject.tienQuyet.filter(Boolean)
      : [];

    setCurrentSubjectFormData({
      maMonHoc: subject.maMonHoc,
      tenMonHoc: subject.tenMonHoc || "",
      soTinChi: subject.soTinChi,
      moTa: subject.moTa || "",
      tienQuyet: tienQuyetMaArray,
      thoiLuongLyThuyet: subject.thoiLuongLyThuyet ?? 0,
      thoiLuongThucHanh: subject.thoiLuongThucHanh ?? 0,
      trangThai: subject.trangThai || "Đang mở",
    });
    setFormError("");
    setIsEditDialogOpen(true);
  };

  const openDetailSubjectDialog = (subject) => {
    setViewingSubjectDetails(subject);
    setIsDetailViewOpen(true);
  };

  const handleInitiateDelete = (id) => {
    if (!id) {
      toast.error("Mã môn học không hợp lệ để xóa.");
      return;
    }
    setSubjectIdToDelete(id);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleAddSubmit = async (formDataFromComponent) => {
    if (!tokenInfo) {
      toast.error("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      const response = await api.post("/monhoc", formDataFromComponent);
      fetchSubjectsData();
      const newSubjectName =
        response.data?.tenMonHoc ||
        formDataFromComponent.tenMonHoc ||
        "Không có tên";
      toast.success(`Thêm môn học "${newSubjectName}" thành công!`);
      setIsAddDialogOpen(false);
    } catch (err) {
      const friendlyError = extractErrorMessage(err);
      setFormError(friendlyError);
      toast.error("Thêm môn học thất bại: " + friendlyError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (formDataFromComponent) => {
    if (!tokenInfo) {
      toast.error("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
      return;
    }
    setIsSaving(true);
    setFormError("");

    try {
      const response = await api.put(
        `/monhoc/${formDataFromComponent.maMonHoc}`,
        formDataFromComponent
      );
      fetchSubjectsData();
      const updatedSubjectName =
        response.data?.tenMonHoc ||
        formDataFromComponent.tenMonHoc ||
        "Không có tên";
      toast.success(`Cập nhật môn học "${updatedSubjectName}" thành công!`);
      setIsEditDialogOpen(false);
    } catch (err) {
      const friendlyError = extractErrorMessage(err);
      setFormError(friendlyError);
      toast.error("Cập nhật môn học thất bại: " + friendlyError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubjectConfirm = async () => {
    const idToDelete = subjectIdToDelete;
    if (!idToDelete) {
      toast.error("Mã môn học không hợp lệ để xóa.");
      closeDialogs();
      return;
    }
    if (!tokenInfo) {
      toast.error("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      await api.delete(`/monhoc/${idToDelete}`);
      fetchSubjectsData();
      toast.success(`Xóa môn học ${idToDelete} thành công!`);
    } catch (err) {
      const friendlyError = extractErrorMessage(err);
      toast.error(`Xóa môn học ${idToDelete} thất bại: ${friendlyError}`);
    } finally {
      closeDialogs();
    }
  };

  if (loadingAuthGlobal || loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground dark:text-gray-400">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  if (!tokenInfo && !loadingAuthGlobal) {
    return (
      <div className="p-4">
        <Alert
          variant="destructive"
          className="dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi Xác thực</AlertTitle>
          <AlertDescription>
            {error ||
              "Không thể xác thực người dùng hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."}
          </AlertDescription>
        </Alert>
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
                <BookCopy className="h-6 w-6 text-primary" /> Quản lý Môn học
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Xem, thêm, sửa, xóa thông tin các môn học của hệ thống.
              </CardDescription>
            </div>
            <Dialog
              open={isAddDialogOpen}
              onOpenChange={(isOpen) => {
                setIsAddDialogOpen(isOpen);
                if (!isOpen) closeDialogs();
              }}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                  onClick={openAddDialog}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Thêm Môn học
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">
                    Thêm Môn học mới
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-400">
                    Điền thông tin chi tiết cho môn học.
                  </DialogDescription>
                </DialogHeader>
                <SubjectForm
                  initialData={currentSubjectFormData}
                  onSubmit={handleAddSubmit}
                  onCancel={() => setIsAddDialogOpen(false)}
                  isSaving={isSaving}
                  formError={formError}
                  setFormError={setFormError}
                  allSubjectsForPrerequisites={allSubjectsForPrerequisites}
                  isEditMode={false}
                  dialogIdPrefix="add-subject"
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-6 relative">
            <Input
              placeholder="Tìm Mã MH, Tên Môn học, Trạng thái..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-10"
              aria-label="Tìm kiếm môn học"
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
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          {!loading && !error && (
            <ScrollArea className="h-[calc(100vh-450px)] md:h-[calc(100vh-400px)]">
              <Table className="min-w-full">
                <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-900 shadow-sm">
                  <TableRow className="border-b border-gray-200 dark:border-gray-700">
                    <TableHead className="w-[120px] py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Mã MH
                    </TableHead>
                    <TableHead className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Tên Môn học
                    </TableHead>
                    <TableHead className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Số TC
                    </TableHead>
                    <TableHead className="hidden md:table-cell py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Tiên quyết
                    </TableHead>
                    <TableHead className="hidden lg:table-cell py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Thời lượng (LT/TH)
                    </TableHead>
                    <TableHead className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((mh) => (
                      <TableRow
                        key={mh.maMonHoc}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <TableCell className="py-3 px-4 text-sm text-gray-700 dark:text-gray-100 font-medium">
                          {mh.maMonHoc}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                          {mh.tenMonHoc}
                        </TableCell>
                        <TableCell className="text-center py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                          {mh.soTinChi}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs dark:text-gray-300 py-3 px-4">
                          {getDisplayTienQuyet(
                            mh.tienQuyet,
                            allSubjectsForPrerequisites
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs dark:text-gray-300 py-3 px-4">
                          {mh.thoiLuongLyThuyet || 0} /{" "}
                          {mh.thoiLuongThucHanh || 0}
                        </TableCell>
                        <TableCell className="text-center py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                          <Badge
                            variant={
                              mh.trangThai === "Đang mở"
                                ? "default"
                                : mh.trangThai === "Đã đóng"
                                ? "destructive"
                                : "outline"
                            }
                            className={`${
                              mh.trangThai === "Đang mở"
                                ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                                : mh.trangThai === "Đã đóng"
                                ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                                : "dark:border-gray-500 dark:text-gray-300"
                            } text-xs`}
                          >
                            {mh.trangThai}
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
                                onClick={() => openDetailSubjectDialog(mh)}
                                className="cursor-pointer text-gray-700 hover:!bg-gray-100 dark:text-gray-200 dark:hover:!bg-gray-700 dark:focus:bg-gray-700 flex items-center px-2 py-1.5 text-sm"
                              >
                                <Info className="mr-2 h-4 w-4" /> Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEditDialog(mh)}
                                className="cursor-pointer text-gray-700 hover:!bg-gray-100 dark:text-gray-200 dark:hover:!bg-gray-700 dark:focus:bg-gray-700 flex items-center px-2 py-1.5 text-sm"
                              >
                                <Pencil className="mr-2 h-4 w-4" /> Sửa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleInitiateDelete(mh.maMonHoc);
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
                    <TableRow className="border-b border-gray-200 dark:border-gray-700">
                      <TableCell
                        colSpan={TABLE_COL_SPAN_SUBJECTS}
                        className="h-24 text-center text-muted-foreground dark:text-gray-400 py-3 px-4"
                      >
                        {searchTerm
                          ? `Không tìm thấy môn học với từ khóa "${searchTerm}".`
                          : "Chưa có môn học nào."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>

        <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-xs text-muted-foreground dark:text-gray-400">
            Hiển thị <strong>{filteredSubjects.length}</strong> trên tổng số{" "}
            <strong>{subjects.length}</strong> môn học.
          </div>
        </CardFooter>
      </Card>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(isOpen) => {
          setIsEditDialogOpen(isOpen);
          if (!isOpen) closeDialogs();
        }}
      >
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Sửa thông tin Môn học
            </DialogTitle>
            {currentSubjectFormData && currentSubjectFormData.maMonHoc && (
              <DialogDescription className="dark:text-gray-400">
                Cập nhật chi tiết cho môn:{" "}
                <span className="font-semibold">
                  {currentSubjectFormData.maMonHoc} -{" "}
                  {currentSubjectFormData.tenMonHoc}
                </span>
              </DialogDescription>
            )}
          </DialogHeader>
          {currentSubjectFormData.maMonHoc && (
            <SubjectForm
              initialData={currentSubjectFormData}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
              isSaving={isSaving}
              formError={formError}
              setFormError={setFormError}
              allSubjectsForPrerequisites={allSubjectsForPrerequisites}
              isEditMode={true}
              dialogIdPrefix="edit-subject"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailViewOpen}
        onOpenChange={(isOpen) => {
          setIsDetailViewOpen(isOpen);
          if (!isOpen) {
            closeDialogs();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
          {viewingSubjectDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="dark:text-white flex items-center gap-2 text-xl">
                  <BookCopy className="h-6 w-6 text-primary" /> Chi tiết Môn Học
                </DialogTitle>
                <DialogDescription className="dark:text-gray-400 pt-1">
                  {viewingSubjectDetails.maMonHoc} -{" "}
                  {viewingSubjectDetails.tenMonHoc}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-3">
                <div className="grid grid-cols-[max-content_1fr] items-start gap-x-4 gap-y-3 py-4 text-sm">
                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <Tag className="inline mr-1.5 h-4 w-4" />
                    Mã Môn học:
                  </span>
                  <span className="dark:text-gray-200 font-medium">
                    {viewingSubjectDetails.maMonHoc}
                  </span>

                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <Library className="inline mr-1.5 h-4 w-4" />
                    Tên Môn học:
                  </span>
                  <span className="dark:text-gray-200">
                    {viewingSubjectDetails.tenMonHoc}
                  </span>

                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <Sigma className="inline mr-1.5 h-4 w-4" />
                    Số tín chỉ:
                  </span>
                  <span className="dark:text-gray-200">
                    {viewingSubjectDetails.soTinChi}
                  </span>

                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <Hourglass className="inline mr-1.5 h-4 w-4" />
                    Thời lượng:
                  </span>
                  <span className="dark:text-gray-200">
                    LT: {viewingSubjectDetails.thoiLuongLyThuyet || 0} tiết, TH:{" "}
                    {viewingSubjectDetails.thoiLuongThucHanh || 0} tiết
                  </span>

                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <ListChecks className="inline mr-1.5 h-4 w-4" />
                    Môn tiên quyết:
                  </span>
                  <span className="dark:text-gray-200">
                    {getDisplayTienQuyet(
                      viewingSubjectDetails.tienQuyet,
                      allSubjectsForPrerequisites
                    )}
                  </span>

                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <CheckSquare className="inline mr-1.5 h-4 w-4" />
                    Trạng thái:
                  </span>
                  <span className="dark:text-gray-200">
                    <Badge
                      variant={
                        viewingSubjectDetails.trangThai === "Đang mở"
                          ? "default"
                          : viewingSubjectDetails.trangThai === "Đã đóng"
                          ? "destructive"
                          : "outline"
                      }
                      className={`${
                        viewingSubjectDetails.trangThai === "Đang mở"
                          ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                          : viewingSubjectDetails.trangThai === "Đã đóng"
                          ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                          : "dark:border-gray-500 dark:text-gray-300"
                      } text-xs`}
                    >
                      {viewingSubjectDetails.trangThai}
                    </Badge>
                  </span>

                  <span className="font-semibold dark:text-gray-300 flex items-center self-start">
                    <FileText className="inline mr-1.5 h-4 w-4" />
                    Mô tả:
                  </span>
                  <span className="dark:text-gray-200 whitespace-pre-wrap break-words">
                    {viewingSubjectDetails.moTa || "Không có mô tả."}
                  </span>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4 border-t dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailViewOpen(false)}
                  className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200"
                >
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={(isOpen) => {
          setIsConfirmDeleteDialogOpen(isOpen);
          if (!isOpen) {
            closeDialogs();
          }
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Xác nhận xóa?
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa môn
              học có mã "{subjectIdToDelete}
              "? Lưu ý: Môn học có thể không xóa được nếu đang được sử dụng hoặc
              là tiên quyết của môn khác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t dark:border-gray-700 pt-4">
            <AlertDialogCancel
              onClick={() => {
                setIsConfirmDeleteDialogOpen(false);
              }}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubjectConfirm}
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

export default AdminSubjects;
