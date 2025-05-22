// src/pages/student/StudentDashboardContent.js
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { BookCopy, Clock, Smile, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { format, parseISO, isAfter, differenceInSeconds } from "date-fns";
import { vi } from "date-fns/locale";
import GlassCard from "../../components/ui/GlassCard";
import { motion } from "framer-motion";
import ProgressTrackerCard from "../../components/ProgressTrackerCard";

// Mẫu màu cho PieChart
const PIE_COLORS = [
  "#60a5fa",
  "#34d399",
  "#facc15",
  "#f87171",
  "#a78bfa",
  "#f472b6",
];

const StudentDashboardContent = () => {
  // === state chung ===
  const [dashboardData, setDashboardData] = useState({
    totalCredits: 0,
    registeredCourses: [],
    nextClass: null,
    notifications: [],
  });
  const [tinChiData, setTinChiData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [userInfo, setUserInfo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // tính “còn bao lâu”
  const timeAgo = (targetDate) => {
    if (!targetDate) return "";
    const now = new Date();
    const seconds = differenceInSeconds(targetDate, now);
    if (seconds <= 0) return "Đã bắt đầu";
    const days = Math.floor(seconds / 86400);
    if (days >= 1) return `sau ${days} ngày`;
    const hours = Math.floor(seconds / 3600);
    if (hours >= 1) return `sau ${hours} giờ`;
    const minutes = Math.floor(seconds / 60);
    if (minutes >= 1) return `sau ${minutes} phút`;
    return `sau ${Math.floor(seconds)} giây`;
  };

  // xác định timestamp buổi học kế tiếp
  const calculateNextClassTimestamps = (thuStr, tietBatDau, tietKetThuc) => {
    const dayMap = {
      "Thứ 2": 1,
      "Thứ 3": 2,
      "Thứ 4": 3,
      "Thứ 5": 4,
      "Thứ 6": 5,
      "Thứ 7": 6,
      "Chủ Nhật": 0,
    };
    const days = thuStr.split(",").map((d) => d.trim());
    const now = new Date();
    let earliest = null;

    days.forEach((day) => {
      const w = dayMap[day];
      if (w == null) return;
      const sessionHour = 7 + Math.floor((parseInt(tietBatDau) - 1) * 0.83);
      let next = new Date(now);
      let diff = (w - now.getDay() + 7) % 7;
      if (diff === 0 && now.getHours() >= sessionHour) diff = 7;
      next.setDate(now.getDate() + diff);
      next.setHours(sessionHour, 0, 0, 0);
      if (!earliest || isAfter(earliest, next)) earliest = next;
    });
    return earliest;
  };

  // hàm load toàn bộ dashboard
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 3 API song song
      const [userRes, regRes, schedRes] = await Promise.all([
        api.get("/sinhvien/me"),
        api.get("/dangkyhocphan/sinhvien/me"),
        api.get("/dangkyhocphan/lichhoc/me"),
      ]);

      // user
      const u = userRes.data;
      setUserInfo(u);

      // đăng ký
      const regs = Array.isArray(regRes.data) ? regRes.data : [];
      const regCourses = regs.map((dk) => ({
        id: dk.maDK,
        maMonHoc: dk.maMonHoc,
        tenMonHoc: dk.tenMonHoc || "",
        maLopHocPhan: dk.maLopHocPhan,
        soTinChi: dk.soTinChi || 0,
      }));
      const totalCredits = regCourses.reduce((s, c) => s + c.soTinChi, 0);

      // lịch học
      let nextClass = null;
      let earliest = null;
      (Array.isArray(schedRes.data) ? schedRes.data : []).forEach((s) => {
        const ts = calculateNextClassTimestamps(
          s.thu,
          s.tietBatDau,
          s.tietKetThuc
        );
        if (ts && isAfter(ts, new Date())) {
          if (!earliest || isAfter(earliest, ts)) {
            earliest = ts;
            const start = format(ts, "HH:mm");
            const end = format(
              new Date(
                ts.getTime() +
                  (parseInt(s.tietKetThuc) - parseInt(s.tietBatDau) + 1) *
                    45 *
                    60000
              ),
              "HH:mm"
            );
            nextClass = {
              subject: `${s.tenMonHoc} (${s.maLopHocPhan})`,
              time: `${s.thu}, ${start} - ${end}`,
              room: s.diaDiem,
              timestamp: ts,
            };
          }
        }
      });

      // mock notifications
      const mockNoti = [
        {
          id: 1,
          type: "info",
          message: "Chúc bạn có một ngày học tập hiệu quả!",
        },
        {
          id: 2,
          type: "warning",
          message: "Bạn chưa đăng ký đủ tín chỉ học kỳ này.",
          details: "Hãy bổ sung thêm môn học để đảm bảo tiến độ.",
        },
      ];

      setDashboardData({
        totalCredits,
        registeredCourses: regCourses,
        nextClass,
        notifications: mockNoti,
      });
      setNotifications(mockNoti);
    } catch (err) {
      console.error("API Error:", err.message);
      setError(
        err.message.includes("timeout")
          ? "Server không phản hồi. Vui lòng thử lại."
          : "Không thể tải dữ liệu dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // fetch tinChiData sau khi userInfo có mã sinh viên
  useEffect(() => {
    if (!userInfo?.maSinhVien) return;
    api
      .get("/dangkyhocphan/sinhvien/me/tinchi-theo-monhoc")
      .then((res) => setTinChiData(res.data || []))
      .catch(() => {
        /* lỗi biểu đồ thì không block */
      });
  }, [userInfo]);

  // auto dismiss notification sau 30s
  useEffect(() => {
    const timers = notifications.map((n) =>
      setTimeout(() => {
        setNotifications((prev) => prev.filter((x) => x.id !== n.id));
      }, 30000)
    );
    return () => timers.forEach(clearTimeout);
  }, [notifications]);

  // mount → fetchDashboard
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // === FULL-PAGE ERROR ===
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6">
        <Card className="max-w-md">
          <CardHeader className="bg-red-600 text-white p-4 rounded-t">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              <CardTitle>Không thể tải dữ liệu</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-gray-700">
            <CardDescription>{error}</CardDescription>
          </CardContent>
          <CardFooter className="flex justify-end p-4 rounded-b">
            <Button variant="outline" onClick={fetchDashboard}>
              Thử lại
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // === LOADING ===
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 animate-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-6 md:gap-10"
      >
        {notifications.length > 0 && (
          <div className="grid gap-3">
            {notifications.map((noti) => (
              <GlassCard
                key={noti.id}
                className={`flex items-start gap-3 p-4 border-l-4 rounded-xl shadow-sm ${
                  noti.type === "warning"
                    ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/40"
                    : noti.type === "info"
                    ? "border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30"
                    : noti.type === "success"
                    ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/40"
                    : "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30"
                }`}
              >
                <div className="mt-1 text-xl">
                  {noti.type === "warning"
                    ? "⚠️"
                    : noti.type === "info"
                    ? "🧠"
                    : "😊"}
                </div>
                <p className="text-sm font-medium leading-snug">
                  {noti.message}
                </p>
                {noti.details && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                    {noti.details}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thông tin sinh viên chiếm 2/3 chiều rộng */}
          <GlassCard className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-blue-700 flex items-center gap-2">
                👨‍🎓 Thông tin Sinh viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-14 w-14 border shadow-md">
                  <AvatarImage
                    src={userInfo.avatarUrl || "/placeholder-user.jpg"}
                    alt="avatar"
                  />
                  <AvatarFallback>
                    {userInfo.hoTen?.charAt(0)?.toUpperCase() ?? "SV"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-2xl font-bold text-black dark:text-white">
                    {userInfo.hoTen}
                  </div>
                  <p className="text-sm italic text-muted-foreground">
                    Mã số sinh viên: <strong>{userInfo.maSinhVien}</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-[15px] text-gray-800 dark:text-gray-200">
                <p>
                  <span className="mr-2">📧</span> <strong>Email:</strong>{" "}
                  {userInfo.email}
                </p>
                <p>
                  <span className="mr-2">🚻</span> <strong>Giới tính:</strong>{" "}
                  {userInfo.gioiTinh || "---"}
                </p>
                <p>
                  <span className="mr-2">🎂</span> <strong>Ngày sinh:</strong>{" "}
                  {userInfo.ngaySinh
                    ? format(parseISO(userInfo.ngaySinh), "dd/MM/yyyy", {
                        locale: vi,
                      })
                    : "---"}
                </p>
                <p>
                  <span className="mr-2">📍</span> <strong>Nơi sinh:</strong>{" "}
                  {userInfo.noiSinh || "---"}
                </p>
                <p>
                  <span className="mr-2">🏫</span> <strong>Lớp học:</strong>{" "}
                  {userInfo.lopHoc || "---"}
                </p>
                <p>
                  <span className="mr-2">🖥️</span> <strong>Ngành:</strong>{" "}
                  {userInfo.tenNganh || "---"}
                </p>

                <p>
                  <span className="mr-2">📆</span> <strong>Khóa học:</strong>{" "}
                  {userInfo.khoaHoc || "---"}
                </p>
                <p>
                  <span className="mr-2">📖</span>{" "}
                  <strong>Loại hình đào tạo:</strong>{" "}
                  {userInfo.loaiHinhDaoTao || "---"}
                </p>
                <p>
                  <span className="mr-2">🎓</span> <strong>Bậc đào tạo:</strong>{" "}
                  {userInfo.bacDaoTao || "---"}
                </p>
              </div>

              <div className="mt-6 text-right">
                <Button
                  variant="default"
                  size="lg"
                  className="mt-2 text-base px-6 py-2 bg-blue-500 hover:bg-blue-700 transition-colors duration-300"
                  asChild
                >
                  <Link to="/pages/student/profile">✏️ Xem / Sửa hồ sơ</Link>
                </Button>
              </div>
            </CardContent>
          </GlassCard>

          {/* Hành động nhanh */}
          <GlassCard className="lg:col-span-1 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-blue-700">
                ⚡ Hành động nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg px-6 py-4 justify-start gap-3"
                asChild
              >
                <Link to="/pages/student/schedule">
                  📅 <span>Xem lịch hôm nay</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg px-6 py-4 justify-start gap-3"
                asChild
              >
                <Link to="/pages/student/register-courses">
                  📘 <span>Đăng ký học phần</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg px-6 py-4 justify-start gap-3"
                asChild
              >
                <Link to="/pages/student/profile">
                  👤 <span>Hồ sơ cá nhân</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg px-6 py-4 justify-start gap-3"
                asChild
              >
                <Link to="/pages/student/history">
                  🕘 <span>Lịch sử đăng ký</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg px-6 py-4 justify-start gap-3"
                asChild
              >
                <Link to="/pages/student/change-password">
                  🔑 <span>Đổi mật khẩu</span>
                </Link>
              </Button>
            </CardContent>
          </GlassCard>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <GlassCard className="border-primary shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-blue-700">
                📅 Buổi học kế tiếp
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.nextClass ? (
                <>
                  <div
                    className="text-xl font-semibold truncate"
                    title={dashboardData.nextClass.subject}
                  >
                    {dashboardData.nextClass.subject}
                  </div>
                  <p className="text-base text-primary font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1" />{" "}
                    {dashboardData.nextClass.time}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phòng: {dashboardData.nextClass.room}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 italic">
                    ({timeAgo(dashboardData.nextClass.timestamp)})
                  </p>

                  {/* Căn nút Xem lịch đầy đủ sang phải */}
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-base px-6 py-2 bg-blue-500 hover:bg-blue-700 transition-colors duration-300"
                      asChild
                    >
                      <Link to="/pages/student/schedule">Xem lịch đầy đủ</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-base text-muted-foreground italic mt-2">
                  Không có lịch học nào sắp diễn ra.
                </p>
              )}
            </CardContent>
          </GlassCard>

          {/* TIẾN ĐỘ HỌC TẬP */}
          <ProgressTrackerCard />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Các môn học đã đăng ký */}
          <GlassCard className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-blue-700">
                📚 Các môn học đã đăng ký
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <span className="inline-flex items-center gap-1 font-medium text-blue-700">
                  🧾 {dashboardData.registeredCourses.length} môn học
                </span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="inline-flex items-center gap-1 font-medium text-green-600">
                  🎓 {dashboardData.totalCredits} tín chỉ
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.registeredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {dashboardData.registeredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between gap-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col text-sm font-medium text-blue-800 card-class">
                        <span className="font-semibold text-blue-800 break-words">
                          {course.maMonHoc} – {course.tenMonHoc}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          🎓 {course.soTinChi} tín chỉ | 🏫 Lớp:{" "}
                          {course.maLopHocPhan}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-muted-foreground italic">
                  Bạn chưa đăng ký môn học nào trong học kỳ này.
                </p>
              )}
            </CardContent>
          </GlassCard>

          {/* Biểu đồ tín chỉ */}
          <GlassCard className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-blue-700">
                📊 Biểu đồ tín chỉ theo môn học đã đăng ký
              </CardTitle>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
              {loading ? (
                <p className="italic text-sm text-muted-foreground">
                  Đang tải dữ liệu biểu đồ...
                </p>
              ) : tinChiData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tinChiData}
                      dataKey="soTinChi"
                      nameKey="tenMonHoc"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {tinChiData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#60a5fa",
                              "#34d399",
                              "#facc15",
                              "#f87171",
                              "#a78bfa",
                              "#f472b6",
                            ][index % 6]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Không có dữ liệu để hiển thị biểu đồ.
                </p>
              )}
            </CardContent>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboardContent;
