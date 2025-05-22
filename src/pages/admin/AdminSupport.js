// src/pages/admin/AdminSupport.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useOutletContext } from "react-router-dom";
import { api } from "../../api/axios"; 
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { LifeBuoy, MoreHorizontal, Eye, CheckSquare, Loader2, AlertCircle, Activity, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Input } from "../../components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { toast } from 'react-toastify';
import { ScrollArea } from '../../components/ui/scroll-area';


// Hàm tiện ích để trích xuất thông điệp lỗi thân thiện
const extractErrorMessage = (errorObj) => {
    if (typeof errorObj === 'string') return errorObj;
    if (errorObj?.response?.data) {
        const data = errorObj.response.data;
        if (typeof data === 'string') return data;
        if (data.message && typeof data.message === 'string') return data.message;
        if (data.error && typeof data.error === 'string') return data.error;
        if (data.path && data.status) {
             return `Lỗi ${data.status} tại ${data.path}. Chi tiết: ${data.message || data.error || 'Không có thông tin chi tiết.'}`;
        }
        if (typeof data === 'object' && data !== null) {
            for (const key in data) {
                if (typeof data[key] === 'string' && (key.toLowerCase().includes('message') || key.toLowerCase().includes('error') || key.toLowerCase().includes('detail'))) {
                    return data[key];
                }
            }
            try {
                return `Lỗi từ server: ${JSON.stringify(data).substring(0, 200)}...`;
            } catch (e) { /* ignore */ }
        }
    }
    if (errorObj?.message && typeof errorObj.message === 'string') {
        return errorObj.message;
    }
    return "Đã có lỗi không xác định xảy ra.";
};

// Cấu trúc một "ticket" hỗ trợ (điều chỉnh nếu API của bạn khác)
// interface SupportTicket {
//   id: number | string;
//   maSinhVien: string; 
//   hoTenSinhVien: string; 
//   chuDe: string; 
//   noiDung: string; 
//   trangThai: 'Mới' | 'Đang xử lý' | 'Đã giải quyết'; 
//   ngayTao: string; // ISO date string
// }


const AdminSupport = () => {
  const { tokenInfo, loadingAuthGlobal } = useOutletContext() || { tokenInfo: null, loadingAuthGlobal: true };
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch danh sách yêu cầu hỗ trợ
  const fetchTickets = useCallback(async (currentSearchTerm) => {
    if (!tokenInfo) return;
    setLoading(true);
    setError(null);
    try {
      // API: GET /api/hotro?search={currentSearchTerm}
      // Giả định backend trả về một mảng các đối tượng ticket
      const response = await api.get('/api/hotro', {
          params: { search: currentSearchTerm || undefined } 
      });
      const data = Array.isArray(response?.data) ? response.data : [];
      setTickets(data);
    } catch (err) {
      const friendlyError = extractErrorMessage(err);
      setError(friendlyError);
      toast.error(`Lỗi tải danh sách yêu cầu hỗ trợ: ${friendlyError}`);
      setTickets([]); 
    } finally {
      setLoading(false);
    }
  }, [tokenInfo]);

  // Debounce cho tìm kiếm và fetch ban đầu
  useEffect(() => {
    if (!loadingAuthGlobal && tokenInfo) {
        const debounceFetch = setTimeout(() => {
            fetchTickets(searchTerm);
        }, 500); 
        return () => clearTimeout(debounceFetch);
    } else if (!loadingAuthGlobal && !tokenInfo) {
        setError("Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
        setLoading(false);
    }
  }, [searchTerm, fetchTickets, loadingAuthGlobal, tokenInfo]);


  // Mở dialog xem chi tiết
  const openViewDetailsDialog = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailDialogOpen(true);
  };

  // Đóng dialog xem chi tiết
  const closeViewDetailsDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedTicket(null);
  };

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = async (ticketId, newStatus) => {
    if (isUpdatingStatus || !tokenInfo) {
        if(!tokenInfo) toast.error("Phiên làm việc hết hạn.");
        return;
    }
    setIsUpdatingStatus(true);
    const originalTickets = [...tickets]; 

    // Optimistic UI update
    setTickets(prevTickets =>
        prevTickets.map(ticket =>
            // Giả sử API của bạn trả về trường 'trangThai' cho status
            ticket.id === ticketId ? { ...ticket, trangThai: newStatus } : ticket 
        )
    );
    if (isDetailDialogOpen && selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? {...prev, trangThai: newStatus} : null);
    }

    try {
      // API: PUT /api/hotro/{ticketId}/status
      // Payload: { status: newStatus } (Backend cần nhận trường 'status' hoặc 'trangThai' tương ứng)
      await api.put(`/api/hotro/${ticketId}/status`, { status: newStatus }); 
      toast.success(`Đã cập nhật trạng thái thành "${newStatus}".`);
    } catch (err) {
      const friendlyError = extractErrorMessage(err);
      toast.error(`Lỗi cập nhật trạng thái: ${friendlyError}`);
      setTickets(originalTickets); 
      if (isDetailDialogOpen && selectedTicket?.id === ticketId) {
         const originalSelected = originalTickets.find(t => t.id === ticketId);
         setSelectedTicket(originalSelected || null);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Lấy variant cho Badge trạng thái
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) { 
      case 'mới': return 'destructive'; 
      case 'đang xử lý': return 'warning'; 
      case 'đã giải quyết': return 'success'; 
      default: return 'secondary'; 
    }
  };

  // Định dạng ngày giờ
   const formatDate = (isoString) => {
     if (!isoString) return 'N/A';
     try {
       return new Date(isoString).toLocaleString('vi-VN', {
           day: '2-digit', month: '2-digit', year: 'numeric',
           hour: '2-digit', minute: '2-digit', second: '2-digit',
           hour12: false 
       });
     } catch (e) {
       console.error("AdminSupport: Invalid date format:", isoString, e);
       return 'Ngày không hợp lệ';
     }
   };
   
  if (loadingAuthGlobal) {
    return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2 text-muted-foreground dark:text-gray-400">Đang xác thực...</p></div>;
  }
  if (!tokenInfo && !loadingAuthGlobal) {
     return <Alert variant="destructive" className="m-4 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"><AlertCircle className="h-4 w-4" /><AlertTitle>Lỗi Xác thực</AlertTitle><AlertDescription>{error || "Không thể xác thực người dùng. Vui lòng đăng nhập lại."}</AlertDescription></Alert>;
  }

  return (
    <>
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <LifeBuoy className="h-5 w-5 text-primary" /> Yêu cầu Hỗ trợ
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Xem và quản lý các yêu cầu hỗ trợ từ sinh viên.</CardDescription>
            </div>
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                <Input
                    type="search"
                    placeholder="Tìm SV, Chủ đề, Trạng thái..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground dark:text-gray-400">Đang tải yêu cầu...</p>
            </div>
          )}
          {error && !loading && (
            <Alert variant="destructive" className="my-4 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && (
            <ScrollArea className="h-[calc(100vh-280px)]"> {/* Điều chỉnh chiều cao nếu cần */}
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-700">
                  <TableHead className="w-[100px] dark:text-gray-300">Mã SV</TableHead>
                  <TableHead className="dark:text-gray-300">Sinh viên</TableHead>
                  <TableHead className="dark:text-gray-300">Chủ đề</TableHead>
                  <TableHead className="hidden md:table-cell dark:text-gray-300">Thời gian gửi</TableHead>
                  <TableHead className="text-center dark:text-gray-300">Trạng thái</TableHead>
                  <TableHead><span className="sr-only">Hành động</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    // API trả về các trường: id, maSinhVien, hoTenSinhVien, chuDe, ngayTao, trangThai
                    <TableRow key={ticket.id} className="dark:border-gray-700 hover:bg-muted/50 dark:hover:bg-gray-700/50">
                      <TableCell className="font-medium dark:text-gray-100">{ticket.maSinhVien ?? 'N/A'}</TableCell>
                      <TableCell className="dark:text-gray-200">{ticket.hoTenSinhVien ?? 'N/A'}</TableCell>
                      <TableCell className="max-w-[250px] truncate dark:text-gray-200" title={ticket.chuDe}>{ticket.chuDe ?? 'N/A'}</TableCell>
                      <TableCell className="hidden md:table-cell dark:text-gray-300">{formatDate(ticket.ngayTao)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusVariant(ticket.trangThai)} className={
                            getStatusVariant(ticket.trangThai) === 'destructive' ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white dark:text-white' :
                            getStatusVariant(ticket.trangThai) === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-black dark:text-gray-900' :
                            getStatusVariant(ticket.trangThai) === 'success' ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white dark:text-white' :
                            'dark:bg-gray-600 dark:text-gray-100'
                        }>
                            {ticket.trangThai ?? 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isUpdatingStatus} className="dark:text-gray-300 dark:hover:bg-gray-700">
                              <MoreHorizontal className="h-4 w-4" /> <span className="sr-only">Mở menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end" 
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md"
                          >
                            <DropdownMenuLabel className="dark:text-gray-300">Hành động</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700"/>
                            <DropdownMenuItem 
                              onClick={() => openViewDetailsDialog(ticket)} 
                              className="cursor-pointer text-gray-700 hover:!bg-gray-100 dark:text-gray-200 dark:hover:!bg-gray-700 dark:focus:bg-gray-700"
                            >
                              <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700"/>
                            <DropdownMenuItem
                                onClick={() => handleUpdateStatus(ticket.id, 'Đang xử lý')}
                                disabled={ticket.trangThai === 'Đang xử lý' || ticket.trangThai === 'Đã giải quyết' || isUpdatingStatus}
                                className="cursor-pointer text-gray-700 hover:!bg-gray-100 dark:text-gray-200 dark:hover:!bg-gray-700 dark:focus:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                               <Activity className="mr-2 h-4 w-4" /> Đánh dấu Đang xử lý
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleUpdateStatus(ticket.id, 'Đã giải quyết')}
                                disabled={ticket.trangThai === 'Đã giải quyết' || isUpdatingStatus}
                                className="cursor-pointer text-gray-700 hover:!bg-gray-100 dark:text-gray-200 dark:hover:!bg-gray-700 dark:focus:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckSquare className="mr-2 h-4 w-4" /> Đánh dấu Đã giải quyết
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="dark:border-gray-700">
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground dark:text-gray-400">
                      {searchTerm ? `Không tìm thấy yêu cầu với từ khóa "${searchTerm}".` : "Không có yêu cầu hỗ trợ nào."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </ScrollArea>
          )}
        </CardContent>
         <CardFooter className="dark:border-t dark:border-gray-700 pt-4">
              <div className="text-xs text-muted-foreground dark:text-gray-400">
                Hiển thị <strong>{tickets.length}</strong> yêu cầu hỗ trợ.
              </div>
          </CardFooter>
      </Card>

       <Dialog open={isDetailDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) closeViewDetailsDialog(); else setIsDetailDialogOpen(true);}}>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
                {selectedTicket && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="dark:text-white">Chi tiết Yêu cầu Hỗ trợ #{selectedTicket.id}</DialogTitle>
                            <DialogDescription className="dark:text-gray-400">
                                {/* Giả sử API trả về hoTenSinhVien, maSinhVien, ngayTao */}
                                Từ: {selectedTicket.hoTenSinhVien ?? 'N/A'} ({selectedTicket.maSinhVien ?? 'N/A'}) - Gửi lúc: {formatDate(selectedTicket.ngayTao)}
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] py-4 px-1">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="font-semibold dark:text-gray-300">Chủ đề:</Label>
                                    {/* Giả sử API trả về chuDe */}
                                    <p className="text-sm p-2 border rounded bg-muted dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">{selectedTicket.chuDe ?? 'Không có chủ đề'}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="font-semibold dark:text-gray-300">Nội dung:</Label>
                                    {/* Giả sử API trả về noiDung */}
                                    <Textarea value={selectedTicket.noiDung ?? 'Không có nội dung'} readOnly rows={8} className="text-sm bg-muted dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"/>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="font-semibold dark:text-gray-300">Trạng thái:</Label>
                                    {/* Giả sử API trả về trangThai */}
                                    <Badge variant={getStatusVariant(selectedTicket.trangThai)} className={
                                        getStatusVariant(selectedTicket.trangThai) === 'destructive' ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white dark:text-white' :
                                        getStatusVariant(selectedTicket.trangThai) === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-black dark:text-gray-900' :
                                        getStatusVariant(selectedTicket.trangThai) === 'success' ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white dark:text-white' :
                                        'dark:bg-gray-600 dark:text-gray-100'
                                    }>
                                        {selectedTicket.trangThai ?? 'N/A'}
                                    </Badge>
                                </div>
                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-4 border-t dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={closeViewDetailsDialog} disabled={isUpdatingStatus} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200">Đóng</Button>
                            {selectedTicket.trangThai !== 'Đang xử lý' && selectedTicket.trangThai !== 'Đã giải quyết' && (
                                <Button
                                    onClick={() => handleUpdateStatus(selectedTicket.id, 'Đang xử lý')}
                                    size="sm"
                                    disabled={isUpdatingStatus}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-black dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-black"
                                >
                                    {isUpdatingStatus && selectedTicket.trangThai !== 'Đang xử lý' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Activity className="mr-2 h-4 w-4"/>}
                                    Đánh dấu Đang xử lý
                                </Button>
                            )}
                            {selectedTicket.trangThai !== 'Đã giải quyết' && (
                                <Button
                                    onClick={() => handleUpdateStatus(selectedTicket.id, 'Đã giải quyết')}
                                    size="sm"
                                    disabled={isUpdatingStatus}
                                    className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                                >
                                    {isUpdatingStatus && selectedTicket.trangThai !== 'Đã giải quyết' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckSquare className="mr-2 h-4 w-4"/>}
                                    Đánh dấu Đã giải quyết
                                </Button>
                            )}
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    </>
  );
};

export default AdminSupport;
