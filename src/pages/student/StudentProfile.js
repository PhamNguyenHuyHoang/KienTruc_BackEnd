// src/pages/student/StudentProfile.js
import React, { useState, useEffect, useCallback } from "react";
import { api, getUserInfoFromToken } from "../../api/axios";
import { toast } from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import { User, Edit, Save, X, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { Textarea } from "../../components/ui/textarea";
import GlassCard from "../../components/ui/GlassCard";

const StudentProfile = () => {
  const [profileData, setProfileData] = useState({});
  const [initialData, setInitialData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [maSinhVien, setMaSinhVien] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const studentInfo = getUserInfoFromToken();
    if (studentInfo?.username) {
      setMaSinhVien(studentInfo.username);
      setRole(studentInfo.role);
    } else {
      setError("Lỗi: Không thể xác thực người dùng.");
      setLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Axios tự timeout sau 5s và retry 2 lần
      const response = await api.get("/sinhvien/me");
      const data = response.data;
      const mapped = {
        maSinhVien: data.maSinhVien,
        hoTen: data.hoTen,
        email: data.email,
        gioiTinh: data.gioiTinh,
        ngaySinh: data.ngaySinh,
        noiSinh: data.noiSinh,
        lopHoc: data.lopHoc,
        khoaHoc: data.khoaHoc,
        bacDaoTao: data.bacDaoTao,
        loaiHinhDaoTao: data.loaiHinhDaoTao,
        tenNganh: data.tenNganh || data.nganh || "",
        avatarUrl: data.avatarUrl || "",
      };
      setProfileData(mapped);
      setInitialData(mapped);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin cá nhân:", err);
      if (err.code === "ECONNABORTED") {
        // Timeout
        setError("Server không phản hồi (timeout). Vui lòng thử lại.");
      } else if (err.response?.status === 403) {
        // Nếu cần, coi như không có quyền
        setError("Bạn không có quyền truy cập.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Không thể tải thông tin cá nhân."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Gọi lần đầu và mỗi khi maSinhVien thay đổi
  useEffect(() => {
    if (maSinhVien) {
      fetchProfile();
    }
  }, [maSinhVien, fetchProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) setProfileData(initialData);
    setError(null);
    setIsEditing(!isEditing);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!maSinhVien) return setError("Lỗi: Không xác định được mã sinh viên.");
    setSaving(true);
    setError(null);
    try {
      const dataToUpdate =
        role === "SINHVIEN"
          ? {
              email: profileData.email,
              gioiTinh: profileData.gioiTinh,
              ngaySinh: profileData.ngaySinh,
              noiSinh: profileData.noiSinh,
              avatarUrl: profileData.avatarUrl,
            }
          : profileData;
      // include 'tenNganh' only if admin
      if (role !== "SINHVIEN") dataToUpdate.tenNganh = profileData.tenNganh;

      await api.put(`/sinhvien/${maSinhVien}`, dataToUpdate);
      setInitialData(profileData);
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin:", err);
      setError(
        err.response?.data?.message || err.message || "Cập nhật thất bại."
      );
    } finally {
      setSaving(false);
    }
  };

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
                // gọi lại fetchSchedule thay vì api.get cố định
                fetchProfile();
              }}
            >
              Thử lại
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const renderField = ({
    id,
    label,
    type = "text",
    isTextArea = false,
    isSelect = false,
    options = [],
    editable = true,
  }) => {
    const canEdit =
      isEditing &&
      (role === "QUANTRIVIEN" || (role === "SINHVIEN" && editable));
    const value = profileData[id] || "";
    return (
      <div className="space-y-1">
        <Label htmlFor={id} className="font-semibold text-base text-gray-700">
          {label}
        </Label>
        {canEdit ? (
          isTextArea ? (
            <Textarea
              id={id}
              name={id}
              value={profileData[id] || ""}
              onChange={handleInputChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none ${
                isEditing
                  ? "border-blue-500 focus:ring focus:ring-blue-300"
                  : "border-gray-300"
              }`}
            />
          ) : isSelect ? (
            <select
              id={id}
              name={id}
              value={profileData[id] || ""}
              onChange={handleInputChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none ${
                isEditing
                  ? "border-blue-500 focus:ring focus:ring-blue-300"
                  : "border-gray-300"
              }`}
            >
              <option value="">-- Chọn {label.toLowerCase()} --</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id={id}
              name={id}
              type={type}
              value={profileData[id] || ""}
              onChange={handleInputChange}
              className={isEditing ? "border-blue-500 focus:ring-blue-500" : ""}
            />
          )
        ) : (
          <p className="px-3 py-2 bg-gray-100 text-gray-500 rounded cursor-not-allowed">
            {profileData[id] || "Chưa có thông tin"}
          </p>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" /> Đang tải hồ
        sơ...
      </div>
    );
  if (!maSinhVien && error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi Xác Thực</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center animate-gradient">
      <GlassCard className="w-full max-w-6xl mx-auto my-10 px-6 py-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <User className="h-6 w-6" /> Thông tin cá nhân
              </CardTitle>
              <CardDescription className="text-gray-500">
                Xem và cập nhật thông tin cá nhân của bạn.
              </CardDescription>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              size="sm"
              onClick={handleEditToggle}
              disabled={saving}
              className="bg-blue-400 hover:bg-blue-700 transition-colors duration-300"
            >
              {isEditing ? (
                <>
                  <X className="mr-1 h-4 w-4" /> Hủy
                </>
              ) : (
                <>
                  <Edit className="mr-1 h-4 w-4" /> Chỉnh sửa
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-6">
            {error && !saving && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center">
              <Avatar className="h-24 w-24 border border-gray-300 overflow-hidden">
                <AvatarImage
                  src={profileData.avatarUrl || "/placeholder-user.jpg"}
                  alt="avatar"
                />
              </Avatar>
            </div>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ${
                isEditing ? "scale-100" : "scale-95 opacity-90"
              }`}
            >
              {renderField({
                id: "maSinhVien",
                label: "Mã sinh viên",
                editable: false,
              })}
              {renderField({
                id: "hoTen",
                label: "Họ và tên",
                editable: role === "QUANTRIVIEN",
              })}
              {renderField({
                id: "email",
                label: "Email",
                type: "email",
                editable: true,
              })}
              {renderField({
                id: "gioiTinh",
                label: "Giới tính",
                isSelect: true,
                options: ["Nam", "Nữ"],
                editable: true,
              })}
              {renderField({
                id: "ngaySinh",
                label: "Ngày sinh",
                type: "date",
                editable: true,
              })}
              {renderField({
                id: "noiSinh",
                label: "Nơi sinh",
                editable: true,
              })}
              {renderField({
                id: "lopHoc",
                label: "Lớp học",
                editable: role === "QUANTRIVIEN",
              })}
              {renderField({
                id: "khoaHoc",
                label: "Khóa học",
                editable: role === "QUANTRIVIEN",
              })}
              {renderField({
                id: "bacDaoTao",
                label: "Bậc đào tạo",
                editable: role === "QUANTRIVIEN",
              })}
              {renderField({
                id: "loaiHinhDaoTao",
                label: "Loại hình đào tạo",
                editable: role === "QUANTRIVIEN",
              })}
              {renderField({
                id: "nganh",
                label: "Ngành",
                editable: role === "QUANTRIVIEN",
              })}
              {isEditing &&
                role === "QUANTRIVIEN" &&
                renderField({
                  id: "avatarUrl",
                  label: "Link ảnh đại diện",
                  editable: true,
                })}
            </div>
          </CardContent>
          {isEditing && (
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={saving || loading}
                className="bg-blue-400 hover:bg-blue-700 transition-colors duration-300"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang
                    lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </form>
      </GlassCard>
    </div>
  );
};

export default StudentProfile;
