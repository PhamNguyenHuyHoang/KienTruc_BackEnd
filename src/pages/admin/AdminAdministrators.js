// src/pages/admin/AdminAdministrators.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../api/axios";
import {
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  UserCog,
  Info,
  XIcon,
  ShieldCheck,
  AtSign,
  User as UserIcon,
  KeyRound,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
  ChevronsUpDown,
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
  CardTitle,
  CardHeader,
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
} from "../../components/ui/alert-dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";

const initialAddAdminForm = {
  maAdmin: "",
  hoTen: "",
  email: "",
};

const TABLE_COL_SPAN_ADMINS = 5;
const ITEMS_PER_PAGE = 10;

const AdminAdministrators = () => {
  // Hooks & Context
  const {
    tokenInfo,
    loadingInfo: loadingContextInfo,
    adminInfo: loggedInAdminDetails,
    updateAdminInfoInContext,
  } = useOutletContext() || {
    tokenInfo: null,
    loadingContextInfo: true,
    adminInfo: null,
    updateAdminInfoInContext: () => {},
  };

  // State
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState(initialAddAdminForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [viewingAdmin, setViewingAdmin] = useState(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  const [adminIdToDelete, setAdminIdToDelete] = useState(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false);

  const [adminIdToResetPassword, setAdminIdToResetPassword] = useState(null);
  const [adminNameToResetPassword, setAdminNameToResetPassword] = useState("");
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({
    key: "maAdmin",
    direction: "ascending",
  });

  // Permissions
  const currentAdminMa = loggedInAdminDetails?.maAdmin;

  const canAdd = useMemo(() => currentAdminMa === "qtv002", [currentAdminMa]);

  const canDeleteThisAdmin = useCallback(
    (adminMaToDelete) =>
      currentAdminMa === "qtv002" && adminMaToDelete !== currentAdminMa,
    [currentAdminMa]
  );

  const canEditThisAdmin = useCallback(
    () => !!currentAdminMa,
    [currentAdminMa]
  );

  const canResetPasswordForAdmin = useCallback(
    (adminMaToReset) =>
      currentAdminMa === "qtv002" && adminMaToReset !== currentAdminMa,
    [currentAdminMa]
  );

  // Fetch Admins (full list, no backend pagination)
  const fetchAdmins = useCallback(async () => {
    if (loadingContextInfo) {
      setLoading(true);
      return;
    }
    if (!tokenInfo) {
      setLoading(false);
      setError("Không thể xác thực người dùng quản trị để tải danh sách.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/quantrivien");
      if (response.data && Array.isArray(response.data)) {
        setAdmins(response.data);
      } else {
        setAdmins([]);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Không thể tải danh sách quản trị viên.";
      setError(errMsg);
      toast.error(errMsg);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [loadingContextInfo, tokenInfo]);

  // Debounce searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch admins on mount and on context/token change
  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Sorting + Filtering + Paging client side
  const sortedAdmins = useMemo(() => {
    let sortableItems = [...admins];

    // Filter by debouncedSearchTerm
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      sortableItems = sortableItems.filter(
        (a) =>
          a.maAdmin.toLowerCase().includes(term) ||
          (a.hoTen || "").toLowerCase().includes(term) ||
          (a.email || "").toLowerCase().includes(term) ||
          (a.taiKhoan?.tenDangNhap || "").toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = (
          sortConfig.key === "tenDangNhap"
            ? a.taiKhoan?.tenDangNhap || ""
            : a[sortConfig.key] || ""
        )
          .toString()
          .toLowerCase();
        const valB = (
          sortConfig.key === "tenDangNhap"
            ? b.taiKhoan?.tenDangNhap || ""
            : b[sortConfig.key] || ""
        )
          .toString()
          .toLowerCase();

        if (valA < valB) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [admins, debouncedSearchTerm, sortConfig]);

  // Pagination variables
  const totalAdminsFiltered = sortedAdmins.length;
  const totalPagesCalc = Math.max(
    1,
    Math.ceil(totalAdminsFiltered / ITEMS_PER_PAGE)
  );
  const currentPageSafe = Math.min(currentPage, totalPagesCalc);

  const pagedAdmins = useMemo(() => {
    const startIdx = (currentPageSafe - 1) * ITEMS_PER_PAGE;
    return sortedAdmins.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [sortedAdmins, currentPageSafe]);

  // Sorting Handlers
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    } else if (
      sortConfig.key === key &&
      sortConfig.direction === "descending"
    ) {
      setSortConfig({ key: key, direction: "ascending" });
      return;
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <ChevronsUpDown className="ml-1 h-3 w-3 text-muted-foreground/70 group-hover:text-muted-foreground" />
      );
    }
    if (sortConfig.direction === "ascending") {
      return <ArrowUpNarrowWide className="ml-1 h-3 w-3 text-primary" />;
    }
    return <ArrowDownNarrowWide className="ml-1 h-3 w-3 text-primary" />;
  };

  // Pagination Handlers
  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= totalPagesCalc &&
      newPage !== currentPageSafe
    ) {
      setCurrentPage(newPage);
    }
  };

  // Dialog Handlers
  const openAddDialog = () => {
    if (!canAdd) {
      toast.warn("Bạn không có quyền thêm quản trị viên mới.");
      return;
    }
    setAdminForm(initialAddAdminForm);
    setEditingAdmin(null);
    setFormError("");
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (admin) => {
    if (!canEditThisAdmin(admin.maAdmin)) {
      toast.warn(
        "Bạn không có quyền chỉnh sửa thông tin của quản trị viên này."
      );
      return;
    }
    setEditingAdmin(admin);
    setAdminForm({
      hoTen: admin.hoTen || "",
      email: admin.email || "",
    });
    setFormError("");
    setIsEditDialogOpen(true);
  };

  const openDetailAdminDialog = (admin) => {
    setViewingAdmin(admin);
    setIsDetailViewOpen(true);
  };

  const handleInitiateDelete = (adminMa) => {
    if (!adminMa) {
      toast.error("Mã quản trị viên không hợp lệ để xóa.");
      return;
    }
    if (!canDeleteThisAdmin(adminMa)) {
      toast.warn("Bạn không có quyền xóa quản trị viên này.");
      return;
    }
    setAdminIdToDelete(adminMa);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleInitiateResetPassword = (admin) => {
    if (!canResetPasswordForAdmin(admin.maAdmin)) {
      toast.warn("Bạn không có quyền đặt lại mật khẩu cho quản trị viên này.");
      return;
    }
    setAdminIdToResetPassword(admin.maAdmin);
    setAdminNameToResetPassword(admin.hoTen || admin.maAdmin);
    setIsResetPasswordDialogOpen(true);
  };

  // Close all dialogs
  const closeDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDetailViewOpen(false);
    setIsConfirmDeleteDialogOpen(false);
    setIsResetPasswordDialogOpen(false);

    setEditingAdmin(null);
    setViewingAdmin(null);
    setAdminIdToDelete(null);
    setAdminIdToResetPassword(null);
    setAdminNameToResetPassword("");
    setAdminForm(initialAddAdminForm);
    setFormError("");
  };

  // Form Change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form
  const validateForm = (form, isEditMode = false) => {
    if (!isEditMode && !form.maAdmin?.trim()) {
      setFormError("Mã Quản trị viên (Tên đăng nhập) không được để trống.");
      return false;
    }
    if (!form.hoTen?.trim()) {
      setFormError("Họ tên không được để trống.");
      return false;
    }
    if (!form.email?.trim()) {
      setFormError("Email không được để trống.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      setFormError("Định dạng email không hợp lệ.");
      return false;
    }
    setFormError("");
    return true;
  };

  // Submit Add
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(adminForm, false)) return;
    if (!canAdd) {
      toast.error("Không có quyền thực hiện hành động này.");
      return;
    }
    setIsSaving(true);
    const payload = {
      maAdmin: adminForm.maAdmin.trim(),
      hoTen: adminForm.hoTen.trim(),
      email: adminForm.email.trim(),
    };

    try {
      const response = await api.post("/api/quantrivien", payload);
      toast.success(
        `Thêm quản trị viên "${response.data.hoTen}" thành công! Mật khẩu mặc định là "123456".`
      );
      closeDialogs();
      fetchAdmins();
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setSortConfig({ key: "maAdmin", direction: "ascending" });
      setCurrentPage(1);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        const conflictField = err.response.data?.field;
        let conflictMsg =
          err.response.data?.message ||
          "Thêm quản trị viên thất bại do thông tin bị trùng lặp.";
        if (conflictField === "maAdmin") {
          conflictMsg = `Mã QTV (Tên đăng nhập) "${payload.maAdmin}" đã tồn tại. Vui lòng chọn mã khác.`;
        } else if (conflictField === "email") {
          conflictMsg = `Email "${payload.email}" đã được sử dụng. Vui lòng chọn email khác.`;
        }
        setFormError(conflictMsg);
        toast.error(conflictMsg);
      } else {
        const errMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Thêm quản trị viên thất bại.";
        setFormError(errMsg);
        toast.error(`Thêm thất bại: ${errMsg}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAdmin || !validateForm(adminForm, true)) return;
    if (!canEditThisAdmin(editingAdmin.maAdmin)) {
      toast.error("Không có quyền thực hiện hành động này.");
      return;
    }
    setIsSaving(true);
    const payload = {
      hoTen: adminForm.hoTen.trim(),
      email: adminForm.email.trim(),
    };

    try {
      const response = await api.put(
        `/api/quantrivien/${editingAdmin.maAdmin}`,
        payload
      );
      toast.success(
        `Cập nhật thông tin cho "${response.data.hoTen}" thành công!`
      );
      if (
        loggedInAdminDetails &&
        editingAdmin.maAdmin === loggedInAdminDetails.maAdmin
      ) {
        const updatedAdminContextData = {
          ...loggedInAdminDetails,
          hoTen: response.data.hoTen,
          email: response.data.email,
        };
        updateAdminInfoInContext(updatedAdminContextData);
        toast.info("Thông tin cá nhân của bạn đã được cập nhật.");
      }
      closeDialogs();
      fetchAdmins();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        const conflictField = err.response.data?.field;
        let conflictMsg =
          err.response.data?.message ||
          "Cập nhật thất bại do thông tin bị trùng lặp.";
        if (conflictField === "email") {
          conflictMsg = `Email "${payload.email}" đã được sử dụng. Vui lòng chọn email khác.`;
        }
        setFormError(conflictMsg);
        toast.error(conflictMsg);
      } else {
        const errMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Cập nhật thất bại.";
        setFormError(errMsg);
        toast.error(`Cập nhật thất bại: ${errMsg}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Delete
  const handleDeleteAdminConfirm = async () => {
    const idToDelete = adminIdToDelete;
    if (!idToDelete) {
      toast.error("Mã quản trị viên để xóa không hợp lệ.");
      closeDialogs();
      return;
    }
    if (!canDeleteThisAdmin(idToDelete)) {
      toast.warn("Không có quyền xóa quản trị viên này.");
      closeDialogs();
      return;
    }
    setIsSaving(true);
    try {
      await api.delete(`/api/quantrivien/${idToDelete}`);
      toast.success(`Xóa quản trị viên ${idToDelete} thành công!`);
      closeDialogs();
      fetchAdmins();
      setCurrentPage(1);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        `Xóa quản trị viên ${idToDelete} thất bại.`;
      toast.error(`Xóa thất bại: ${errMsg}`);
    } finally {
      setIsSaving(false);
      closeDialogs();
    }
  };

  // Confirm Reset Password
  const handleResetPasswordConfirm = async () => {
    if (!adminIdToResetPassword) {
      toast.error("Mã quản trị viên không hợp lệ để đặt lại mật khẩu.");
      closeDialogs();
      return;
    }
    if (!canResetPasswordForAdmin(adminIdToResetPassword)) {
      toast.warn("Bạn không có quyền thực hiện hành động này.");
      closeDialogs();
      return;
    }
    setIsResettingPassword(true);
    try {
      // Backend chưa có API reset password riêng, giả sử giữ nguyên endpoint
      await api.post(
        `/api/quantrivien/${adminIdToResetPassword}/reset-password`
      );
      toast.success(
        `Mật khẩu cho quản trị viên "${adminNameToResetPassword}" (${adminIdToResetPassword}) đã được đặt lại thành công (mật khẩu mặc định là "123456").`
      );
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Đặt lại mật khẩu thất bại.";
      toast.error(errMsg);
    } finally {
      setIsResettingPassword(false);
      closeDialogs();
    }
  };

  // Render Loading & Error states
  if (loadingContextInfo) {
    return (
      <div className="flex justify-center items-center p-10 min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg text-muted-foreground dark:text-gray-400">
          Đang tải thông tin người dùng...
        </p>
      </div>
    );
  }
  if (!tokenInfo) {
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

  // Main Render
  return (
    <>
      <Card className="shadow-lg border dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-semibold dark:text-white">
                <UserCog className="h-6 w-6 text-primary" /> Quản lý Quản trị
                viên
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Xem, thêm, sửa, xóa và đặt lại mật khẩu tài khoản quản trị viên.
              </CardDescription>
            </div>
            {canAdd && (
              <Dialog
                open={isAddDialogOpen}
                onOpenChange={(isOpen) => {
                  if (!isOpen) closeDialogs();
                  else setIsAddDialogOpen(true);
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
                      Thêm Quản trị viên
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
                  <form onSubmit={handleAddSubmit}>
                    <DialogHeader>
                      <DialogTitle className="dark:text-white">
                        Thêm Quản trị viên mới
                      </DialogTitle>
                      <DialogDescription className="dark:text-gray-400">
                        Mã QTV sẽ là tên đăng nhập. Mật khẩu mặc định: "123456".
                      </DialogDescription>
                    </DialogHeader>
                    {formError && (
                      <Alert variant="destructive" className="my-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Lỗi Form</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                      </Alert>
                    )}
                    <ScrollArea className="max-h-[60vh] p-1 pr-3">
                      <div className="grid gap-4 py-4">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="add-maAdmin"
                            className="dark:text-gray-300"
                          >
                            Mã QTV (Tên đăng nhập)*
                          </Label>
                          <Input
                            id="add-maAdmin"
                            name="maAdmin"
                            value={adminForm.maAdmin}
                            onChange={handleFormChange}
                            required
                            placeholder="VD: qtv003"
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
                            value={adminForm.hoTen}
                            onChange={handleFormChange}
                            required
                            placeholder="VD: Nguyễn Văn B"
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
                            value={adminForm.email}
                            onChange={handleFormChange}
                            required
                            placeholder="VD: qtv003@example.com"
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
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        {isSaving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}{" "}
                        Lưu
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="mt-6 relative">
            <Input
              placeholder="Tìm Mã QTV, Họ tên, Email, Tên ĐN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-10"
              aria-label="Tìm kiếm quản trị viên"
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
          {loading && !error && (
            <div className="flex justify-center items-center p-10 min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground dark:text-gray-400">
                Đang tải danh sách quản trị viên...
              </p>
            </div>
          )}
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
                    <TableHead
                      className="w-[140px] py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/50 group"
                      onClick={() => requestSort("maAdmin")}
                    >
                      <div className="flex items-center">
                        Mã QTV {getSortIcon("maAdmin")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/50 group"
                      onClick={() => requestSort("hoTen")}
                    >
                      <div className="flex items-center">
                        Họ tên {getSortIcon("hoTen")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/50 group"
                      onClick={() => requestSort("email")}
                    >
                      <div className="flex items-center">
                        Email {getSortIcon("email")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="hidden md:table-cell py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/50 group"
                      onClick={() => requestSort("tenDangNhap")}
                    >
                      <div className="flex items-center">
                        Tên Đăng nhập {getSortIcon("tenDangNhap")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {pagedAdmins.length > 0 ? (
                    pagedAdmins.map((admin) => (
                      <TableRow
                        key={admin.maAdmin}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <TableCell className="py-3 px-4 text-sm text-gray-700 dark:text-gray-100 font-medium">
                          {admin.maAdmin}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                          {admin.hoTen}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                          {admin.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                          {admin.taiKhoan?.tenDangNhap || admin.maAdmin}
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
                                onClick={() => openDetailAdminDialog(admin)}
                                className="cursor-pointer text-gray-700 hover:!bg-gray-100 dark:text-gray-200 dark:hover:!bg-gray-700 dark:focus:bg-gray-700 flex items-center px-2 py-1.5 text-sm"
                              >
                                <Info className="mr-2 h-4 w-4" /> Xem chi tiết
                              </DropdownMenuItem>
                              {canEditThisAdmin(admin.maAdmin) && (
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(admin)}
                                  className="cursor-pointer text-gray-700 hover:!bg-gray-100 dark:text-gray-200 dark:hover:!bg-gray-700 dark:focus:bg-gray-700 flex items-center px-2 py-1.5 text-sm"
                                >
                                  <Pencil className="mr-2 h-4 w-4" /> Sửa
                                </DropdownMenuItem>
                              )}
                              {canResetPasswordForAdmin(admin.maAdmin) && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleInitiateResetPassword(admin)
                                  }
                                  className="cursor-pointer text-gray-700 hover:!bg-gray-100 dark:text-gray-200 dark:hover:!bg-gray-700 dark:focus:bg-gray-700 flex items-center px-2 py-1.5 text-sm"
                                >
                                  <RefreshCcw className="mr-2 h-4 w-4" /> Đặt
                                  lại mật khẩu
                                </DropdownMenuItem>
                              )}
                              {canDeleteThisAdmin(admin.maAdmin) && (
                                <>
                                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                  <DropdownMenuItem
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      handleInitiateDelete(admin.maAdmin);
                                    }}
                                    className="text-red-500 focus:text-red-500 dark:text-red-400 hover:!bg-red-100 dark:hover:!bg-red-900/30 focus:bg-red-100 dark:focus:bg-red-900/40 cursor-pointer flex items-center px-2 py-1.5 text-sm"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="border-b border-gray-200 dark:border-gray-700">
                      <TableCell
                        colSpan={TABLE_COL_SPAN_ADMINS}
                        className="h-24 text-center text-muted-foreground dark:text-gray-400 py-3 px-4"
                      >
                        {debouncedSearchTerm
                          ? `Không tìm thấy quản trị viên với từ khóa "${debouncedSearchTerm}".`
                          : "Không có quản trị viên nào."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground dark:text-gray-400">
              Hiển thị{" "}
              <strong>
                {pagedAdmins.length > 0
                  ? (currentPageSafe - 1) * ITEMS_PER_PAGE + 1
                  : 0}
              </strong>{" "}
              -{" "}
              <strong>
                {Math.min(
                  (currentPageSafe - 1) * ITEMS_PER_PAGE + pagedAdmins.length,
                  totalAdminsFiltered
                )}
              </strong>{" "}
              trên tổng số <strong>{totalAdminsFiltered}</strong> quản trị viên.
            </div>
            {totalPagesCalc > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPageSafe - 1)}
                  disabled={currentPageSafe === 1 || loading}
                  className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Trước</span>
                </Button>
                <span className="text-sm text-muted-foreground dark:text-gray-400">
                  Trang {currentPageSafe} / {totalPagesCalc}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPageSafe + 1)}
                  disabled={currentPageSafe === totalPagesCalc || loading}
                  className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200"
                >
                  <span className="hidden sm:inline">Sau</span>
                  <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* EDIT ADMIN DIALOG */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeDialogs();
          else setIsEditDialogOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
          {editingAdmin && (
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  Sửa thông tin Quản trị viên
                </DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Cập nhật thông tin cho:{" "}
                  <span className="font-semibold">
                    {editingAdmin.maAdmin} - {editingAdmin.hoTen}
                  </span>
                </DialogDescription>
              </DialogHeader>
              {formError && (
                <Alert variant="destructive" className="my-3">
                  <AlertCircle className="h-4 w-4" />{" "}
                  <AlertTitle>Lỗi Form</AlertTitle>{" "}
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <ScrollArea className="max-h-[60vh] p-1 pr-3">
                <div className="grid gap-4 py-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-maAdmin-display"
                      className="dark:text-gray-300"
                    >
                      Mã QTV (Tên đăng nhập)
                    </Label>
                    <Input
                      id="edit-maAdmin-display"
                      value={editingAdmin.maAdmin}
                      className="dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400"
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-hoTen" className="dark:text-gray-300">
                      Họ tên*
                    </Label>
                    <Input
                      id="edit-hoTen"
                      name="hoTen"
                      value={adminForm.hoTen}
                      onChange={handleFormChange}
                      required
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                      value={adminForm.email}
                      onChange={handleFormChange}
                      required
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

      {/* VIEW ADMIN DETAILS DIALOG */}
      <Dialog
        open={isDetailViewOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeDialogs();
          else setIsDetailViewOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
          {viewingAdmin && (
            <>
              <DialogHeader>
                <DialogTitle className="dark:text-white flex items-center gap-2 text-xl">
                  <UserCog className="h-6 w-6 text-primary" /> Chi tiết Quản trị
                  viên
                </DialogTitle>
                <DialogDescription className="dark:text-gray-400 pt-1">
                  {viewingAdmin.maAdmin} - {viewingAdmin.hoTen}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-3">
                <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-3 py-4 text-sm">
                  {viewingAdmin.avatarUrl && (
                    <div className="col-span-2 flex justify-center mb-3">
                      <Avatar className="h-24 w-24 border-2 dark:border-primary">
                        <AvatarImage
                          src={viewingAdmin.avatarUrl}
                          alt={`Ảnh đại diện ${viewingAdmin.hoTen}`}
                        />
                        <AvatarFallback className="dark:bg-gray-700 dark:text-gray-300 text-3xl">
                          {viewingAdmin.hoTen
                            ?.split(" ")
                            .pop()
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            viewingAdmin.maAdmin?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <UserIcon className="inline mr-1.5 h-4 w-4" />
                    Họ tên:
                  </span>
                  <span className="dark:text-gray-200">
                    {viewingAdmin.hoTen}
                  </span>

                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <ShieldCheck className="inline mr-1.5 h-4 w-4" />
                    Mã QTV:
                  </span>
                  <span className="dark:text-gray-200 font-medium">
                    {viewingAdmin.maAdmin}
                  </span>

                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <AtSign className="inline mr-1.5 h-4 w-4" />
                    Email:
                  </span>
                  <span className="dark:text-gray-200">
                    {viewingAdmin.email}
                  </span>

                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <KeyRound className="inline mr-1.5 h-4 w-4" />
                    Tên đăng nhập:
                  </span>
                  <span className="dark:text-gray-200">
                    {viewingAdmin.taiKhoan?.tenDangNhap || viewingAdmin.maAdmin}
                  </span>

                  <span className="font-semibold dark:text-gray-300 flex items-center">
                    <Info className="inline mr-1.5 h-4 w-4" />
                    Vai trò:
                  </span>
                  <Badge
                    variant="secondary"
                    className="dark:bg-sky-700 dark:text-sky-200"
                  >
                    Quản trị viên
                  </Badge>
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

      {/* DELETE ADMIN CONFIRMATION DIALOG */}
      <AlertDialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeDialogs();
          else setIsConfirmDeleteDialogOpen(true);
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Xác nhận xóa?
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa quản
              trị viên có mã "{adminIdToDelete}"? Tài khoản liên kết cũng sẽ bị
              xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t dark:border-gray-700 pt-4">
            <AlertDialogCancel
              onClick={closeDialogs}
              disabled={isSaving}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdminConfirm}
              disabled={isSaving}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}{" "}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* RESET PASSWORD CONFIRMATION DIALOG */}
      <AlertDialog
        open={isResetPasswordDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeDialogs();
          else setIsResetPasswordDialogOpen(true);
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Xác nhận Đặt lại Mật khẩu?
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Bạn có chắc chắn muốn đặt lại mật khẩu cho quản trị viên{" "}
              <span className="font-semibold">
                {adminNameToResetPassword} ({adminIdToResetPassword})
              </span>
              ? Mật khẩu sẽ được đặt về giá trị mặc định ("123456").
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t dark:border-gray-700 pt-4">
            <AlertDialogCancel
              onClick={closeDialogs}
              disabled={isResettingPassword}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPasswordConfirm}
              disabled={isResettingPassword}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isResettingPassword ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}{" "}
              Đặt lại
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminAdministrators;
