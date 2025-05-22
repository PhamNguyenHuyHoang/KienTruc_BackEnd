// src/pages/student/StudentHistory.js
import React, { useState, useEffect, useMemo } from "react";
import { api, getUserInfoFromToken } from "../../api/axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import {
  History,
  Loader2,
  AlertCircle,
  Filter,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Sigma,
  CheckCircle,
  XCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "../../lib/utils";

const ITEMS_PER_PAGE = 10;

const StudentHistory = () => {
  const [history, setHistory] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "semester",
    direction: "descending",
  });
  const [maSinhVien, setMaSinhVien] = useState(null);

  useEffect(() => {
    const studentInfo = getUserInfoFromToken();
    if (studentInfo?.username) setMaSinhVien(studentInfo.username);
    else {
      setError("Lỗi: Không thể xác thực người dùng.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!maSinhVien) return;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/dangkyhocphan/sinhvien/me`);
        const data = response.data || [];
        const historyData = data.map((item, index) => {
          const semesters = ["2024-1", "2023-2", "2023-1", "2022-2"];
          const statuses = ["Đã qua", "Đang học", "Trượt", "Đã hủy"];
          const grades = ["A", "B+", "B", "C+", "C", "D+", "D", "F", null];
          const credits = [2, 3, 4];

          const semester = item.hocKy || semesters[index % semesters.length];
          const status =
            item.trangThai ||
            (semester === "2024-1"
              ? "Đang học"
              : statuses[index % statuses.length]);
          let grade = item.diemChu ?? null;
          if (!grade && status === "Đã qua")
            grade = grades[index % (grades.length - 1)];
          if (status === "Trượt") grade = "F";

          return {
            id: item.maDK,
            semester,
            maHocPhan: item.maLopHocPhan,
            tenHocPhan: item.tenLopHocPhan,
            soTinChi: item.soTinChi || credits[index % credits.length],
            grade,
            status,
            maMonHoc: item.maMonHoc,
            tenMonHoc: item.tenMonHoc,
            thoiGianDangKy: item.thoiGianDangKy,
          };
        });
        setHistory(historyData);
        const unique = [...new Set(historyData.map((x) => x.semester))].sort(
          (a, b) => b.localeCompare(a)
        );
        setSemesters(unique);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [maSinhVien]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    else if (sortConfig.key === key && sortConfig.direction === "descending") {
      key = "semester";
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getStatusVariant = (status) => {
    const val = status?.toLowerCase();
    if (val?.includes("đã qua") || val?.includes("pass")) return "success";
    if (val?.includes("đang học")) return "info";
    if (val?.includes("trượt") || val === "f") return "destructive";
    if (val?.includes("đã hủy")) return "outline";
    return "secondary";
  };

  const filtered = useMemo(() => {
    let result = [...history];
    if (selectedSemester !== "all")
      result = result.filter((x) => x.semester === selectedSemester);
    if (sortConfig.key) {
      result.sort((a, b) => {
        let va = a[sortConfig.key],
          vb = b[sortConfig.key];
        if (va == null && vb == null) return 0;
        if (va == null) return sortConfig.direction === "ascending" ? -1 : 1;
        if (vb == null) return sortConfig.direction === "ascending" ? 1 : -1;
        if (sortConfig.key === "grade") {
          const gradeOrder = {
            "A+": 10,
            A: 9,
            "B+": 8,
            B: 7,
            "C+": 6,
            C: 5,
            "D+": 4,
            D: 3,
            F: 1,
          };
          va = gradeOrder[va] ?? -1;
          vb = gradeOrder[vb] ?? -1;
        }
        const compare =
          typeof va === "number"
            ? va - vb
            : String(va).localeCompare(String(vb));
        return sortConfig.direction === "ascending" ? compare : -compare;
      });
    }
    return result;
  }, [history, selectedSemester, sortConfig]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageData = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [currentPage, filtered]
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSemester, sortConfig]);

  const summary = useMemo(() => {
    let pass = 0,
      passCourses = 0,
      failCourses = 0,
      ongoing = 0;
    history.forEach((x) => {
      const c = x.soTinChi || 0;
      const s = x.status?.toLowerCase();
      const g = x.grade;
      if ((s?.includes("đã qua") || s?.includes("pass")) && g !== "F") {
        pass += c;
        passCourses++;
      } else if (s?.includes("trượt") || g === "F") failCourses++;
      else if (s?.includes("đang học")) ongoing++;
    });
    return { pass, passCourses, failCourses, ongoing };
  }, [history]);
  if (loading && !maSinhVien)
    return <div className="p-4">Đang xác thực...</div>;
  if (loading)
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" /> Đang tải lịch sử...
      </div>
    );
  if (error)
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-6 w-6" />
              Lịch sử Đăng ký & Kết quả
            </CardTitle>
            <CardDescription>
              Theo dõi trạng thái các học phần đã học. Một số dữ liệu có thể là
              placeholder nếu API chưa đủ.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="semester-filter">
              <Filter className="h-4 w-4 mr-1" />
              Học kỳ:
            </Label>
            <Select
              value={selectedSemester}
              onValueChange={setSelectedSemester}
            >
              <SelectTrigger className="w-36" id="semester-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {semesters.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "semester",
                "maHocPhan",
                "tenHocPhan",
                "soTinChi",
                "grade",
                "status",
              ].map((key) => (
                <TableHead
                  key={key}
                  onClick={() => requestSort(key)}
                  className="cursor-pointer"
                >
                  <Button variant="ghost" size="sm">
                    {key.toUpperCase()}
                    {sortConfig.key === key &&
                      (sortConfig.direction === "ascending" ? (
                        <SortAsc className="ml-1 w-3 h-3" />
                      ) : (
                        <SortDesc className="ml-1 w-3 h-3" />
                      ))}
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.semester}</TableCell>
                <TableCell>{row.maHocPhan}</TableCell>
                <TableCell>{row.tenHocPhan}</TableCell>
                <TableCell className="text-center">{row.soTinChi}</TableCell>
                <TableCell
                  className={cn(
                    "text-center font-bold",
                    row.grade === "F" && "text-red-500"
                  )}
                >
                  {row.grade}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(row.status)}>
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between flex-wrap gap-4">
        <div className="text-xs text-muted-foreground grid grid-cols-2 sm:flex gap-2">
          <span className="flex items-center gap-1">
            <Sigma className="h-3 w-3" />
            TC: <strong>{summary.pass}</strong>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Qua: <strong>{summary.passCourses}</strong>
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-blue-500" />
            Đang: <strong>{summary.ongoing}</strong>
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            Trượt: <strong>{summary.failCourses}</strong>
          </span>
        </div>
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    onClick={() => setCurrentPage(p)}
                    isActive={currentPage === p}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardFooter>
    </Card>
  );
};

export default StudentHistory;
