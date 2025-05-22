import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicApi } from "../api/axios";
import { toast } from "react-toastify";
import "./css/LoginForm.css";
import "./css/NeonButton.css";

const LoginForm = () => {
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await publicApi.post("/auth/login", {
        tenDangNhap,
        matKhau,
      });

      if (response.data?.token) {
        const { token, role } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        toast.success("Đăng nhập thành công!");

        setTimeout(() => {
          if (role === "QUANTRIVIEN") navigate("/pages/admin");
          else if (role === "SINHVIEN") navigate("/pages/student");
          else {
            setError("Vai trò người dùng không hợp lệ.");
            toast.error("Không xác định được vai trò.");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
          }
        }, 300);
      } else {
        const message =
          response.data?.message || "Sai tên đăng nhập hoặc mật khẩu.";
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      let msg = "Đã xảy ra lỗi.";
      if (err.response?.status === 401)
        msg = "Sai tên đăng nhập hoặc mật khẩu.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="circle-login-background">
      <div className="circle-ring" />
      <form className="circle-login-form" onSubmit={handleSubmit}>
        <h2 className="circle-title">Login</h2>
        <input
          type="text"
          placeholder="Mã sinh viên"
          value={tenDangNhap}
          onChange={(e) => setTenDangNhap(e.target.value)}
          className="circle-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          className="circle-input"
          required
        />
        <div className="circle-link">
          <Link to="/forgot-password">Forgot your password?</Link>
        </div>
        <button type="submit" className="neon-btn" disabled={loading}>
          {loading ? "Đang tải..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
