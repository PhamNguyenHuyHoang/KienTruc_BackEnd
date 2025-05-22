// src/pages/Unauthorized.js (Đảm bảo tên file và đường dẫn đúng)
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button'; // Import Button từ shadcn/ui
import { ShieldAlert } from 'lucide-react'; // Import icon

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold text-destructive mb-2">Không có quyền truy cập</h1>
      <p className="text-muted-foreground mb-6">
        Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link to="/login">Đăng nhập lại</Link>
        </Button>
        {/* Có thể thêm nút quay về trang chủ nếu có */}
        {/* <Button asChild>
          <Link to="/">Về trang chủ</Link>
        </Button> */}
      </div>
    </div>
  );
};

export default Unauthorized;
