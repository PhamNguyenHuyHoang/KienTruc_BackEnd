import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../api/axios";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "react-toastify";
import {
  Loader2,
  PlusCircle,
  NotebookText,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";

const AdminChuongTrinhKhung = () => {
  const [chuongTrinhKhungs, setChuongTrinhKhungs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    maNganh: "",
    tenNganh: "",
    maMonHoc: "",
    tenMonHoc: "",
    maHocKy: "",
    namHoc: "",
  });

  // Thanh tìm kiếm & bộ lọc input bạn có sẵn
  const [searchTerm, setSearchTerm] = useState("");
  const [maNganhFilter, setMaNganhFilter] = useState("");
  const [maMonHocFilter, setMaMonHocFilter] = useState("");
  const [maHocKyFilter, setMaHocKyFilter] = useState("");
  const [namHocFilter, setNamHocFilter] = useState("");

  // Thêm trạng thái sắp xếp
  const [sortField, setSortField] = useState(null); // trường đang sắp xếp
  const [sortOrder, setSortOrder] = useState("asc"); // asc hoặc desc

  const fetchChuongTrinhKhungs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/chuongtrinhkhung");
      if (Array.isArray(res.data)) {
        setChuongTrinhKhungs(res.data);
      } else {
        setChuongTrinhKhungs([]);
        toast.warn(
          "Dữ liệu chương trình khung nhận được không đúng định dạng."
        );
      }
    } catch (error) {
      toast.error("Lỗi tải danh sách chương trình khung. Vui lòng thử lại.");
      setChuongTrinhKhungs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChuongTrinhKhungs();
  }, [fetchChuongTrinhKhungs]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!form.maNganh || !form.maMonHoc || !form.maHocKy || !form.namHoc) {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
        setIsSubmitting(false);
        return;
      }
      const isDuplicate = chuongTrinhKhungs.some(
        (ctk) =>
          ctk.maNganh === form.maNganh &&
          ctk.maMonHoc === form.maMonHoc &&
          ctk.maHocKy === form.maHocKy &&
          ctk.namHoc === form.namHoc
      );
      if (isDuplicate) {
        toast.error("Chương trình khung này đã tồn tại.");
        setIsSubmitting(false);
        return;
      }

      const res = await api.post("/chuongtrinhkhung", form);
      setChuongTrinhKhungs((prev) => [res.data, ...prev]);
      setIsAddDialogOpen(false);
      toast.success("Thêm chương trình khung thành công!");
      setForm({
        maNganh: "",
        tenNganh: "",
        maMonHoc: "",
        tenMonHoc: "",
        maHocKy: "",
        namHoc: "",
      });
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(`Thêm thất bại: ${error.response.data.message}`);
      } else {
        toast.error("Thêm chương trình khung thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm đổi chiều sắp xếp khi click vào tiêu đề cột
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Lọc dữ liệu theo input tìm kiếm và bộ lọc, sau đó sắp xếp
  const filteredChuongTrinhKhungs = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return chuongTrinhKhungs
      .filter((item) => {
        return (
          (!maNganhFilter || item.maNganh === maNganhFilter) &&
          (!maMonHocFilter || item.maMonHoc === maMonHocFilter) &&
          (!maHocKyFilter || item.maHocKy === maHocKyFilter) &&
          (!namHocFilter || item.namHoc === namHocFilter) &&
          (item.maNganh.toLowerCase().includes(lowerSearchTerm) ||
            (item.tenNganh &&
              item.tenNganh.toLowerCase().includes(lowerSearchTerm)) ||
            item.maMonHoc.toLowerCase().includes(lowerSearchTerm) ||
            (item.tenMonHoc &&
              item.tenMonHoc.toLowerCase().includes(lowerSearchTerm)) ||
            item.maHocKy.toLowerCase().includes(lowerSearchTerm) ||
            item.namHoc.toLowerCase().includes(lowerSearchTerm))
        );
      })
      .sort((a, b) => {
        if (!sortField) return 0;
        const valA = a[sortField] || "";
        const valB = b[sortField] || "";
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [
    chuongTrinhKhungs,
    searchTerm,
    maNganhFilter,
    maMonHocFilter,
    maHocKyFilter,
    namHocFilter,
    sortField,
    sortOrder,
  ]);

  // Lấy danh sách unique cho dropdown lọc (giúp bạn chuyển input thành dropdown nếu muốn)
  const uniqueMaNganh = useMemo(
    () => [...new Set(chuongTrinhKhungs.map((i) => i.maNganh).filter(Boolean))],
    [chuongTrinhKhungs]
  );
  const uniqueMaMonHoc = useMemo(
    () => [
      ...new Set(chuongTrinhKhungs.map((i) => i.maMonHoc).filter(Boolean)),
    ],
    [chuongTrinhKhungs]
  );
  const uniqueMaHocKy = useMemo(
    () => [...new Set(chuongTrinhKhungs.map((i) => i.maHocKy).filter(Boolean))],
    [chuongTrinhKhungs]
  );
  const uniqueNamHoc = useMemo(
    () => [...new Set(chuongTrinhKhungs.map((i) => i.namHoc).filter(Boolean))],
    [chuongTrinhKhungs]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Quản lý Chương trình Khung
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-gray-900 dark:text-white" />

              <h1 className="font-semibold text-gray-800 dark:text-white">
                Thêm Chương Trình Khung
              </h1>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md md:max-w-lg dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                Thêm Chương Trình Khung Mới
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="maNganh" className="dark:text-gray-300">
                  Mã Ngành <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maNganh"
                  name="maNganh"
                  value={form.maNganh}
                  onChange={handleFormChange}
                  placeholder="Ví dụ: CNTT"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tenNganh" className="dark:text-gray-300">
                  Tên Ngành
                </Label>
                <Input
                  id="tenNganh"
                  name="tenNganh"
                  value={form.tenNganh}
                  onChange={handleFormChange}
                  placeholder="Tên ngành (tự động điền hoặc chọn)"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="maMonHoc" className="dark:text-gray-300">
                  Mã Môn Học <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maMonHoc"
                  name="maMonHoc"
                  value={form.maMonHoc}
                  onChange={handleFormChange}
                  placeholder="Ví dụ: CS101"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tenMonHoc" className="dark:text-gray-300">
                  Tên Môn Học
                </Label>
                <Input
                  id="tenMonHoc"
                  name="tenMonHoc"
                  value={form.tenMonHoc}
                  onChange={handleFormChange}
                  placeholder="Tên môn học (tự động điền hoặc chọn)"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="maHocKy" className="dark:text-gray-300">
                  Mã Học Kỳ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maHocKy"
                  name="maHocKy"
                  value={form.maHocKy}
                  onChange={handleFormChange}
                  placeholder="Ví dụ: HK1"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="namHoc" className="dark:text-gray-300">
                  Năm Học <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="namHoc"
                  name="namHoc"
                  value={form.namHoc}
                  onChange={handleFormChange}
                  placeholder="Ví dụ: 2023-2024"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="mr-2 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubmitting ? "Đang lưu..." : "Lưu Chương Trình"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="mb-4">
        <Input
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white w-64"
        />
      </div>

      {/* Bảng dữ liệu */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary-foreground" />
          <p className="ml-2 text-gray-600 dark:text-gray-300">
            Đang tải danh sách chương trình khung...
          </p>
        </div>
      ) : filteredChuongTrinhKhungs.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
          <ScrollArea className="h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-700">
                <TableRow>
                  {[
                    { label: "Mã Ngành", field: "maNganh" },
                    { label: "Tên Ngành", field: "tenNganh" },
                    { label: "Mã Môn Học", field: "maMonHoc" },
                    { label: "Tên Môn Học", field: "tenMonHoc" },
                    { label: "Học Kỳ", field: "maHocKy" },
                    { label: "Năm Học", field: "namHoc" },
                  ].map(({ label, field }) => (
                    <TableHead
                      key={field}
                      className="text-gray-700 dark:text-gray-200 cursor-pointer select-none"
                      onClick={() => {
                        if (sortField === field) {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortField(field);
                          setSortOrder("asc");
                        }
                      }}
                    >
                      {label}
                      {sortField === field &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="inline-block w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="inline-block w-4 h-4 ml-1" />
                        ))}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y dark:divide-gray-700">
                {filteredChuongTrinhKhungs.map((item, idx) => (
                  <TableRow
                    key={
                      item.id ||
                      `${item.maNganh}-${item.maMonHoc}-${item.maHocKy}-${item.namHoc}-${idx}`
                    }
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <TableCell className="font-medium dark:text-gray-300">
                      {item.maNganh}
                    </TableCell>
                    <TableCell className="dark:text-gray-300">
                      {item.tenNganh || "N/A"}
                    </TableCell>
                    <TableCell className="dark:text-gray-300">
                      {item.maMonHoc}
                    </TableCell>
                    <TableCell className="dark:text-gray-300">
                      {item.tenMonHoc || "N/A"}
                    </TableCell>
                    <TableCell className="dark:text-gray-300">
                      {item.maHocKy}
                    </TableCell>
                    <TableCell className="dark:text-gray-300">
                      {item.namHoc}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      ) : (
        <div className="text-center py-10">
          <NotebookText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Không có chương trình khung
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Hiện tại chưa có chương trình khung nào được thêm vào hệ thống.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminChuongTrinhKhung;
