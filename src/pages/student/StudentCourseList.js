// src/pages/student/StudentCourseList.js
import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../api/axios";
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
import { Input } from "../../components/ui/input";
import {
  BookMarked,
  Search,
  Loader2,
  AlertCircle,
  Eye,
  Info,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { useNavigate } from "react-router-dom";
import GlassCard from "../../components/ui/GlassCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../components/ui/tooltip";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ArrowLeft } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const StudentCourseList = () => {
  const navigate = useNavigate();

  // === GLOBAL STATE FOR LOADING / ERROR ===
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === DATA STATES ===
  const [availableCourses, setAvailableCourses] = useState([]);
  const [lopHocPhanCounts, setLopHocPhanCounts] = useState({});
  const [monHocDaDangKy, setMonHocDaDangKy] = useState([]);

  // === FILTER / PAGINATION STATES ===
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTinChi, setFilterTinChi] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Hàm FETCH courses + counts
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      // timeout & retry đã cấu hình trong api instance
      const [monHocRes, lopHpRes] = await Promise.all([
        api.get("/monhoc"),
        api.get("/lophocphan"),
      ]);

      // Xử lý data trả về
      let monHocData = [];
      if (Array.isArray(monHocRes.data)) {
        monHocData = monHocRes.data;
      } else if (Array.isArray(monHocRes.data.monHoc)) {
        monHocData = monHocRes.data.monHoc;
      } else if (Array.isArray(monHocRes.data.data)) {
        monHocData = monHocRes.data.data;
      } else {
        throw new Error("Dữ liệu môn học không hợp lệ.");
      }

      // Tính counts
      const lopHpArray = lopHpRes.data || [];
      const counts = lopHpArray.reduce((acc, lhp) => {
        if (lhp.maMonHoc) {
          acc[lhp.maMonHoc] = (acc[lhp.maMonHoc] || 0) + 1;
        }
        return acc;
      }, {});
      setLopHocPhanCounts(counts);

      // Map vào courses
      const mapped = monHocData.map((mh) => ({
        id: mh.maMonHoc,
        maMonHoc: mh.maMonHoc,
        tenMonHoc: mh.tenMonHoc,
        soTinChi: mh.soTinChi,
        dieuKienTienQuyet: Array.isArray(mh.monTienQuyet)
          ? mh.monTienQuyet.filter(Boolean).join(", ")
          : null,
        soLopHocPhanMo: counts[mh.maMonHoc] || 0,
      }));
      setAvailableCourses(mapped);
    } catch (err) {
      console.error("❌ fetchCourses Error:", err.message);
      setError(
        err.message.includes("timeout")
          ? "Server không phản hồi. Vui lòng thử lại."
          : err.message || "Không thể tải dữ liệu môn học."
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Hàm FETCH đăng ký của sinh viên
  const fetchDangKy = async () => {
    try {
      const res = await api.get("/sinhvien/me");
      const ds = Array.isArray(res.data.lopHocPhanDangKy)
        ? res.data.lopHocPhanDangKy.map((x) => x.maMonHoc)
        : [];
      setMonHocDaDangKy(ds);
    } catch (err) {
      console.error("❌ fetchDangKy Error:", err.message);
      setMonHocDaDangKy([]); // lỗi thì bỏ qua, không block courses
    }
  };

  // 3. Mount → gọi 2 fetch
  useEffect(() => {
    fetchCourses();
    fetchDangKy();
  }, []);

  // 6. FILTER + PAGINATION
  const filteredCourses = useMemo(() => {
    return availableCourses.filter((c) => {
      const txt = searchTerm.toLowerCase();
      const okSearch =
        c.maMonHoc.toLowerCase().includes(txt) ||
        c.tenMonHoc.toLowerCase().includes(txt);
      const okTinChi = !filterTinChi || c.soTinChi === +filterTinChi;
      return okSearch && okTinChi;
    });
  }, [availableCourses, searchTerm, filterTinChi]);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const currentTableData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);

  // 4. Full‐page error + Retry button
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
            <AlertDescription>{error}</AlertDescription>
          </CardContent>
          <CardFooter className="flex justify-end p-4 rounded-b">
            <Button variant="outline" onClick={fetchCourses}>
              Thử lại
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 5. Spinner khi đang load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleExportToExcel = () => {
    const data = filteredCourses.map((c) => ({
      "Mã MH": c.maMonHoc,
      "Tên MH": c.tenMonHoc,
      TC: c.soTinChi,
      "Tiên quyết": c.dieuKienTienQuyet || "Không",
      "Lớp HP mở": c.soLopHocPhanMo,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MonHoc");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), `MonHoc_${Date.now()}.xlsx`);
  };

  // 7. RENDER UI CHÍNH (giữ y hệt JSX gốc)
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
        {/* … phần JSX gốc của CardHeader, CardContent, CardFooter … */}
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-700 text-2xl font-bold">
                <BookMarked className="h-6 w-6" />
                Danh sách Môn học
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Các môn học được mở trong học kỳ này. Chọn "Xem HP" để xem các
                lớp học phần chi tiết.
              </CardDescription>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Tìm mã/tên môn học..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-8 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <Input
              type="number"
              min="0"
              value={filterTinChi}
              onChange={(e) => {
                setFilterTinChi(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Lọc theo tín chỉ"
              className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleExportToExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              📥 Xuất danh sách ra Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredCourses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm
                ? `Không tìm thấy môn học phù hợp với "${searchTerm}"`
                : "Hiện không có môn học nào được mở đăng ký"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã MH</TableHead>
                  <TableHead>Tên Môn học</TableHead>
                  <TableHead className="text-center">Số TC</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Tiên quyết
                  </TableHead>
                  <TableHead className="text-center hidden sm:table-cell">
                    Lớp HP mở
                  </TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTableData.map((course) => (
                  <TableRow
                    key={course.id}
                    className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {course.maMonHoc}
                    </TableCell>
                    <TableCell>{course.tenMonHoc}</TableCell>
                    <TableCell className="text-center">
                      {course.soTinChi}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {course.dieuKienTienQuyet ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help flex items-center gap-1">
                                <Info className="h-3 w-3 text-blue-500" /> Có
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cần học trước: {course.dieuKienTienQuyet}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        "Không"
                      )}
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      {course.soLopHocPhanMo > 0 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {course.soLopHocPhanMo} lớp
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-blue-500 text-blue-600 hover:bg-blue-100 transition-colors duration-300 ${
                          !course.soLopHocPhanMo
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() =>
                          navigate(
                            `/pages/student/register-courses?subjectCode=${course.maMonHoc}`
                          )
                        }
                        disabled={!course.soLopHocPhanMo}
                      >
                        Xem HP
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <CardFooter>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị <strong>{currentTableData.length}</strong> trên tổng số{" "}
              <strong>{filteredCourses.length}</strong> môn học.
            </div>
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(i + 1);
                        }}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardFooter>
      </GlassCard>
    </div>
  );
};

export default StudentCourseList;
