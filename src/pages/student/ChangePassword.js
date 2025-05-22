// src/pages/student/ChangePassword.js
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { api } from "../../api/axios";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../components/ui/alert-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import "../../components/css/ChangePassword.css";

const ChangePassword = () => {
  const [form, setForm] = useState({
    username: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch user info on mount
  // 1. Fetch user info
  const fetchUser = () => {
    setLoadingUser(true);
    api
      .get("/sinhvien/me")
      .then((res) => {
        setForm((f) => ({ ...f, username: res.data.tenDangNhap || "" }));
        setError(null);
      })
      .catch((err) => {
        const msg = err.message.includes("timeout")
          ? "Lỗi khi tải thông tin người dùng."
          : "Không thể tải thông tin người dùng.";
        setError(msg);
      })
      .finally(() => setLoadingUser(false));
  };

  useEffect(fetchUser, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitChangePassword = async () => {
    setError("");
    setMessage("");

    // client-side validations
    if (
      !form.oldPassword.trim() ||
      !form.newPassword.trim() ||
      !form.confirmPassword.trim()
    ) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setSubmitting(true);
    console.log("➡️ Request bắt đầu: POST /auth/doimatkhau");
    try {
      const payload = {
        username: form.username,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      };
      const res = await api.post("/auth/doimatkhau", payload);
      console.log("✅ API Response:", res.data);
      setMessage(res.data || "Đổi mật khẩu thành công!");

      // logout after success
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      console.error("❌ API Error:", err.message);
      setError(
        err.message.includes("timeout")
          ? "Yêu cầu timeout. Vui lòng thử lại."
          : err.response?.data || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Nếu fetch user lỗi và chưa có username → full-page error
  // 2. Nếu fetch user lỗi và chưa có username → full-page error
  if (error && !form.username) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md mx-auto border border-black-200 shadow-lg">
          <CardHeader className="flex items-center gap-2 bg-red-600 p-4 rounded-t">
            <AlertCircle className="text-white w-6 h-6" />
            <CardTitle className="text-white text-lg">
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
            <Button variant="outline" onClick={fetchUser}>
              Thử lại
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 3. Khi đang load user, show spinner
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  // 4. Render form bình thường
  return (
    <div className="circle-login-background">
      <div className="circle-ring" />

      <form className="circle-login-form" onSubmit={(e) => e.preventDefault()}>
        <h2 className="circle-title">Đổi mật khẩu</h2>

        {/* Thông báo lỗi / thành công dưới dạng banner ngay trên form */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 flex items-center gap-2">
            <AlertCircle /> {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">
            {message}
          </div>
        )}

        {/* Username cố định */}
        <input
          type="text"
          name="username"
          value={form.username}
          placeholder="Tên đăng nhập"
          className="circle-input opacity-50"
          disabled
        />

        {/* Các trường password */}
        <div className="relative w-full mb-3">
          <input
            type={showOld ? "text" : "password"}
            name="oldPassword"
            value={form.oldPassword}
            onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
            placeholder="Mật khẩu cũ"
            className="circle-input"
            required
          />
          <button
            type="button"
            onClick={() => setShowOld((v) => !v)}
            className="eye-btn"
          >
            {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative w-full mb-3">
          <input
            type={showNew ? "text" : "password"}
            name="newPassword"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            placeholder="Mật khẩu mới"
            className="circle-input"
            required
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="eye-btn"
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative w-full mb-4">
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            placeholder="Xác nhận mật khẩu mới"
            className="circle-input"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="eye-btn"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Dialog xác nhận đổi mật khẩu */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="w-full flex justify-center">
              {/* <Button variant="solid" disabled={submitting}>
                ĐỔI MẬT KHẨU
              </Button> */}
              <button type="button" className="neon-btn" disabled={submitting}>
                ĐỔI MẬT KHẨU
              </button>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white rounded-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận đổi mật khẩu</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn đổi mật khẩu? Sau đó, bạn sẽ phải đăng
                nhập lại.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-200 px-4 py-2 rounded text-sm">
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={submitChangePassword}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Đồng ý
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </div>
  );
};

export default ChangePassword;
