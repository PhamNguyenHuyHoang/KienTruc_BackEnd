// src/pages/chuongtrinh/ChuongTrinhKhungList.js
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
  Search,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import GlassCard from "../../components/ui/GlassCard";
import debounce from "lodash.debounce"; // Timlimiter

const ITEMS_PER_PAGE = 10;

const ChuongTrinhKhungList = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [hocKyFilter, setHocKyFilter] = useState("");
  const [namHocFilter, setNamHocFilter] = useState("");
  const [page, setPage] = useState(1);
  const [registeredSet, setRegisteredSet] = useState(new Set());
  const nav = useNavigate();

  useEffect(() => {
    api
      .get("/chuongtrinhkhung/me")
      .then((res) => {
        // sort by namHoc, then hocKy
        const sorted = res.data.sort((a, b) => {
          if (a.namHoc !== b.namHoc) return a.namHoc.localeCompare(b.namHoc);
          return a.maHocKy.localeCompare(b.maHocKy);
        });
        setList(sorted);
      })
      .catch((err) => setError(err.message || "Không tải được dữ liệu."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get("/dangkyhocphan/sinhvien/me")
      .then((res) => {
        // Giả sử mỗi item trả về có field maLopHocPhan
        const set = new Set(res.data.map((dk) => dk.maMonHoc));
        setRegisteredSet(set);
      })
      .catch(console.error);
  }, []);

  // filters + search
  const filtered = useMemo(() => {
    return list.filter((item) => {
      const txt = searchTerm.toLowerCase();
      const okSearch =
        item.maNganh.toLowerCase().includes(txt) ||
        item.tenMonHoc.toLowerCase().includes(txt) ||
        item.maMonHoc.toLowerCase().includes(txt);

      const okHK = hocKyFilter ? item.maHocKy === hocKyFilter : true;
      const okNH = namHocFilter ? item.namHoc === namHocFilter : true;
      return okSearch && okHK && okNH;
    });
  }, [list, searchTerm, hocKyFilter, namHocFilter]);

  // build group: { [namHoc]: { [maHocKy]: [items] } }
  const grouped = useMemo(() => {
    const out = {};
    filtered.forEach((item) => {
      out[item.namHoc] = out[item.namHoc] || {};
      out[item.namHoc][item.maHocKy] = out[item.namHoc][item.maHocKy] || [];
      out[item.namHoc][item.maHocKy].push(item);
    });
    return out;
  }, [filtered]);

  // pagination applies to whole filtered list, but we'll only show current page items
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  // tạo hàm debounced để gọi setSearchTerm
  const debouncedSearch = useMemo(
    () =>
      debounce((val) => {
        console.log("🔍 Debounced search:", val);
        setSearchTerm(val);
        setPage(1);
      }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const exportExcel = () => {
    const data = filtered.map((i) => ({
      "Mã Ngành": i.maNganh,
      "Tên Ngành": i.tenNganh,
      "Mã MH": i.maMonHoc,
      "Tên MH": i.tenMonHoc,
      HK: i.maHocKy,
      "Năm học": i.namHoc,
      TC: i.soTinChi,
      LT: i.soTietLT,
      TH: i.soTietTH,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CTKK");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), `CTKK_${Date.now()}.xlsx`);
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
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
                // gọi lại fetch data
                api
                  .get("/chuongtrinhkhung/me")
                  .then((res) => {
                    setList(res.data);
                  })
                  .catch((err) => {
                    setError(err.message || "Có lỗi xảy ra.");
                  })
                  .finally(() => setLoading(false));
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
    <div className="min-h-screen p-6 bg-blue-50">
      <div className="w-full max-w-6xl mx-auto mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => nav(-1)}
          className="border-blue-500 text-blue-600 hover:bg-blue-100 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>

      <GlassCard className="w-full max-w-6xl mx-auto p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-700 text-2xl font-bold flex items-center gap-2">
            Chương Trình Khung
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Danh sách các môn học trong chương trình khung theo ngành và học kỳ.
          </CardDescription>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="relative flex-1 max-w-xs">
              <Input
                placeholder="Tìm mã ngành, mã MH hoặc tên MH..."
                value={searchTerm}
                onChange={(e) => {
                  console.log("onChange fired:", e.target.value);
                  debouncedSearch(e.target.value);
                }}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={hocKyFilter}
              onChange={(e) => {
                setHocKyFilter(e.target.value);
                setPage(1);
              }}
              className="border p-2 rounded"
            >
              <option value="">-- Lọc học kỳ --</option>
              {Array.from(new Set(list.map((i) => i.maHocKy))).map((hk) => (
                <option key={hk} value={hk}>
                  {hk}
                </option>
              ))}
            </select>
            <select
              value={namHocFilter}
              onChange={(e) => {
                setNamHocFilter(e.target.value);
                setPage(1);
              }}
              className="border p-2 rounded"
            >
              <option value="">-- Lọc năm học --</option>
              {Array.from(new Set(list.map((i) => i.namHoc))).map((nh) => (
                <option key={nh} value={nh}>
                  {nh}
                </option>
              ))}
            </select>
            <Button
              onClick={exportExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              📥 Xuất CTK ra Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-10">
          {Object.entries(grouped).map(([namHoc, hocKyGroups]) => (
            <div key={namHoc}>
              {/* <h3 className="text-xl font-bold mt-8">Năm học {namHoc}</h3> */}

              {Object.entries(hocKyGroups).map(([hk, items]) => {
                // calculate totals
                const tcTotal = items.reduce((s, i) => s + i.soTinChi, 0);
                const ltTotal = items.reduce((s, i) => s + i.soTietLT, 0);
                const thTotal = items.reduce((s, i) => s + i.soTietTH, 0);

                return (
                  <div key={hk} className="mt-4">
                    <div className="py-2 px-4 bg-blue-200 text-blue-900 text-base font-bold">
                      Học kỳ {hk.replace(/^HK/, "")}
                    </div>
                    <Table>
                      {/* 1. Colgroup để cố định tỉ lệ/độ rộng các cột */}
                      <colgroup>
                        <col style={{ width: "5%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "45%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "5%" }} />
                      </colgroup>

                      <TableHeader className="bg-blue-400">
                        <TableRow className="bg-blue-100 text-blue-900 text-base font-bold">
                          <TableHead>STT</TableHead>
                          <TableHead>Mã Môn học</TableHead>
                          <TableHead>Tên môn học</TableHead>
                          <TableHead className="text-center">
                            Số tín chỉ
                          </TableHead>
                          <TableHead className="text-center">
                            Số tiết LT
                          </TableHead>
                          <TableHead className="text-center">
                            Số tiết TH
                          </TableHead>
                          <TableHead className="text-center">
                            Trạng thái
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {items.map((it, idx) => (
                          <TableRow key={it.maMonHoc}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{it.maMonHoc}</TableCell>
                            <TableCell>{it.tenMonHoc}</TableCell>
                            <TableCell className="text-center">
                              {it.soTinChi}
                            </TableCell>
                            <TableCell className="text-center">
                              {it.soTietLT}
                            </TableCell>
                            <TableCell className="text-center">
                              {it.soTietTH}
                            </TableCell>
                            {/* Đây là cell Trạng thái */}
                            <TableCell className="text-center">
                              {registeredSet.has(it.maMonHoc) ? (
                                <Check className="text-green-600" />
                              ) : (
                                <X className="text-red-600" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Tổng kết: vẫn phải có đúng 7 <TableCell> */}
                        <TableRow className="font-semibold bg-gray-50">
                          <TableCell colSpan={3} className="text-right">
                            Tổng học kỳ {hk}:
                          </TableCell>
                          <TableCell className="text-center">
                            {tcTotal}
                          </TableCell>
                          <TableCell className="text-center">
                            {ltTotal}
                          </TableCell>
                          <TableCell className="text-center">
                            {thTotal}
                          </TableCell>
                          {/* <TableCell />  */}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              Không có môn nào phù hợp.
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          {totalPages > 1 && (
            <div className="flex space-x-2">
              <Button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={i + 1 === page ? "default" : "outline"}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </Button>
            </div>
          )}
        </CardFooter>
      </GlassCard>
      {/* Cuối CardContent, sau khi render tất cả bảng học kỳ */}
      <div className="mt-8 p-4 bg-white border border-gray-200 rounded-md shadow-sm max-w-md mx-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Chú thích</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Check className="text-green-600 w-4 h-4 flex-shrink-0" />
            <span>Đã đăng ký</span>
          </li>
          <li className="flex items-center gap-2">
            <X className="text-red-600 w-4 h-4 flex-shrink-0" />
            <span>Chưa đăng ký</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChuongTrinhKhungList;
