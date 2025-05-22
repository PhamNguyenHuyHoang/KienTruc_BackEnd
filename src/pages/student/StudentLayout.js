import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { api, getUserInfoFromToken } from "../../api/axios";
import {
  LayoutDashboard,
  BookMarked,
  ClipboardCheck,
  CalendarDays,
  User,
  LogOut,
  Menu,
  GraduationCap,
  Settings,
  LifeBuoy,
  Loader2,
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
import PageTransitionWrapper from "../../components/PageTransitionWrapper";
import ChatBot from "../../components/ChatBot";

const NAV_ITEMS = [
  { to: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "courses", icon: BookMarked, label: "Môn học" },
  { to: "register-courses", icon: ClipboardCheck, label: "Đăng ký HP" },
  { to: "schedule", icon: CalendarDays, label: "Lịch học" },
  { to: "chuongtrinhkhung", icon: BookMarked, label: "Chương trình khung" },
];

const StudentNavLink = ({ to, icon: Icon, children, className }) => {
  const location = useLocation();
  const isActive =
    to === "dashboard"
      ? location.pathname === "/pages/student" ||
        location.pathname === "/pages/student/" ||
        location.pathname === "/pages/student/dashboard"
      : location.pathname.startsWith(`/pages/student/${to}`);

  const href = to === "dashboard" ? "/pages/student" : `/pages/student/${to}`;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4" />} {children}
    </Link>
  );
};

const StudentLayout = () => {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [errorInfo, setErrorInfo] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const openChat = () => setShowChat(true);
  const closeChat = () => setShowChat(false);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const tokenInfo = getUserInfoFromToken();
        const maSinhVien = tokenInfo?.username;
        if (!maSinhVien) return handleLogout();
        const response = await api.get(`/sinhvien/me`);
        setStudentInfo(response.data);
      } catch (error) {
        setErrorInfo("Không thể tải thông tin người dùng.");
        console.error(error);
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchStudentInfo();
  }, []);

  useEffect(() => {
    if (studentInfo) {
      console.log("🎓 Student info:", studentInfo);
    }
  }, [studentInfo]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const studentName = studentInfo?.hoTen?.trim()
    ? studentInfo.hoTen
    : "Sinh viên";

  const studentAvatarFallback =
    studentInfo?.hoTen?.charAt(0)?.toUpperCase() ?? "SV";

  return (
    <>
      <div className="flex h-screen flex-col bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 md:px-6 bg-white border-b shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              to="/pages/student"
              className="flex items-center gap-2 text-lg font-bold text-blue-700"
            >
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <span className="hidden sm:inline">Student Portal</span>
            </Link>
            <nav className="hidden md:flex gap-1">
              {NAV_ITEMS.map((item) => (
                <StudentNavLink key={item.to} to={item.to} icon={item.icon}>
                  {item.label}
                </StudentNavLink>
              ))}
            </nav>
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-1 mt-4">
                <Link
                  to="/pages/student"
                  className="flex items-center gap-2 text-lg font-semibold mb-3"
                >
                  <GraduationCap className="h-5 w-5 text-blue-600" /> Student
                  Portal
                </Link>
                {NAV_ITEMS.map((item) => (
                  <StudentNavLink key={item.to} to={item.to} icon={item.icon}>
                    {item.label}
                  </StudentNavLink>
                ))}
                <StudentNavLink to="profile" icon={User}>
                  Hồ sơ
                </StudentNavLink>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Avatar + Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full p-0 w-10 h-10 ring-1 ring-gray-300 hover:ring-blue-400 transition-all"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={studentInfo?.avatarUrl || "/placeholder-user.jpg"}
                    alt={studentName}
                  />

                  <AvatarFallback className="bg-blue-100 text-blue-800 font-bold text-sm">
                    {loadingInfo ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      studentAvatarFallback
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 mt-2 p-2 rounded-lg shadow-lg border bg-white"
            >
              <DropdownMenuLabel className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-900">
                  {loadingInfo ? "Đang tải..." : studentName}
                </span>
                {studentInfo?.email && (
                  <span className="text-xs text-gray-500">
                    {studentInfo.email}
                  </span>
                )}
                {errorInfo && (
                  <span className="text-xs text-red-500">{errorInfo}</span>
                )}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link to="profile" className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-600" />
                  <span>Thông tin cá nhân</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  to="change-password"
                  className="flex items-center gap-2 text-sm"
                >
                  <LifeBuoy className="h-4 w-4 text-gray-600" />
                  <span>Đổi mật khẩu</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem disabled>
                <Settings className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-400">Cài đặt</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={openChat}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <LifeBuoy className="h-4 w-4 text-gray-600" />
                <span>Hỗ trợ</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50 focus:text-red-700 focus:bg-red-100 flex items-center gap-2 text-sm cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
          <PageTransitionWrapper>
            <Outlet context={{ studentInfo, loadingInfo, errorInfo }} />
          </PageTransitionWrapper>
        </main>
      </div>

      {showChat && <ChatBot onClose={closeChat} />}
    </>
  );
};

export default StudentLayout;
