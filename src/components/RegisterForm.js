// src/components/RegisterForm.js (Hoặc nơi bạn lưu component này)
import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom"; // Thêm Link
import { publicApi } from '../api/axios'; // Sử dụng publicApi
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import '../App.css'; // Đảm bảo file CSS tồn tại

function RegisterForm() {
  // State cho các trường input
  const [formData, setFormData] = useState({
      tenDangNhap: '', // Backend AuthController dùng tenDangNhap
      matKhau: '',
      nhapLaiMatKhau: '', // Thêm trường nhập lại mật khẩu
      // Các trường hoTen, email hiện không được backend sử dụng trực tiếp khi đăng ký
      // Backend sẽ tự tạo SinhVien với thông tin mặc định nếu role là SINHVIEN
      hoTen: '',
      email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // State lưu lỗi

  const navigate = useNavigate();

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý submit form
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Reset lỗi

    // Kiểm tra mật khẩu nhập lại
    if (formData.matKhau !== formData.nhapLaiMatKhau) {
        setError('Mật khẩu nhập lại không khớp.');
        toast.error('Mật khẩu nhập lại không khớp.');
        return;
    }

    setLoading(true);

    // Dữ liệu gửi lên backend (chỉ cần tenDangNhap và matKhau theo AuthController)
    const payload = {
        tenDangNhap: formData.tenDangNhap,
        matKhau: formData.matKhau,
        // Backend sẽ tự gán LoaiTaiKhoan là SINHVIEN mặc định
    };

    try {
      console.log("Sending registration data:", payload);
      // Gọi API đăng ký bằng publicApi
      await publicApi.post('/auth/register', payload);

      toast.success('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      // Chuyển hướng về trang đăng nhập sau 1.5 giây
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      console.error("Registration error:", err.response || err.message || err);
      // Lấy lỗi từ backend response nếu có (ví dụ: "Tài khoản đã tồn tại!")
      const message = err.response?.data || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container"> {/* Đảm bảo class CSS này tồn tại */}
      <form className="auth-form" onSubmit={handleRegister}> {/* Đảm bảo class CSS này tồn tại */}
        <h2>Đăng ký tài khoản</h2>

        {/* Hiển thị lỗi nếu có */}
        {error && <div className="error-message text-red-600 text-sm mb-3 p-2 bg-red-100 border border-red-300 rounded">{error}</div>}

        {/* Tên đăng nhập (Mã SV/QTV) */}
        <div className="input-group">
          <input
            name="tenDangNhap"
            placeholder="Tên đăng nhập (Mã SV/QTV)"
            value={formData.tenDangNhap}
            onChange={handleChange}
            required
            aria-label="Tên đăng nhập"
          />
        </div>

        {/* Họ tên (Chỉ để nhập, backend hiện không dùng) */}
        <div className="input-group">
          <input
            name="hoTen"
            placeholder="Họ và tên"
            value={formData.hoTen}
            onChange={handleChange}
            required
            aria-label="Họ và tên"
          />
        </div>

        {/* Email (Chỉ để nhập, backend hiện không dùng) */}
        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            aria-label="Email"
          />
        </div>

        {/* Mật khẩu */}
        <div className="input-group">
          <input
            type="password"
            name="matKhau"
            placeholder="Mật khẩu"
            value={formData.matKhau}
            onChange={handleChange}
            required
            aria-label="Mật khẩu"
            minLength={6} // Thêm yêu cầu độ dài tối thiểu nếu cần
          />
        </div>

        {/* Nhập lại mật khẩu */}
        <div className="input-group">
          <input
            type="password"
            name="nhapLaiMatKhau"
            placeholder="Nhập lại mật khẩu"
            value={formData.nhapLaiMatKhau}
            onChange={handleChange}
            required
            aria-label="Nhập lại mật khẩu"
          />
        </div>

        <button type="submit" disabled={loading} className="auth-button"> {/* Thêm class */}
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
              Đang đăng ký...
            </>
          ) : (
            "Đăng ký"
          )}
        </button>

        {/* Link quay lại đăng nhập */}
         <div className="mt-4 text-center text-sm">
            Đã có tài khoản? <Link to="/login" className="text-primary hover:underline">Đăng nhập</Link>
         </div>
      </form>
    </div>
  );
}

export default RegisterForm;
