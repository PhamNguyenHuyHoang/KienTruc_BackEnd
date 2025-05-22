// src/components/PrivateRoute.js (Hoặc nơi bạn lưu component này)
import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { getUserInfoFromToken } from '../api/axios'; // Import hàm helper

const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation(); // Lấy vị trí hiện tại để chuyển hướng sau khi login

  // Sử dụng hàm helper để kiểm tra token và lấy thông tin user
  const userInfo = getUserInfoFromToken();

  // Nếu không có thông tin user (không có token, token hết hạn, hoặc lỗi giải mã)
  if (!userInfo) {
    console.log("PrivateRoute: No valid user info found, redirecting to login.");
    // Xóa thông tin cũ (đề phòng trường hợp token hết hạn nhưng vẫn còn trong localStorage)
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // Lưu lại trang muốn truy cập để redirect sau khi login thành công
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Lấy vai trò từ thông tin user đã giải mã
  const userRole = userInfo.role;

  // Nếu route yêu cầu vai trò cụ thể và user không có vai trò đó
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log(`PrivateRoute: Role mismatch. Required: ${allowedRoles}, User has: ${userRole}. Redirecting to unauthorized.`);
    // Chuyển về trang báo lỗi không có quyền
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu mọi thứ hợp lệ -> Cho phép truy cập component con
  console.log(`PrivateRoute: Access granted. Role: ${userRole}`);
  return children;
};

export default PrivateRoute;
