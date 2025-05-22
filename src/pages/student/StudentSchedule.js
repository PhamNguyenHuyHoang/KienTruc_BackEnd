import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { api, getUserInfoFromToken } from "../../api/axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "../../components/ui/card";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Book,
  FlaskConical,
  PencilRuler,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  eachDayOfInterval,
  getISOWeek,
  isToday,
  isBefore,
} from "date-fns";
import { cn } from "../../lib/utils";
import GlassCard from "../../components/ui/GlassCard";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Giả sử bạn có các tiết học
const timeSlots = Array.from({ length: 12 }, (_, i) => {
  const start = [
    "7:00",
    "7:55",
    "9:00",
    "9:55",
    "10:50",
    "11:45",
    "13:00",
    "13:55",
    "15:00",
    "15:55",
    "16:50",
    "17:45",
  ][i];
  const end = [
    "7:45",
    "8:40",
    "9:45",
    "10:40",
    "11:35",
    "12:30",
    "13:45",
    "14:40",
    "15:45",
    "16:40",
    "17:35",
    "18:30",
  ][i];
  return { label: `Tiết ${i + 1}`, time: `${start} - ${end}` };
});

const daysOfWeekMap = [
  { jsKey: 0, backendKey: 8, label: "Chủ Nhật" },
  { jsKey: 1, backendKey: 2, label: "Thứ 2" },
  { jsKey: 2, backendKey: 3, label: "Thứ 3" },
  { jsKey: 3, backendKey: 4, label: "Thứ 4" },
  { jsKey: 4, backendKey: 5, label: "Thứ 5" },
  { jsKey: 5, backendKey: 6, label: "Thứ 6" },
  { jsKey: 6, backendKey: 7, label: "Thứ 7" },
];

const getSessionTypeProps = (type) => {
  const t = type?.toUpperCase();
  if (t === "TN")
    return { Icon: FlaskConical, label: "TN", className: "text-purple-600" };
  if (t === "THI")
    return { Icon: PencilRuler, label: "THI", className: "text-red-600" };
  return { Icon: Book, label: "LT", className: "text-blue-600" };
};

const getColorForCourse = (courseCode = "", loaiBuoi = "") => {
  const baseColorClasses = {
    LT: "bg-sky-100 text-sky-900 border-l-4 border-sky-500",
    TN: "bg-purple-100 text-purple-900 border-l-4 border-purple-500",
    THI: "bg-red-100 text-red-900 border-l-4 border-red-500",
  };
  const fallbackColors = [
    "emerald",
    "amber",
    "rose",
    "violet",
    "fuchsia",
    "cyan",
  ];
  let hash = 0;
  for (let i = 0; i < courseCode.length; i++) {
    hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
  }
  const fallback = fallbackColors[Math.abs(hash) % fallbackColors.length];
  const fallbackClass = `bg-${fallback}-100 text-${fallback}-900 border-l-4 border-${fallback}-500`;
  return baseColorClasses[loaiBuoi] || fallbackClass;
};

const StudentSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [maSinhVien, setMaSinhVien] = useState(null);
  const [cancelDeadline, setCancelDeadline] = useState(null);
  const navigate = useNavigate();
  const renderedCells = useRef(new Set());

  useEffect(() => {
    const studentInfo = getUserInfoFromToken();
    if (studentInfo?.username) setMaSinhVien(studentInfo.username);
    else {
      setError("Lỗi: Không thể xác thực người dùng.");
      setLoading(false);
    }
  }, []);

  const fetchWithRetry = useCallback(
    async (url, params, retries = 3, timeout = 10000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeout);
          const response = await api.get(url, {
            params,
            signal: controller.signal,
          });
          clearTimeout(timer);
          return response;
        } catch (err) {
          if (attempt === retries) throw err;
          const delay = 500 * 2 ** (attempt - 1);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    },
    []
  );

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSchedule([]); // Xóa lịch cũ ngay khi bắt đầu

    try {
      // Tính ngày tuần hiện tại
      const today = addWeeks(new Date(), weekOffset);
      const startOfWeekDate = startOfWeek(today, { weekStartsOn: 1 });
      const formatted = format(startOfWeekDate, "yyyy-MM-dd");

      // Axios sẽ tự động timeout sau 5s và retry 2 lần nhờ axios-retry
      const response = await api.get(`/lichhoc/sinhvien/${maSinhVien}/tuan`, {
        params: { tuan: formatted },
      });

      const data = response.data || [];
      // Mapping dữ liệu như trước
      const mapped = data.flatMap((s) => {
        const days = s.thu
          ?.split(",")
          .map((d) => parseInt(d.match(/\d+/)?.[0]))
          .filter(Boolean);
        const batDau = parseInt(s.tietBatDau);
        const ketThuc = parseInt(s.tietKetThuc);
        if (
          !days.length ||
          isNaN(batDau) ||
          isNaN(ketThuc) ||
          batDau < 1 ||
          ketThuc > 12 ||
          batDau > ketThuc
        )
          return [];
        const loaiBuoi = s.loaiBuoi?.toUpperCase() || "LT";
        const tenMonHoc =
          s.tenMonHoc?.trim() ||
          (loaiBuoi === "THI" ? "Thi học phần" : "Không rõ");
        return days.map((thu) => ({
          id: `${s.maLopHocPhan}-${thu}-${batDau}`,
          maHocPhan: s.maLopHocPhan,
          tenMonHoc,
          thu,
          tietBatDau: batDau,
          tietKetThuc: ketThuc,
          phongHoc: s.diaDiem,
          giangVien: s.giangVien,
          loaiBuoi,
          cancelDeadline: s.cancelDeadline,
        }));
      });

      setSchedule(mapped);
      setCancelDeadline(mapped[0]?.cancelDeadline);
    } catch (err) {
      // timeout sẽ có err.code === 'ECONNABORTED'
      if (err.code === "ECONNABORTED") {
        setError("Server không phản hồi (timeout). Vui lòng thử lại.");
      }
      // 403 Forbidden: coi như không có lịch
      else if (err.response?.status === 403) {
        setError(null);
        setSchedule([]);
      }
      // Các lỗi khác
      else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [maSinhVien, weekOffset]);

  useEffect(() => {
    if (maSinhVien) fetchSchedule();
  }, [maSinhVien, fetchSchedule]);

  const currentWeekStart = useMemo(
    () => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }),
    [weekOffset]
  );
  const currentWeekEnd = useMemo(
    () => endOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }),
    [weekOffset]
  );
  const currentWeekDates = useMemo(
    () => eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd }),
    [currentWeekStart, currentWeekEnd]
  );

  const getRowSpan = (s) => (s ? s.tietKetThuc - s.tietBatDau + 1 : 1);
  renderedCells.current = new Set();
  const canCancel = isBefore(new Date(), new Date(cancelDeadline));

  const exportScheduleToExcel = () => {
    const data = schedule.map((s) => ({
      "Mã học phần": s.maHocPhan,
      "Tên môn học": s.tenMonHoc,
      "Loại buổi": s.loaiBuoi,
      Thứ: `Thứ ${s.thu === 8 ? "Chủ nhật" : s.thu}`,
      "Tiết bắt đầu": s.tietBatDau,
      "Tiết kết thúc": s.tietKetThuc,
      "Phòng học": s.phongHoc,
      "Giảng viên": s.giangVien,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LichHocTuan");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `LichHocTuan_${format(currentWeekStart, "yyyyMMdd")}.xlsx`
    );
  };
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md mx-auto border border-black-200 shadow-lg">
          <CardHeader className="flex items-center gap-2 bg-red-600 p-4 rounded-t">
            <AlertCircle className="text-black-600 w-6 h-6" />
            <CardTitle className="text-black-700 text-lg">
              Không thể tải dữ liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-gray-700">
            <p className="mb-4">
              {error.includes("timeout")
                ? "Server không phản hồi. Vui lòng kiểm tra kết nối mạng hoặc thử lại."
                : error}
            </p>
          </CardContent>
          <CardFooter className="flex justify-end p-4 rounded-b">
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setLoading(true);
                // gọi lại fetchSchedule thay vì api.get cố định
                fetchSchedule();
              }}
            >
              Thử lại
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 py-10">
      <div className="w-full max-w-6xl mx-auto mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="border-blue-500 text-blue-600 hover:bg-blue-100 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>
      <GlassCard className="w-full max-w-6xl mx-auto p-6 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-700 text-2xl font-bold">
                <CalendarDays className="h-6 w-6" /> Lịch học Cá nhân – Theo
                Tuần
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Tuần {getISOWeek(currentWeekStart)} (
                {format(currentWeekStart, "dd/MM")} -{" "}
                {format(currentWeekEnd, "dd/MM/yyyy")})
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWeekOffset((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={weekOffset === 0 ? "secondary" : "outline"}
                onClick={() => setWeekOffset(0)}
                disabled={weekOffset === 0}
              >
                Tuần hiện tại
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWeekOffset((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-sky-100 border-l-4 border-sky-500" />
              <span className="text-sm text-sky-800 font-medium">
                LT – Lý thuyết
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border-l-4 border-purple-500" />
              <span className="text-sm text-purple-800 font-medium">
                TN – Thực hành
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-l-4 border-red-500" />
              <span className="text-sm text-red-800 font-medium">
                THI – Thi
              </span>
            </div>

            {/* Nút nằm cùng hàng, đẩy về bên phải */}
            <div className="ml-auto">
              <Button
                onClick={exportScheduleToExcel}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                📥 Xuất lịch học ra Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Displaying the schedule */}
          {!schedule.length && (
            <div className="text-center text-sm text-gray-500 p-4">
              Tuần này không có lịch học.
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Đang tải lịch
              học...
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <div
                className="grid min-w-[1000px]"
                style={{
                  gridTemplateColumns: "100px repeat(7, minmax(100px, 1fr))",
                }}
              >
                {/* Weekday headers */}
                <div className="bg-muted p-2 text-center font-semibold text-sm">
                  Tiết
                </div>
                {currentWeekDates.map((date) => {
                  const jsDay = date.getDay();
                  const label =
                    daysOfWeekMap.find((d) => d.jsKey === jsDay)?.label || "";
                  return (
                    <div
                      key={jsDay}
                      className={cn(
                        "bg-muted p-2 text-center font-semibold text-sm sticky top-0 z-10",
                        isToday(date) && "bg-blue-100 text-blue-800"
                      )}
                    >
                      <div>{label}</div>
                      <div className="text-xs">{format(date, "dd/MM")}</div>
                    </div>
                  );
                })}

                {/* Time slots and sessions */}
                {timeSlots.map((slot, row) => (
                  <React.Fragment key={row}>
                    <div className="bg-muted p-1 text-center text-xs border-t border-border sticky left-0 z-10">
                      <div className="font-semibold">{slot.label}</div>
                      <div>{slot.time}</div>
                    </div>
                    {currentWeekDates.map((date) => {
                      const dow = date.getDay();
                      const backendDay = daysOfWeekMap.find(
                        (d) => d.jsKey === dow
                      )?.backendKey;
                      const cellKey = `${backendDay}-${row}`;

                      if (renderedCells.current.has(cellKey)) {
                        console.log(
                          `Skipping rendering for cellKey: ${cellKey}`
                        );
                        return null; // Prevent rendering the same cell
                      }

                      const session = schedule
                        .filter(
                          (s) =>
                            s.thu === backendDay && s.tietBatDau === row + 1
                        )
                        .sort(
                          (a, b) =>
                            a.tietKetThuc -
                            a.tietBatDau -
                            (b.tietKetThuc - b.tietBatDau)
                        )[0];

                      if (session) {
                        for (
                          let i = session.tietBatDau;
                          i <= session.tietKetThuc;
                          i++
                        ) {
                          renderedCells.current.add(`${backendDay}-${i - 1}`);
                        }

                        const span = getRowSpan(session);
                        const type = getSessionTypeProps(session.loaiBuoi);
                        const color = getColorForCourse(
                          session.maHocPhan,
                          session.loaiBuoi
                        );
                        const startTime =
                          timeSlots[session.tietBatDau - 1].time;
                        const endTime =
                          timeSlots[session.tietKetThuc - 1].time.split(
                            " - "
                          )[1];

                        return (
                          <div
                            key={session.id}
                            title={`Môn: ${session.tenMonHoc}\nMã HP: ${session.maHocPhan}\nPhòng: ${session.phongHoc}\nGiảng viên: ${session.giangVien}\nThời gian: ${startTime} - ${endTime}`}
                            style={{ gridRow: `span ${span}` }}
                            className={cn(
                              "border p-2 text-xs whitespace-pre-wrap transition duration-200 cursor-pointer",
                              color,
                              isToday(date) && "ring-2 ring-blue-500"
                            )}
                          >
                            <div
                              className="font-semibold flex items-center gap-1 truncate "
                              style={{ fontSize: "14px", whiteSpace: "normal" }}
                            >
                              <type.Icon
                                className={`h-3 w-3 ${type.className}`}
                              />{" "}
                              {session.tenMonHoc}
                            </div>
                            <div className="text-[11px]">
                              {session.maHocPhan}
                            </div>
                            <div className="mt-1 text-[10px] inline-flex items-center gap-1">
                              📍 {session.phongHoc}
                            </div>
                            <div className="text-[10px] inline-flex items-center gap-1">
                              🕓 {startTime} - {endTime}
                            </div>
                            <div className="text-[10px] inline-flex items-center gap-1">
                              👨‍🏫 {session.giangVien}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={cellKey}
                          className="border bg-white min-h-[60px]"
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </GlassCard>
    </div>
  );
};

export default StudentSchedule;
