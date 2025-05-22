import React, { useState, useEffect, useCallback } from "react";
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
  DialogDescription, 
  DialogFooter 
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "react-toastify";
import { Loader2, PlusCircle, Archive, AlertCircle, Edit, Trash2, MoreHorizontal } from "lucide-react"; 
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert"; 
import { ScrollArea } from "../../components/ui/scroll-area";
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator 
} from "../../components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../../components/ui/alert-dialog";


const initialNganhHocForm = {
    maNganh: "",
    tenNganh: "",
    soTinChiTotNghiep: "", 
    moTa: "",
};


const AdminNganhHoc = () => {
  const [nganhHocs, setNganhHocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // For edit dialog
  const [editingNganh, setEditingNganh] = useState(null); // For storing the ngành being edited
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(""); 
  const [nganhHocForm, setNganhHocForm] = useState(initialNganhHocForm);
  const [nganhHocIdToDelete, setNganhHocIdToDelete] = useState(null); // For delete confirmation

  // Fetch danh sách ngành học
  const fetchNganhHocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/nganhhoc");
      if (Array.isArray(res.data)) {
        setNganhHocs(res.data);
      } else {
        console.warn("API /nganhhoc did not return an array:", res.data);
        setNganhHocs([]); 
        toast.warn("Dữ liệu ngành học nhận được không đúng định dạng.");
      }
    } catch (error) {
      console.error("Lỗi tải danh sách ngành học:", error);
      toast.error("Lỗi tải danh sách ngành học. Vui lòng thử lại.");
      setNganhHocs([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNganhHocs();
  }, [fetchNganhHocs]);

  // Xử lý thay đổi form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNganhHocForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const validateForm = (isEdit = false) => {
    if (!nganhHocForm.maNganh.trim() && !isEdit) { // Mã ngành chỉ bắt buộc khi thêm mới
        setFormError("Mã ngành là bắt buộc.");
        return false;
    }
    if (!nganhHocForm.tenNganh.trim() || !nganhHocForm.soTinChiTotNghiep.trim()) {
        setFormError("Tên ngành và Số tín chỉ tốt nghiệp là bắt buộc.");
        return false;
    }
    if (isNaN(parseInt(nganhHocForm.soTinChiTotNghiep)) || parseInt(nganhHocForm.soTinChiTotNghiep) <=0) {
        setFormError("Số tín chỉ tốt nghiệp phải là một số dương.");
        return false;
    }
    if (!isEdit && nganhHocs.some(nh => nh.maNganh === nganhHocForm.maNganh.trim())) {
        setFormError("Mã ngành đã tồn tại. Vui lòng chọn mã ngành khác.");
        return false;
    }
    setFormError("");
    return true;
  }

  const closeAllDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingNganh(null);
    setNganhHocForm(initialNganhHocForm);
    setFormError("");
    setNganhHocIdToDelete(null);
  };


  // Xử lý thêm ngành học
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...nganhHocForm,
        maNganh: nganhHocForm.maNganh.trim(),
        tenNganh: nganhHocForm.tenNganh.trim(),
        soTinChiTotNghiep: parseInt(nganhHocForm.soTinChiTotNghiep, 10),
        moTa: nganhHocForm.moTa.trim() || null, 
      };
      
      const res = await api.post("/nganhhoc", payload);
      // setNganhHocs((prev) => [res.data, ...prev]); // Thêm vào đầu nếu muốn
      fetchNganhHocs(); // Tải lại danh sách để có ID mới nhất và sắp xếp đúng
      closeAllDialogs();
      toast.success("Thêm ngành học thành công!");
    } catch (error) {
      console.error("Thêm ngành học thất bại:", error);
      const serverMessage = error.response?.data?.message || error.response?.data;
      if (serverMessage) {
        setFormError(serverMessage);
        toast.error(`Thêm thất bại: ${serverMessage}`);
      } else {
        setFormError("Thêm ngành học thất bại. Vui lòng thử lại.");
        toast.error("Thêm ngành học thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mở dialog sửa
  const openEditDialog = (nganh) => {
    setEditingNganh(nganh);
    setNganhHocForm({
        maNganh: nganh.maNganh, // Mã ngành không cho sửa, chỉ hiển thị
        tenNganh: nganh.tenNganh,
        soTinChiTotNghiep: String(nganh.soTinChiTotNghiep),
        moTa: nganh.moTa || ""
    });
    setIsEditDialogOpen(true);
  };
  
  // Xử lý sửa ngành học
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingNganh || !validateForm(true)) return;

    setIsSubmitting(true);
    try {
        const payload = {
            // maNganh không được gửi trong payload khi cập nhật nếu backend không cho phép sửa mã
            tenNganh: nganhHocForm.tenNganh.trim(),
            soTinChiTotNghiep: parseInt(nganhHocForm.soTinChiTotNghiep, 10),
            moTa: nganhHocForm.moTa.trim() || null,
        };
        await api.put(`/nganhhoc/${editingNganh.maNganh}`, payload);
        fetchNganhHocs();
        closeAllDialogs();
        toast.success("Cập nhật ngành học thành công!");
    } catch (error) {
        console.error("Cập nhật ngành học thất bại:", error);
        const serverMessage = error.response?.data?.message || error.response?.data;
        if (serverMessage) {
            setFormError(serverMessage);
            toast.error(`Cập nhật thất bại: ${serverMessage}`);
        } else {
            setFormError("Cập nhật ngành học thất bại. Vui lòng thử lại.");
            toast.error("Cập nhật ngành học thất bại. Vui lòng thử lại.");
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  // Xử lý xóa ngành học
  const handleDeleteNganhHoc = async () => {
    if (!nganhHocIdToDelete) return;
    try {
        await api.delete(`/nganhhoc/${nganhHocIdToDelete}`);
        fetchNganhHocs();
        toast.success(`Xóa ngành học ${nganhHocIdToDelete} thành công!`);
    } catch (error) {
        console.error("Xóa ngành học thất bại:", error);
        const serverMessage = error.response?.data?.message || error.response?.data;
        toast.error(serverMessage || "Xóa ngành học thất bại. Vui lòng thử lại.");
    } finally {
        setNganhHocIdToDelete(null); // Đóng dialog xác nhận
    }
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Quản lý Ngành Học
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) closeAllDialogs(); else setIsAddDialogOpen(isOpen);}}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">
              <PlusCircle className="h-5 w-5" />
              Thêm Ngành Học
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Thêm Ngành Học Mới</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Điền thông tin chi tiết cho ngành học mới. Các trường có dấu (*) là bắt buộc.
              </DialogDescription>
            </DialogHeader>
            {formError && (
                <Alert variant="destructive" className="my-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Lỗi</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                </Alert>
            )}
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="maNganh" className="dark:text-gray-300">Mã Ngành*</Label>
                <Input
                  id="maNganh"
                  name="maNganh"
                  value={nganhHocForm.maNganh}
                  onChange={handleFormChange}
                  placeholder="Ví dụ: CNTT"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tenNganh" className="dark:text-gray-300">Tên Ngành*</Label>
                <Input
                  id="tenNganh"
                  name="tenNganh"
                  value={nganhHocForm.tenNganh}
                  onChange={handleFormChange}
                  placeholder="Ví dụ: Công nghệ Thông tin"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="soTinChiTotNghiep" className="dark:text-gray-300">Số tín chỉ tốt nghiệp*</Label>
                <Input
                  id="soTinChiTotNghiep"
                  type="number"
                  name="soTinChiTotNghiep"
                  min="1"
                  value={nganhHocForm.soTinChiTotNghiep}
                  onChange={handleFormChange}
                  placeholder="Ví dụ: 120"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="moTa" className="dark:text-gray-300">Mô Tả</Label>
                <Input 
                  id="moTa"
                  name="moTa"
                  value={nganhHocForm.moTa}
                  onChange={handleFormChange}
                  placeholder="Mô tả ngắn về ngành học (không bắt buộc)"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <DialogFooter className="pt-4 border-t dark:border-gray-700">
                <Button type="button" variant="outline" onClick={closeAllDialogs} className="mr-2 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? "Đang lưu..." : "Lưu Ngành Học"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary-foreground" />
          <p className="ml-2 text-gray-600 dark:text-gray-300">Đang tải danh sách ngành học...</p>
        </div>
      ) : Array.isArray(nganhHocs) && nganhHocs.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-300px)] md:h-[calc(100vh-250px)]">
            <Table className="min-w-full">
            <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-900 shadow-sm">
              <TableRow className="border-b border-gray-200 dark:border-gray-700">
                <TableHead className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Mã Ngành</TableHead>
                <TableHead className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Tên Ngành</TableHead>
                <TableHead className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Số tín chỉ TN</TableHead>
                <TableHead className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Mô tả</TableHead>
                <TableHead className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {nganhHocs.map((nganh) => (
                <TableRow key={nganh.maNganh || nganh.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <TableCell className="py-3 px-4 text-sm text-gray-700 dark:text-gray-100 font-medium">{nganh.maNganh}</TableCell>
                  <TableCell className="py-3 px-4 text-sm text-gray-700 dark:text-gray-200">{nganh.tenNganh}</TableCell>
                  <TableCell className="text-center py-3 px-4 text-sm text-gray-700 dark:text-gray-200">{nganh.soTinChiTotNghiep}</TableCell>
                  <TableCell className="py-3 px-4 text-sm text-gray-700 dark:text-gray-200 truncate max-w-xs" title={nganh.moTa}>{nganh.moTa || "N/A"}</TableCell>
                  <TableCell className="text-right py-3 px-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" className="dark:text-gray-300 dark:hover:bg-gray-700">
                                <MoreHorizontal className="h-4 w-4" /> <span className="sr-only">Mở menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            align="end" 
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md w-32"
                        >
                            <DropdownMenuItem 
                                onClick={() => openEditDialog(nganh)} 
                                className="cursor-pointer text-gray-700 hover:!bg-gray-100 dark:text-gray-200 dark:hover:!bg-gray-700 dark:focus:bg-gray-700 flex items-center px-2 py-1.5 text-sm"
                            >
                                <Edit className="mr-2 h-4 w-4" /> Sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700"/>
                            <AlertDialogTrigger asChild>
                                <button
                                    onClick={() => setNganhHocIdToDelete(nganh.maNganh)}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors w-full text-left text-red-500 hover:!bg-red-100 focus:text-red-500 dark:text-red-400 dark:hover:!bg-red-900/30 dark:focus:bg-red-900/40 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                </button>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      ) : (
        <div className="text-center py-10">
          <Archive className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Không có ngành học</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Hiện tại chưa có ngành học nào được thêm vào hệ thống.</p>
        </div>
      )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) closeAllDialogs(); else setIsEditDialogOpen(isOpen);}}>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
                <DialogHeader>
                <DialogTitle className="dark:text-white">Chỉnh sửa Ngành Học</DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                    Cập nhật thông tin cho ngành: {editingNganh?.maNganh} - {editingNganh?.tenNganh}.
                </DialogDescription>
                </DialogHeader>
                {formError && (
                    <Alert variant="destructive" className="my-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Lỗi</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                <div>
                    <Label htmlFor="edit-maNganh" className="dark:text-gray-300">Mã Ngành (Không thể sửa)</Label>
                    <Input
                    id="edit-maNganh"
                    name="maNganh"
                    value={nganhHocForm.maNganh}
                    className="dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600"
                    readOnly 
                    disabled
                    />
                </div>
                <div>
                    <Label htmlFor="edit-tenNganh" className="dark:text-gray-300">Tên Ngành*</Label>
                    <Input
                    id="edit-tenNganh"
                    name="tenNganh"
                    value={nganhHocForm.tenNganh}
                    onChange={handleFormChange}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                    />
                </div>
                <div>
                    <Label htmlFor="edit-soTinChiTotNghiep" className="dark:text-gray-300">Số tín chỉ tốt nghiệp*</Label>
                    <Input
                    id="edit-soTinChiTotNghiep"
                    type="number"
                    name="soTinChiTotNghiep"
                    min="1"
                    value={nganhHocForm.soTinChiTotNghiep}
                    onChange={handleFormChange}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                    />
                </div>
                <div>
                    <Label htmlFor="edit-moTa" className="dark:text-gray-300">Mô Tả</Label>
                    <Input 
                    id="edit-moTa"
                    name="moTa"
                    value={nganhHocForm.moTa}
                    onChange={handleFormChange}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                </div>
                <DialogFooter className="pt-4 border-t dark:border-gray-700">
                    <Button type="button" variant="outline" onClick={closeAllDialogs} className="mr-2 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                    Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
                    </Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!nganhHocIdToDelete} onOpenChange={(isOpen) => { if(!isOpen) setNganhHocIdToDelete(null);}}>
            <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white">Xác nhận xóa Ngành học?</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                        Bạn có chắc chắn muốn xóa ngành học "{nganhHocs.find(nh => nh.maNganh === nganhHocIdToDelete)?.tenNganh}" (Mã: {nganhHocIdToDelete})? 
                        Hành động này không thể hoàn tác và có thể ảnh hưởng đến các chương trình khung liên quan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="border-t dark:border-gray-700 pt-4">
                    <AlertDialogCancel onClick={() => setNganhHocIdToDelete(null)} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600">Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteNganhHoc} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
};

export default AdminNganhHoc;
