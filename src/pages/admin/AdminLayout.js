// src/pages/admin/AdminLayout.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { api, getUserInfoFromToken } from "../../api/axios";
import ChatBot from "../../components/ChatBot"; // Điều chỉnh đường dẫn phù hợp với file ChatBot của bạn

import {
  LayoutDashboard,
  Users,
  Library,
  BookOpenCheck,
  CalendarX2,
  BarChart3,
  LogOut,
  Menu,
  Settings,
  LifeBuoy,
  Loader2,
  UserCog,
  GraduationCap,
  Sun,
  Moon,
  Archive,
  UploadCloud, // Icon for Upload
  NotebookText,
  Edit3,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "react-toastify";

// NavLink Component (no changes)
const NavLink = ({ to, icon: Icon, children, onClick }) => {
  const location = useLocation();
  const isActive =
    (location.pathname === `/pages/admin` && to === "dashboard") ||
    location.pathname === `/pages/admin/${to}` ||
    (location.pathname.startsWith(`/pages/admin/${to}/`) && to !== "dashboard");
  const href = to === "dashboard" ? "/pages/admin" : `/pages/admin/${to}`;

  return (
    <li>
      <Link
        to={href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-sm",
          isActive
            ? "bg-gray-700 text-white font-semibold dark:bg-gray-600"
            : "text-gray-300 hover:text-white hover:bg-gray-700/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
        )}
      >
        <Icon className="h-4 w-4" />
        {children}
      </Link>
    </li>
  );
};

// EditProfileModal Component
const EditProfileModal = ({ isOpen, onClose, adminInfo, onSave }) => {
  const [displayName, setDisplayName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && adminInfo) {
      setDisplayName(adminInfo.hoTen || "");
      setPreviewUrl(adminInfo.avatarUrl || "");
      setSelectedFile(null);
    }
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [adminInfo, isOpen, previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(displayName, selectedFile);
      toast.success("Cập nhật hồ sơ thành công!");
      onClose();
    } catch (error) {
      // Error toast is handled by the onSave implementation
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            Chỉnh sửa hồ sơ
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Cập nhật tên hiển thị và tải lên ảnh đại diện mới của bạn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="displayName"
                className="text-right text-gray-700 dark:text-gray-300"
              >
                Tên hiển thị
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="col-span-3 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-slate-600 focus:ring-primary-500 dark:focus:ring-primary-400"
                placeholder="Nhập tên hiển thị"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2 text-gray-700 dark:text-gray-300">
                Ảnh đại diện
              </Label>
              <div className="col-span-3">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={previewUrl || adminInfo?.avatarUrl}
                      alt="Ảnh đại diện"
                      onError={(e) => {
                        e.target.src = `https://avatar.vercel.sh/${
                          adminInfo?.username || "admin"
                        }.png?text=${adminInfo?.hoTen?.charAt(0) || "A"}`;
                      }}
                    />
                    <AvatarFallback className="text-sm bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                      {(adminInfo?.hoTen || "Admin").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-600"
                  >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Tải ảnh lên
                  </Button>
                  <Input
                    type="file"
                    id="avatarFile"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                  />
                </div>
                {selectedFile && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Đã chọn: {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Hỗ trợ PNG, JPG, GIF. Tối đa 2MB.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-gray-200 dark:border-slate-700 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-600"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const [adminInfo, setAdminInfo] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  // ** Thêm state quản lý mở ChatBot **
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  const isMounted = useRef(true);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      const htmlElement = document.documentElement;
      if (newMode) {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }
      localStorage.setItem("darkMode", JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "j") {
        event.preventDefault();
        toggleDarkMode();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleDarkMode]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setAdminInfo(null);
    setTokenInfo(null);
    navigate("/login");
    toast.info("Bạn đã đăng xuất.");
  }, [navigate]);

  const handleSaveProfile = async (newDisplayName, avatarFile) => {
    if (!tokenInfo || !tokenInfo.username) {
      toast.error("Không tìm thấy thông tin người dùng để cập nhật.");
      throw new Error("Missing user token info for update");
    }

    const formData = new FormData();
    formData.append("hoTen", newDisplayName);
    if (avatarFile) {
      const allowedTypes = ["image/png", "image/jpeg", "image/gif"];
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(avatarFile.type)) {
        toast.error("Loại file không hợp lệ. Chỉ chấp nhận PNG, JPG, GIF.");
        throw new Error("Invalid file type");
      }
      if (avatarFile.size > maxSizeInBytes) {
        toast.error("Kích thước file quá lớn. Tối đa 2MB.");
        throw new Error("File size exceeds limit");
      }
      formData.append("avatarFile", avatarFile);
    }

    try {
      const response = await api.put(
        `/quantrivien/${tokenInfo.username}`,
        formData,
        {
          // Axios sets Content-Type automatically for FormData
        }
      );

      setAdminInfo((prevAdminInfo) => ({
        ...prevAdminInfo,
        ...response.data,
      }));
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      const serverMessage = error.response?.data?.message;
      if (
        error.message === "Invalid file type" ||
        error.message === "File size exceeds limit"
      ) {
        // Toast already shown
      } else if (serverMessage) {
        toast.error(`Cập nhật thất bại: ${serverMessage}`);
      } else {
        toast.error("Cập nhật hồ sơ thất bại. Vui lòng thử lại.");
      }
      throw error;
    }
  };

  useEffect(() => {
    isMounted.current = true;
    setLoadingAuth(true);

    const verifyAuthAndFetchDetails = async () => {
      let currentTokenInfo = null;
      try {
        currentTokenInfo = getUserInfoFromToken();
      } catch (parseError) {
        console.error("AdminLayout: Lỗi khi parse token:", parseError);
        if (isMounted.current) {
          toast.error(
            "Token không hợp lệ hoặc đã bị lỗi. Vui lòng đăng nhập lại."
          );
          handleLogout();
          setLoadingAuth(false);
        }
        return;
      }

      if (!isMounted.current) return;

      if (
        !currentTokenInfo ||
        !currentTokenInfo.username ||
        currentTokenInfo.role !== "QUANTRIVIEN"
      ) {
        if (!currentTokenInfo) {
          console.warn("AdminLayout: Không tìm thấy token. Đang đăng xuất.");
        } else if (!currentTokenInfo.username) {
          console.warn(
            "AdminLayout: Token không chứa thông tin username. Đang đăng xuất."
          );
          toast.error(
            "Token không hợp lệ (thiếu thông tin người dùng). Đang đăng xuất."
          );
        } else if (currentTokenInfo.role !== "QUANTRIVIEN") {
          console.warn(
            `AdminLayout: Vai trò không hợp lệ ('${currentTokenInfo.role}'). Cần 'QUANTRIVIEN'. Đang đăng xuất.`
          );
          toast.error(
            "Bạn không có quyền truy cập vào trang quản trị. Đang đăng xuất."
          );
        }
        handleLogout();
        if (isMounted.current) setLoadingAuth(false);
        return;
      }

      if (isMounted.current) setTokenInfo(currentTokenInfo);

      try {
        const response = await api.get(
          `/quantrivien/${currentTokenInfo.username}`
        );
        if (isMounted.current) {
          setAdminInfo(response.data);
        }
      } catch (error) {
        console.error(
          "AdminLayout: Lỗi fetch thông tin chi tiết admin:",
          error
        );
        if (isMounted.current) {
          let errorMessage = "Không thể tải thông tin người dùng quản trị.";
          let shouldLogout = false;
          if (error.response) {
            const status = error.response.status;
            if (status === 404) {
              errorMessage = `Không tìm thấy thông tin QTV cho '${currentTokenInfo.username}'.`;
              shouldLogout = true;
            } else if (status === 401 || status === 403) {
              errorMessage =
                "Phiên hết hạn hoặc không có quyền. Đang đăng xuất.";
              shouldLogout = true;
            }
          } else if (error.request) {
            errorMessage = "Không thể kết nối máy chủ.";
          } else {
            errorMessage = `Lỗi không xác định: ${error.message}`;
          }
          toast.error(errorMessage);
          if (shouldLogout) handleLogout();
        }
      } finally {
        if (isMounted.current) setLoadingAuth(false);
      }
    };

    verifyAuthAndFetchDetails();

    return () => {
      isMounted.current = false;
    };
  }, [navigate, handleLogout]);

  const displayName = adminInfo?.hoTen || tokenInfo?.username || "Admin";
  const avatarFallback =
    adminInfo?.hoTen?.charAt(0)?.toUpperCase() ||
    tokenInfo?.username?.charAt(0)?.toUpperCase() ||
    "AD";
  const adminEmail =
    adminInfo?.email ||
    (tokenInfo ? `${tokenInfo.username}@admin.system` : "Chưa có email");

  const adminNavItems = [
    { to: "dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { to: "students", icon: Users, label: "Quản lý Sinh viên" },
    { to: "administrators", icon: UserCog, label: "Quản lý Quản trị viên" },
    { to: "subjects", icon: Library, label: "Quản lý Môn học" },
    { to: "nganhhoc", icon: Archive, label: "Quản lý Ngành học" },
    {
      to: "chuongtrinhkhung",
      icon: NotebookText,
      label: "Quản lý Chương trình khung",
    },
    { to: "courses", icon: BookOpenCheck, label: "Quản lý Học phần" },
    // Đã loại bỏ các mục xung đột, báo cáo, hỗ trợ khỏi menu điều hướng
  ];

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!tokenInfo) {
    return null;
  }

  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="hidden md:flex h-full max-h-screen flex-col gap-2 border-r bg-gray-900 text-white dark:bg-gray-950 dark:border-slate-800">
          <div className="flex h-14 items-center border-b border-gray-700 dark:border-slate-700 px-4 lg:h-[60px] lg:px-6">
            <Link
              to="/pages/admin"
              className="flex items-center gap-2 font-semibold"
            >
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="">Admin Portal</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="flex flex-col gap-1 px-2 lg:px-4">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  onClick={() => setIsMobileSheetOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </ul>
          </nav>
          {/* Nút ChatBot hỗ trợ */}
          <div className="px-4 py-3 border-t border-gray-700 dark:border-slate-700">
            <button
              onClick={() => setIsChatBotOpen(true)}
              className="flex items-center gap-2 w-full rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
              title="Mở chatbot hỗ trợ"
            >
              <LifeBuoy className="h-5 w-5" />
              Hỗ trợ Chatbot
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-col bg-gray-100 dark:bg-slate-900">
          {/* Header */}
          <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 shadow-sm">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden bg-white hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-600"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Mở menu</span>
                </Button>
              </SheetTrigger>
              {/* Mobile Menu Content (SheetContent) */}
              <SheetContent
                side="left"
                className="flex flex-col bg-gray-900 text-white dark:bg-gray-950 border-r-0 dark:border-slate-800 w-[280px] sm:w-[320px] p-0"
              >
                <div className="flex h-14 items-center border-b border-gray-700 dark:border-slate-700 px-4 lg:h-[60px] lg:px-6">
                  <Link
                    to="/pages/admin"
                    className="flex items-center gap-2 text-lg font-semibold"
                    onClick={() => setIsMobileSheetOpen(false)}
                  >
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="">Admin Portal</span>
                  </Link>
                </div>
                <nav className="grid items-start gap-1 p-2 text-sm font-medium lg:p-4">
                  <ul className="flex flex-col gap-1">
                    {adminNavItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        onClick={() => setIsMobileSheetOpen(false)}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                    {/* Nút ChatBot trong mobile menu */}
                    <li>
                      <button
                        onClick={() => {
                          setIsMobileSheetOpen(false);
                          setIsChatBotOpen(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-400 hover:bg-gray-700 hover:text-white dark:hover:bg-gray-700"
                        title="Mở chatbot hỗ trợ"
                      >
                        <LifeBuoy className="h-4 w-4" />
                        Hỗ trợ Chatbot
                      </button>
                    </li>
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1"></div> {/* Spacer */}
            {/* Dark Mode Toggle Button */}
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="icon"
              className="mr-2 bg-white hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-600"
              title="Chuyển đổi giao diện (Ctrl+J)"
            >
              {isDarkMode ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">Chuyển đổi giao diện</span>
            </Button>
            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={
                        adminInfo?.avatarUrl ||
                        `https://avatar.vercel.sh/${
                          tokenInfo?.username || "admin"
                        }.png?text=${avatarFallback}`
                      }
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold dark:bg-primary/30 dark:text-primary-foreground">
                      {!adminInfo && tokenInfo && loadingAuth ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        avatarFallback
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Mở menu người dùng</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-md"
              >
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                      {displayName}
                    </p>
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                      {adminEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-700" />
                <DropdownMenuItem
                  onClick={() => setIsEditProfileModalOpen(true)}
                  disabled={!adminInfo && !tokenInfo}
                  className="text-gray-700 hover:!bg-gray-100 dark:text-gray-300 dark:hover:!bg-slate-700 cursor-pointer"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  <span>Chỉnh sửa hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled
                  className="text-gray-400 dark:text-gray-500 cursor-not-allowed"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt chung</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 hover:!bg-red-100 focus:text-red-700 focus:bg-red-100 dark:text-red-400 dark:hover:!bg-red-500/30 dark:focus:bg-red-500/40 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8">
              <Outlet
                context={{
                  adminInfo,
                  tokenInfo,
                  loadingAuthGlobal: loadingAuth,
                  updateAdminInfoInContext: setAdminInfo,
                }}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Hiển thị ChatBot khi mở */}
      {isChatBotOpen && <ChatBot onClose={() => setIsChatBotOpen(false)} />}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        adminInfo={adminInfo}
        onSave={handleSaveProfile}
      />
    </>
  );
};

export default AdminLayout;
