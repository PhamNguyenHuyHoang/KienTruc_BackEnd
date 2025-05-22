import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api, getUserInfoFromToken } from "../../api/axios";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"; // hoặc từ 'your-ui-library'
import { Badge } from "../../components/ui/badge";

import {
  BookMarked,
  ClipboardCheck,
  Trash2,
  AlertCircle,
  Loader2,
  PlusCircle,
  ArrowLeft,
  Search,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Input } from "../../components/ui/input";
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
import GlassCard from "../../components/ui/GlassCard";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ✅ Chuẩn hoá học kỳ về định dạng "HK1", "HK2", "HK3"
const normalizeHocKy = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.trim().toUpperCase().startsWith("HK"))
    return value.trim().toUpperCase();
  return `HK${value}`.trim().toUpperCase();
};

const normalizeNamHoc = (value) => {
  if (!value) return "";
  return value
    .toString()
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-")
    .replace(/\s+/g, "")
    .trim();
};

// Hàm phân tích lịch học
const parseScheduleString = (scheduleString) => {
  const entries = [];
  const lines = scheduleString?.split("\n") ?? [];
  const dayMap = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 };
  const timeRegex = /(?:T|Tiết )(\d+)(?:-|–| đến |\-)(?:T|Tiết )?(\d+)/;
  const roomRegex = /P\.([^\s]+)/;

  lines.forEach((line) => {
    const dayMatch = line.match(/Thứ\s*(\d)|^(\d)|Chủ Nhật/i);

    const timeMatch = line.match(timeRegex);
    const roomMatch = line.match(roomRegex);

    const dayNum =
      dayMatch?.[1] !== undefined
        ? dayMap[dayMatch[1]]
        : dayMatch?.[2] !== undefined
        ? dayMap[dayMatch[2]]
        : dayMatch?.[0] === "Chủ Nhật"
        ? 8
        : undefined;

    if (dayNum && timeMatch) {
      entries.push({
        day: dayNum,
        start: parseInt(timeMatch[1], 10),
        end: parseInt(timeMatch[2], 10),
        room: roomMatch?.[1] || "UNKNOWN",
      });
    }
  });

  return entries;
};

// Kiểm tra xung đột thời khóa biểu
const doTimeSlotsOverlap = (slot1, slot2) => {
  if (
    !slot1 ||
    !slot2 ||
    !slot1.day ||
    !slot2.day ||
    !slot1.start ||
    !slot2.start ||
    !slot1.end ||
    !slot2.end
  )
    return false;
  return (
    slot1.day === slot2.day &&
    slot1.start <= slot2.end &&
    slot1.end >= slot2.start
  );
};

const StudentRegistration = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subjectCodeParam = searchParams.get("subjectCode");
  const [allAvailableSections, setAllAvailableSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [studentSchedule, setStudentSchedule] = useState([]);
  const [completedCourseCodes, setCompletedCourseCodes] = useState([]);
  const [subjectInfo, setSubjectInfo] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [selectedHocKy, setSelectedHocKy] = useState(null);
  const [selectedKhoaHoc, setSelectedKhoaHoc] = useState(null);
  const [loadingHocKy, setLoadingHocKy] = useState(true);
  const [hocKyDangMo, setHocKyDangMo] = useState(null);
  const [allowCancel, setAllowCancel] = useState(false);
  const [onlyShowNoConflict, setOnlyShowNoConflict] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("time");
  const ITEMS_PER_PAGE = 10;
  const [currentPageAvailable, setCurrentPageAvailable] = useState(1);

  const [namHocDangMo, setNamHocDangMo] = useState(null);

  const [availableSectionSearchTerm, setAvailableSectionSearchTerm] =
    useState("");
  const [maSinhVien, setMaSinhVien] = useState(null);

  useEffect(() => {
    const fetchUserAndSemester = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("❌ Chưa có token → dừng gọi API.");
        setFetchError("Không tìm thấy token đăng nhập.");
        setLoadingHocKy(false);
        return;
      }

      const studentInfo = getUserInfoFromToken();
      if (!studentInfo?.username) {
        console.warn("❌ Token không hợp lệ hoặc thiếu username.");
        setFetchError("Không thể xác thực người dùng.");
        setLoadingHocKy(false);
        return;
      }

      setMaSinhVien(studentInfo.username);
      try {
        const res = await api.get("/hocky/current");
        console.log("📦 API current semester response:", res.data);

        const hocKy = res.data?.hocKy;
        const namHoc = res.data?.namHoc;

        if (!hocKy || !namHoc) {
          throw new Error("API trả thiếu thông tin học kỳ.");
        }

        setHocKyDangMo(hocKy);
        setNamHocDangMo(namHoc);
        setSelectedHocKy(hocKy);
        setSelectedKhoaHoc(namHoc);

        await fetchData(hocKy, namHoc, studentInfo.username);
      } catch (err) {
        console.error("🚨 Lỗi khi gọi /api/hocky/current:", err);
        toast.error("Không thể tải học kỳ hiện tại.");
      } finally {
        setLoadingHocKy(false);
      }
    };

    // Đợi DOM ổn định và localStorage có token
    setTimeout(fetchUserAndSemester, 100); // ⏳ delay nhẹ giúp token được chắc chắn load xong
  }, []);

  useEffect(() => {
    const fetchTimePermission = async () => {
      try {
        const res = await api.get("/dangkyhocphan/time-valid");
        setAllowCancel(res.data); // true nếu trong thời gian
      } catch (err) {
        console.error("Không thể kiểm tra thời gian:", err);
      }
    };
    fetchTimePermission();
  }, []);

  useEffect(() => {
    const fetchRegistered = async () => {
      try {
        const res = await api.get("/dangkyhocphan/sinhvien/me");
        setRegisteredCourses(res.data || []);
      } catch (error) {
        setRegisteredCourses([]);
      }
    };
    fetchRegistered();
  }, []);

  useEffect(() => {
    console.log(
      "selectedHocKy:",
      selectedHocKy,
      "selectedKhoaHoc:",
      selectedKhoaHoc
    );
  }, [selectedHocKy, selectedKhoaHoc]);

  const fetchData = useCallback(
    async (hocKy, namHoc, username) => {
      if (!username) return;

      setLoading(true);
      setFetchError(null);
      setError(null);
      setConflicts([]);

      try {
        const params = {};
        if (hocKy && hocKy.trim() !== "") params.hocKy = hocKy;
        if (namHoc && namHoc.trim() !== "") params.namHoc = namHoc;

        const [
          lopHocPhanRes,
          scheduleRes,
          historyRes,
          subjectInfoRes,
          registeredRes,
        ] = await Promise.all([
          api.get("/lophocphan", { params }),
          api.get(`/dangkyhocphan/lichhoc/${username}`),
          api.get(`/dangkyhocphan/sinhvien/${username}`),
          subjectCodeParam
            ? api.get(`/monhoc/${subjectCodeParam}`)
            : Promise.resolve(null),
          api.get(`/dangkyhocphan/sinhvien/me`), // lấy lại danh sách lớp đã đăng ký
        ]);

        const mappedSections = (lopHocPhanRes.data || []).map((lhp) => {
          const thuList = lhp.thu?.split(",") || [];
          const lichHoc = thuList
            .map(
              (thu) =>
                `${thu.trim()} (T${lhp.tietBatDau}-${lhp.tietKetThuc}) P.${
                  lhp.diaDiem
                }`
            )
            .join("\n");

          return {
            id: lhp.maLopHocPhan,
            maHocPhan: lhp.maLopHocPhan,
            tenMonHoc: lhp.tenMonHoc || lhp.tenLopHocPhan,
            tenHocPhan: lhp.tenLopHocPhan,
            soTinChi: lhp.soTinChi || 0,
            lichHoc,
            giangVien: lhp.giangVien,
            soLuongMax: lhp.soLuongSinhVienToiDa,
            soLuongDaDangKy: lhp.soLuongDaDangKy,
            maMonHoc: lhp.maMonHoc,
            dieuKienTienQuyet: [],
            khoaHoc: normalizeNamHoc(lhp.namHoc),
            hocKy: normalizeHocKy(lhp.hocKy),
          };
        });

        setAllAvailableSections(mappedSections);
        setRegisteredCourses(registeredRes.data || []);

        const parsedSchedule = (scheduleRes.data || []).flatMap((s) =>
          parseScheduleString(
            `${s.thu} (T${s.tietBatDau}-${s.tietKetThuc}) P.${s.diaDiem}`
          )
        );
        // Lấy danh sách lớp đã đăng ký mà không có trong danh sách lớp mở
        const registeredExtra = (registeredRes.data || []).filter(
          (reg) =>
            !lopHocPhanRes.data.some(
              (lhp) => lhp.maLopHocPhan === reg.maLopHocPhan
            )
        );

        // Gọi API để lấy chi tiết lịch học của từng lớp bị thiếu
        const extraSchedules = await Promise.all(
          registeredExtra.map(async (reg) => {
            try {
              const res = await api.get(`/lophocphan/${reg.maLopHocPhan}`);
              const lhp = res.data;
              const thuList = lhp.thu?.split(",") || [];
              return thuList.flatMap((thu) =>
                parseScheduleString(
                  `${thu.trim()} (T${lhp.tietBatDau}-${lhp.tietKetThuc}) P.${
                    lhp.diaDiem
                  }`
                )
              );
            } catch (error) {
              return []; // nếu lỗi thì bỏ qua
            }
          })
        );

        // Gộp cả 2 loại lịch học
        const fullSchedule = [...parsedSchedule, ...extraSchedules.flat()];

        console.log("📅 Lịch học tổng hợp:", fullSchedule); // debug
        setStudentSchedule(fullSchedule);

        const completedCodes = [
          ...new Set(
            (historyRes.data || []).map((dk) => dk.maMonHoc).filter(Boolean)
          ),
        ];
        setCompletedCourseCodes(completedCodes);

        if (subjectInfoRes?.data) {
          const subjData = subjectInfoRes.data;
          setSubjectInfo({
            maMonHoc: subjData.maMonHoc,
            tenMonHoc: subjData.tenMonHoc,
            soTinChi: subjData.soTinChi,
            dieuKienTienQuyet:
              subjData.monTienQuyet
                ?.map((tq) => tq.tienQuyet?.maMonHoc)
                .filter(Boolean) || [],
          });
        }
      } catch (err) {
        setFetchError(
          err.response?.data?.message || err.message || "Không thể tải dữ liệu."
        );
      } finally {
        setLoading(false);
      }
    },
    [subjectCodeParam]
  );

useEffect(() => {
  if (maSinhVien) {
    // Nếu selectedHocKy hoặc selectedKhoaHoc là "" thì vẫn gọi fetchData, truyền chuỗi rỗng
    fetchData(selectedHocKy || "", selectedKhoaHoc || "", maSinhVien);
  }
}, [maSinhVien, selectedHocKy, selectedKhoaHoc, fetchData]);


  // Bộ lọc lớp học phần khả dụng
  const sortedAndFilteredAvailableSections = useMemo(() => {
    let filtered = [...allAvailableSections];

    if (subjectCodeParam) {
      filtered = filtered.filter((s) => s.maMonHoc === subjectCodeParam);
    }

    if (selectedHocKy && selectedHocKy.trim() !== "") {
      filtered = filtered.filter((s) => s.hocKy === selectedHocKy);
    }

    if (selectedKhoaHoc && selectedKhoaHoc.trim() !== "") {
      filtered = filtered.filter((s) => s.khoaHoc === selectedKhoaHoc);
    }

    const lowerSearch = availableSectionSearchTerm.toLowerCase();
    if (lowerSearch) {
      filtered = filtered.filter(
        (section) =>
          section.maHocPhan?.toLowerCase().includes(lowerSearch) ||
          section.tenHocPhan?.toLowerCase().includes(lowerSearch) ||
          section.giangVien?.toLowerCase().includes(lowerSearch)
      );
    }

    if (onlyShowNoConflict && studentSchedule.length > 0) {
      console.log("🎯 Bắt đầu lọc lớp không trùng lịch...");
      filtered = filtered.filter((section) => {
        const slots = parseScheduleString(section.lichHoc);
        console.log("📌 Section:", section.maHocPhan);
        console.log("→ Lịch học parse ra:", slots);

        const isAlreadyRegistered = registeredCourses.some(
          (reg) => reg.maLopHocPhan === section.maHocPhan
        );

        if (isAlreadyRegistered) return false;

        const hasConflict = slots.some((slot) =>
          studentSchedule.some((stud) => doTimeSlotsOverlap(slot, stud))
        );

        if (hasConflict) {
          console.log("❌ Trùng lịch → Loại bỏ:", section.maHocPhan);
        }

        return !hasConflict;
      });
    }

    // Thêm đoạn này vào cuối useMemo sortedAndFilteredAvailableSections
    filtered.sort((a, b) => {
      if (sortOrder === "courseCode") {
        return a.maHocPhan.localeCompare(b.maHocPhan);
      }
      if (sortOrder === "credits") {
        return b.soTinChi - a.soTinChi; // Giảm dần
      }
      if (sortOrder === "slotsRemaining") {
        const aSlots = (a.soLuongMax ?? 0) - (a.soLuongDaDangKy ?? 0);
        const bSlots = (b.soLuongMax ?? 0) - (b.soLuongDaDangKy ?? 0);
        return bSlots - aSlots; // Giảm dần theo số lượng còn lại
      }
      return 0;
    });

    return filtered;
  }, [
    allAvailableSections,
    availableSectionSearchTerm,
    subjectCodeParam,
    selectedHocKy,
    selectedKhoaHoc,
    studentSchedule,
    onlyShowNoConflict,
    sortOrder, // ✅ thêm dòng này để sắp xếp
  ]);
  const groupedAvailableSections = useMemo(() => {
    const groups = {};
    sortedAndFilteredAvailableSections.forEach((section) => {
      const key = section.maMonHoc;
      if (!groups[key]) {
        groups[key] = {
          maMonHoc: section.maMonHoc,
          tenMonHoc: section.tenMonHoc,
          soTinChi: section.soTinChi,
          sections: [],
        };
      }
      groups[key].sections.push(section);
    });
    return Object.values(groups);
  }, [sortedAndFilteredAvailableSections]);

  // Kiểm tra xung đột
  const checkConflicts = useCallback(() => {
    const newConflicts = [];
    const checkedSections = selectedSections.filter((s) => s.checked);
    if (checkedSections.length === 0) return setConflicts([]);

    const currentParsedSchedule = studentSchedule;

    checkedSections.forEach((section) => {
      const unmetPrereqs = section.dieuKienTienQuyet?.filter(
        (prereqCode) => !completedCourseCodes.includes(prereqCode)
      );
      if (unmetPrereqs?.length > 0) {
        newConflicts.push({
          sectionId: section.id,
          type: "prerequisite",
          message: `HP ${
            section.maHocPhan
          }: Chưa học môn tiên quyết (${unmetPrereqs.join(", ")})`,
        });
      }

      const sectionSchedules = parseScheduleString(section.lichHoc);
      sectionSchedules.forEach((secSlot) => {
        if (
          currentParsedSchedule.some((currSlot) =>
            doTimeSlotsOverlap(secSlot, currSlot)
          )
        ) {
          newConflicts.push({
            sectionId: section.id,
            type: "schedule",
            message: `HP ${section.maHocPhan}: Trùng lịch với lịch học hiện tại.`,
          });
        }
      });

      checkedSections.forEach((otherSelected) => {
        if (section.id !== otherSelected.id) {
          const otherSchedules = parseScheduleString(otherSelected.lichHoc);
          sectionSchedules.forEach((secSlot) => {
            if (
              otherSchedules.some((otherSlot) =>
                doTimeSlotsOverlap(secSlot, otherSlot)
              )
            ) {
              const conflictMsg = `HP ${section.maHocPhan} & ${otherSelected.maHocPhan}: Trùng lịch với nhau.`;
              if (!newConflicts.some((c) => c.message === conflictMsg)) {
                newConflicts.push({
                  sectionId: section.id,
                  type: "schedule",
                  message: conflictMsg,
                });
              }
            }
          });
        }
      });
    });

    setConflicts(newConflicts);
  }, [selectedSections, studentSchedule, completedCourseCodes]);

  useEffect(() => {
    checkConflicts();
  }, [checkConflicts]);

  const currentRegisteredCourses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return registeredCourses.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, registeredCourses]);

  const paginatedAvailableSections = useMemo(() => {
    const start = (currentPageAvailable - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredAvailableSections.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [currentPageAvailable, sortedAndFilteredAvailableSections]);

  const totalPages = Math.ceil(registeredCourses.length / ITEMS_PER_PAGE);
  const totalPagesAvailable = Math.ceil(
    sortedAndFilteredAvailableSections.length / ITEMS_PER_PAGE
  );

  // Xử lý hành động
  const handleAddSection = (sectionToAdd) => {
    const alreadyExists = selectedSections.find(
      (s) => s.maMonHoc === sectionToAdd.maMonHoc
    );
    if (alreadyExists) {
      toast.error(
        `Bạn đã chọn lớp ${alreadyExists.maHocPhan} cho môn ${alreadyExists.tenMonHoc}.`
      );
      return;
    }

    const sectionData = {
      id: sectionToAdd.id,
      maHocPhan: sectionToAdd.maHocPhan,
      tenHocPhan: sectionToAdd.tenHocPhan,
      maMonHoc: sectionToAdd.maMonHoc,
      tenMonHoc: sectionToAdd.tenMonHoc,
      soTinChi: sectionToAdd.soTinChi,
      lichHoc: sectionToAdd.lichHoc,
      dieuKienTienQuyet: sectionToAdd.dieuKienTienQuyet || [],
      checked: true,
    };

    console.log("🎯 Thêm section:", sectionData);

    setSelectedSections((prev) => [...prev, sectionData]);
  };

  const handleCheckboxChange = (sectionId) => {
    setSelectedSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId ? { ...sec, checked: !sec.checked } : sec
      )
    );
  };

  const handleRemoveSection = (sectionId) => {
    setSelectedSections((prev) => prev.filter((sec) => sec.id !== sectionId));
    setConflicts((prev) => prev.filter((c) => c.sectionId !== sectionId));
  };
  const getSectionNameById = (id, sections) => {
    const sec = sections.find((s) => s.id === id);
    return sec?.tenHocPhan || `ID ${id}`;
  };

  const handleHuyDangKy = async (maLopHocPhan) => {
    try {
      const res = await api.delete("/dangkyhocphan/huy", {
        data: { maSinhVien, maLopHocPhan },
      });

      toast.success("✅ Hủy đăng ký thành công.");
      setRegisteredCourses((prev) =>
        prev.filter((dk) => dk.maLopHocPhan !== maLopHocPhan)
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "❌ Hủy đăng ký thất bại. Vui lòng thử lại."
      );
    }
  };

  const handleRegisterSubmit = async () => {
    const sectionsToRegister = selectedSections.filter((s) => s.checked);
    if (sectionsToRegister.length === 0) {
      toast.error("Bạn chưa chọn học phần nào để đăng ký.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setConflicts([]);

    try {
      const registrationPromises = sectionsToRegister.map((section) => {
        return api
          .post("/dangkyhocphan/dangky/me", {
            maLopHocPhan: section.maHocPhan,
          })
          .then((response) => ({
            status: "fulfilled",
            sectionId: section.id,
            message: response.data,
          }))
          .catch((error) => {
            const status = error.response?.status;
            const message =
              error.response?.data?.message || "Lỗi không xác định";
            let userMessage = "";

            switch (status) {
              case 403:
                userMessage = "Không thể đăng ký: " + message;
                break;
              case 404:
                userMessage = "Không tìm thấy dữ liệu: " + message;
                break;
              case 409:
                userMessage = "Xung đột đăng ký: " + message;
                break;
              default:
                userMessage = message;
            }

            return {
              status: "rejected",
              sectionId: section.id,
              message: userMessage,
            };
          });
      });

      const results = await Promise.all(registrationPromises);
      const failed = results.filter((r) => r.status === "rejected");

      if (failed.length > 0) {
        toast.error("Một số học phần đăng ký thất bại.");
        setConflicts(
          failed.map((r) => ({
            sectionId: r.sectionId,
            type: "backend_error",
            message: `Lỗi với lớp ${getSectionNameById(
              r.sectionId,
              selectedSections
            )}: ${r.message}`,
          }))
        );
        setError(
          `Có ${failed.length} học phần không đăng ký được. Vui lòng kiểm tra lại.`
        );
      } else {
        toast.success("Đăng ký tất cả học phần thành công!");
        setSelectedSections([]);
        navigate("/pages/student/schedule");
      }
    } catch (globalError) {
      setError("Lỗi không mong muốn khi đăng ký.");
      console.error("Lỗi hệ thống:", globalError);
      toast.error("Lỗi hệ thống. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSelectedCredits = selectedSections.reduce(
    (sum, sec) => sum + (sec.soTinChi || 0),
    0
  );

  const exportRegisteredCoursesToExcel = () => {
    const data = registeredCourses.map((course) => ({
      "Mã Học Phần": course.maLopHocPhan,
      "Tên Môn Học": course.tenMonHoc,
      "Tên Lớp Học Phần": course.tenLopHocPhan,
      "Số Tín Chỉ": course.soTinChi || 0,
      "Thời Gian Đăng Ký": course.thoiGianDangKy
        ? format(parseISO(course.thoiGianDangKy), "dd/MM/yyyy HH:mm:ss")
        : "---",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DangKyHocPhan");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, `DS_DangKy_HocPhan_${new Date().getTime()}.xlsx`);
  };

  let globalIndex = 0;

  const paginatedGroupedAvailableSections = useMemo(() => {
    const start = (currentPageAvailable - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return groupedAvailableSections.slice(start, end);
  }, [groupedAvailableSections, currentPageAvailable]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 to-white px-4 py-8">
      {/* Nút Quay lại */}
      <div className="w-full max-w-6xl mx-auto mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className={`border-blue-500 text-blue-600 hover:bg-blue-100 transition-colors duration-300`}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>

      {/* Thông tin môn học */}
      {subjectInfo && (
        <GlassCard className="w-full max-w-6xl mx-auto p-6 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>
              Môn học: {subjectInfo.tenMonHoc} ({subjectInfo.maMonHoc})
            </CardTitle>
            <CardDescription>
              Số tín chỉ: {subjectInfo.soTinChi}.
              {subjectInfo.dieuKienTienQuyet?.length > 0 ? (
                <span className="ml-1">
                  Tiên quyết:{" "}
                  <strong>{subjectInfo.dieuKienTienQuyet.join(", ")}</strong>
                </span>
              ) : (
                <span className="ml-1">Không yêu cầu tiên quyết.</span>
              )}
            </CardDescription>
          </CardHeader>
        </GlassCard>
      )}

      {/* Danh sách lớp học phần khả dụng */}
      <GlassCard className="w-full max-w-6xl mx-auto p-6 bg-white/80 backdrop-blur-md border border-white/30 shadow-lg mb-6">
        <div className="mb-4">
          <p className="text-sm text-yellow-700 font-semibold mb-2">
            🎓 Học kỳ hiện tại đang mở đăng ký:
            <span className="ml-1 text-blue-700">
              <strong>{hocKyDangMo}</strong> – <strong>{namHocDangMo}</strong>
            </span>
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn học kỳ
              </label>
              <select
                value={selectedHocKy || ""}
                onChange={(e) => setSelectedHocKy(e.target.value)}
                disabled={loadingHocKy}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">-- Tất cả học kỳ --</option>

                <option value="HK1">Học kỳ 1</option>
                <option value="HK2">Học kỳ 2</option>
                <option value="HK3">Học kỳ 3</option>
              </select>
            </div>
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn khóa học
              </label>
              <select
                value={selectedKhoaHoc || ""}
                onChange={(e) => setSelectedKhoaHoc(e.target.value)}
                disabled={loadingHocKy}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">-- Tất cả khóa --</option>

                <option value="2021-2022">Khóa 2021-2022</option>
                <option value="2022-2023">Khóa 2022-2023</option>
                <option value="2023-2024">Khóa 2023-2024</option>
                <option value="2024-2025">Khóa 2024-2025</option>
              </select>
            </div>
          </div>
        </div>

        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 text-2xl font-bold">
            <BookMarked className="h-6 w-6" />
            Các Lớp Học Phần Khả Dụng
          </CardTitle>
          <CardDescription>
            {subjectCodeParam
              ? `Các lớp thuộc môn ${subjectCodeParam}. `
              : "Tất cả các lớp học phần đang mở. "}
            Chọn nút{" "}
            <PlusCircle className="inline h-3.5 w-3.5 text-muted-foreground mx-0.5" />{" "}
            để đưa vào danh sách chọn.
          </CardDescription>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
            <div className="relative w-full sm:w-2/3">
              <Search className="absolute left-2.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Lọc Mã HP, Tên HP, Giảng viên..."
                value={availableSectionSearchTerm}
                onChange={(e) => setAvailableSectionSearchTerm(e.target.value)}
                className="pl-8"
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-2 bg-blue-50 rounded-md border border-blue-200 px-3 py-2">
              <Checkbox
                id="filter-no-conflict"
                checked={onlyShowNoConflict}
                onCheckedChange={() => setOnlyShowNoConflict((prev) => !prev)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label
                htmlFor="filter-no-conflict"
                className="text-sm font-medium text-blue-700 cursor-pointer"
              >
                Hiển thị lớp không trùng lịch
              </label>
            </div>
          </div>
          <div className="mb-4">
            <div className="inline-flex items-center border border-blue-300 rounded-lg overflow-hidden shadow-sm">
              <Button
                onClick={() => setSortOrder("courseCode")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  sortOrder === "courseCode"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-700 hover:bg-blue-50"
                }`}
              >
                Mã HP
              </Button>
              <Button
                onClick={() => setSortOrder("credits")}
                className={`px-4 py-2 text-sm font-medium transition-colors border-l border-blue-300 ${
                  sortOrder === "credits"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-700 hover:bg-blue-50"
                }`}
              >
                Tín chỉ
              </Button>
              <Button
                onClick={() => setSortOrder("slotsRemaining")}
                className={`px-4 py-2 text-sm font-medium transition-colors border-l border-blue-300 ${
                  sortOrder === "slotsRemaining"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-700 hover:bg-blue-50"
                }`}
              >
                Còn lại
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Đang tải danh sách lớp học phần...</span>
            </div>
          ) : groupedAvailableSections.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-100 text-blue-900 text-base font-bold">
                    <TableHead>STT</TableHead>
                    <TableHead>Mã HP</TableHead>
                    <TableHead>Tên Môn</TableHead>
                    <TableHead>Tên Học Phần</TableHead>
                    <TableHead className="text-center">Tín chỉ</TableHead>
                    <TableHead>Lịch học</TableHead>
                    <TableHead>Giảng viên</TableHead>
                    <TableHead className="text-center">Còn lại/Max</TableHead>
                    <TableHead className="text-right">Thêm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGroupedAvailableSections.map((group) => (
                    <React.Fragment key={group.maMonHoc}>
                      <TableRow className="bg-blue-50 font-semibold">
                        <TableCell colSpan={9} className="py-2 px-4">
                          📚 {group.tenMonHoc} ({group.maMonHoc}) - Tổng số tín
                          chỉ: {group.soTinChi}
                        </TableCell>
                      </TableRow>
                      {group.sections.map((section) => {
                        globalIndex++; // tăng mỗi lần render 1 dòng
                        const isSelected = selectedSections.some(
                          (s) => s.id === section.id
                        );
                        const isMaxDefined =
                          typeof section.soLuongMax === "number";
                        const slotsRemaining = isMaxDefined
                          ? section.soLuongMax - (section.soLuongDaDangKy ?? 0)
                          : "-";
                        const isFull = isMaxDefined
                          ? slotsRemaining <= 0
                          : false;
                        const isAlreadyRegistered = registeredCourses.some(
                          (reg) => reg.maLopHocPhan === section.maHocPhan
                        );
                        const isSameSubjectSelected =
                          selectedSections.some(
                            (s) =>
                              s.maMonHoc === section.maMonHoc &&
                              s.id !== section.id
                          ) ||
                          registeredCourses.some(
                            (r) =>
                              r.maMonHoc === section.maMonHoc &&
                              r.maLopHocPhan !== section.maHocPhan
                          );

                        const isCurrentOpenSection =
                          section.hocKy === hocKyDangMo &&
                          section.khoaHoc === namHocDangMo;

                        return (
                          <TableRow
                            key={section.id}
                            className={isSelected ? "bg-muted/30" : ""}
                          >
                            <TableCell>{globalIndex}</TableCell>

                            <TableCell>{section.maHocPhan}</TableCell>
                            <TableCell>{section.tenMonHoc}</TableCell>
                            <TableCell>{section.tenHocPhan}</TableCell>
                            <TableCell className="text-center">
                              {section.soTinChi}
                            </TableCell>
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help underline decoration-dotted">
                                      {section.lichHoc.split("\n")[0]}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{section.lichHoc}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {section.giangVien}
                            </TableCell>
                            <TableCell className="text-center hidden sm:table-cell">
                              {isMaxDefined
                                ? `${slotsRemaining}/${section.soLuongMax}`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {isCurrentOpenSection ? (
                                // render nút Thêm như cũ
                                isSameSubjectSelected ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge
                                          variant="secondary"
                                          className="bg-yellow-100 text-yellow-800"
                                        >
                                          Đã chọn lớp khác
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Bạn đã chọn một lớp khác cho môn này.
                                        Hãy hủy lớp đó nếu muốn đổi.
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : isAlreadyRegistered ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge
                                          variant="secondary"
                                          className="bg-gray-200 text-gray-600"
                                        >
                                          Đã đăng ký
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Bạn đã đăng ký lớp học phần này.
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : isFull ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge variant="destructive">
                                          Lớp đã đầy
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Số lượng sinh viên đã đạt tối đa.
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <Button
                                    variant={isSelected ? "ghost" : "secondary"}
                                    size="sm"
                                    onClick={() =>
                                      isSelected
                                        ? handleRemoveSection(section.id)
                                        : handleAddSection(section)
                                    }
                                    className="h-7 px-2 group"
                                  >
                                    {isSelected ? (
                                      <Trash2 className="h-3.5 w-3.5 text-gray-700 group-hover:text-red-600 transition-colors duration-200" />
                                    ) : (
                                      <PlusCircle className="h-3.5 w-3.5 text-blue-700 group-hover:text-blue-900 transition-colors duration-200" />
                                    )}
                                  </Button>
                                )
                              ) : (
                                // Nếu không phải học kỳ mở đăng ký thì không hiện nút Thêm, có thể để trống hoặc show 1 badge info
                                <span className="text-gray-400 italic text-sm">
                                  Không mở đăng ký
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Không tìm thấy lớp học phần nào phù hợp.
            </p>
          )}

          {/* Phân trang */}
          {totalPagesAvailable > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPageAvailable((p) => Math.max(p - 1, 1))
                    }
                    disabled={currentPageAvailable === 1}
                  />
                  {[...Array(totalPagesAvailable)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPageAvailable(i + 1)}
                        isActive={currentPageAvailable === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationNext
                    onClick={() =>
                      setCurrentPageAvailable((p) =>
                        Math.min(p + 1, totalPagesAvailable)
                      )
                    }
                    disabled={currentPageAvailable === totalPagesAvailable}
                  />
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </GlassCard>

      {/* Danh sách học phần chờ đăng ký */}
      <GlassCard className="w-full max-w-6xl mx-auto p-6 bg-white/80 backdrop-blur-md border border-white/30 shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 text-2xl font-bold">
            <BookMarked className="h-6 w-6" />
            Danh Sách Học Phần Chờ Đăng Ký
          </CardTitle>
          <CardDescription>
            Nhấn chọn các học phần bạn muốn đăng ký chính thức. Kiểm tra kỹ các
            cảnh báo xung đột (nếu có).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedSections.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100 text-blue-900 text-base font-bold">
                  <TableHead>STT</TableHead>
                  <TableHead>Chọn</TableHead>
                  <TableHead>Mã HP</TableHead>
                  <TableHead>Tên Học phần</TableHead>
                  <TableHead className="text-center">TC</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Lịch học
                  </TableHead>
                  <TableHead className="text-right">Xóa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedSections.map((section, index) => {
                  const sectionConflicts = conflicts.filter(
                    (c) => c.sectionId === section.id
                  );
                  const hasConflict = sectionConflicts.length > 0;

                  return (
                    <TableRow
                      key={`selected-${section.id}`}
                      className={
                        hasConflict
                          ? "bg-destructive/10 hover:bg-destructive/15"
                          : ""
                      }
                    >
                      <TableCell>{index + 1}</TableCell> {/* ✅ Số thứ tự */}
                      <TableCell>
                        <Checkbox
                          checked={section.checked}
                          onCheckedChange={() =>
                            handleCheckboxChange(section.id)
                          }
                        />
                      </TableCell>
                      <TableCell>{section.maHocPhan}</TableCell>
                      <TableCell>{section.tenHocPhan}</TableCell>
                      <TableCell className="text-center">
                        {section.soTinChi}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {section.lichHoc}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 group"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-gray-700 group-hover:text-red-600 transition-colors duration-200" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border border-gray-200 shadow-lg rounded-md p-6 max-w-md mx-auto">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-lg font-semibold text-gray-800">
                                Xác nhận xóa?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-sm text-gray-600 mt-2">
                                Bạn chắc chắn muốn xóa học phần "
                                <strong>{section.tenHocPhan}</strong>" (
                                {section.maHocPhan}) khỏi danh sách đăng ký?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4 flex justify-end space-x-3">
                              <AlertDialogCancel className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors focus:outline-none">
                                Hủy
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveSection(section.id)}
                                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors focus:outline-none"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Chưa có học phần nào được chọn.
            </p>
          )}

          {(conflicts.length > 0 || error) && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {error ? "Lỗi Đăng ký" : "Cảnh báo Xung đột / Lỗi!"}
              </AlertTitle>
              <AlertDescription>
                {error && <p className="mb-2 font-medium">{error}</p>}
                {conflicts.length > 0 && (
                  <>
                    <p className="mb-1 text-xs">
                      Vui lòng kiểm tra các vấn đề sau:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      {[...new Set(conflicts.map((c) => c.message))].map(
                        (msg, i) => (
                          <li key={i}>{msg}</li>
                        )
                      )}
                    </ul>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t pt-4 gap-4">
          <div className="text-sm font-medium">
            Tổng số tín chỉ đã chọn:{" "}
            <span className="text-primary font-bold">
              {totalSelectedCredits}
            </span>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={
                  isSubmitting ||
                  conflicts.length > 0 ||
                  selectedSections.filter((s) => s.checked).length === 0
                }
                className={`w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${
          isSubmitting
            ? "bg-blue-300 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
        }
        ${
          conflicts.length > 0 ||
          selectedSections.filter((s) => s.checked).length === 0
            ? "opacity-50 cursor-not-allowed"
            : ""
        }
      `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Xác nhận Đăng ký
                  </>
                )}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-white border border-gray-200 shadow-lg rounded-md p-6 max-w-md mx-auto">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-semibold text-gray-800">
                  Xác nhận đăng ký
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-2">
                  Bạn có chắc chắn muốn <strong>đăng ký</strong> các học phần đã
                  chọn? Vui lòng kiểm tra lịch học và tín chỉ trước khi tiếp
                  tục.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4 flex justify-end space-x-3">
                <AlertDialogCancel className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRegisterSubmit}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Xác nhận
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </GlassCard>
      {/* Danh sách học phần đã đăng ký */}
      <GlassCard className="w-full max-w-6xl mx-auto p-6 bg-white/80 backdrop-blur-md border border-white/30 shadow-lg mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 text-2xl font-bold">
            <ClipboardCheck className="h-6 w-6" />
            Danh sách Học phần Đã Đăng Ký
          </CardTitle>
          <CardDescription>
            Đây là các học phần bạn đã đăng ký chính thức trong hệ thống.
          </CardDescription>
        </CardHeader>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={exportRegisteredCoursesToExcel}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            📥 Xuất danh sách ra Excel
          </Button>
        </div>

        <CardContent>
          {currentRegisteredCourses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100 text-blue-900 text-base font-bold">
                  <TableHead>STT</TableHead>
                  <TableHead>Mã HP</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Lớp học phần</TableHead>
                  <TableHead className="text-center">Số tín chỉ</TableHead>
                  <TableHead className="text-center">
                    Thời gian đăng ký
                  </TableHead>
                  <TableHead className="text-right">Hủy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRegisteredCourses.map((dk, index) => (
                  <TableRow key={`registered-${index}`}>
                    <TableCell>
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </TableCell>
                    <TableCell>{dk.maLopHocPhan}</TableCell>
                    <TableCell>{dk.tenLopHocPhan}</TableCell>
                    <TableCell>{dk.tenMonHoc}</TableCell>
                    <TableCell className="text-center">
                      {dk.soTinChi || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {dk.thoiGianDangKy
                        ? format(
                            parseISO(dk.thoiGianDangKy),
                            "dd/MM/yyyy HH:mm:ss"
                          )
                        : "---"}
                    </TableCell>
                    <TableCell className="text-right">
                      {allowCancel ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 group"
                            >
                              <Trash2 className="h-4 w-4 text-gray-800 group-hover:text-red-600 transition-colors duration-200" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border border-gray-200 shadow-lg rounded-md p-6 max-w-md mx-auto">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-lg font-semibold text-gray-800">
                                Xác nhận hủy đăng ký?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-sm text-gray-600 mt-2">
                                Bạn có chắc muốn <strong>hủy đăng ký</strong>{" "}
                                học phần{" "}
                                <span className="text-blue-600 font-medium">
                                  {dk.tenMonHoc}
                                </span>{" "}
                                ({dk.maLopHocPhan}) không?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4 flex justify-end space-x-3">
                              <AlertDialogCancel className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md">
                                Hủy bỏ
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleHuyDangKy(dk.maLopHocPhan)}
                                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
                              >
                                Xác nhận hủy
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Ngoài thời gian hủy
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Bạn chưa đăng ký học phần nào.
            </p>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  />
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </GlassCard>
    </div>
  );
};

export default StudentRegistration;
