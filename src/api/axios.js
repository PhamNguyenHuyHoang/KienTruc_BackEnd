// src/api/axios.js
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // ---> 1. Import jwt-decode (cài đặt: npm install jwt-decode)

import axiosRetry from "axios-retry"; // Thêm axios-retry để tự động retry request khi gặp lỗi mạng

// ---> 2. Sử dụng biến môi trường cho BASE_URL
const BASE_URL =
  process.env.REACT_APP_BACKEND_API_URL || "http://localhost:9090/api";
// Tạo file .env ở thư mục gốc project nếu chưa có và thêm dòng:
// REACT_APP_BACKEND_API_URL=http://localhost:9090/api
// Hoặc thay bằng URL backend thực tế của bạn khi deploy

// 👉 Instance chính: dùng sau khi đăng nhập (có token)
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, // Thời gian timeout 5 giây TimeLimiter
  headers: {
    "Content-Type": "application/json",
  },
});

// cấu hình retry ngay sau khi tạo instance
// Retry: tự động thử lại 2 lần nếu gặp lỗi mạng hoặc 5xx TimeLimiter
axiosRetry(api, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (err) =>
    axiosRetry.isNetworkError(err) || err.response?.status >= 500,
});

// Request Interceptor: Tự động thêm token vào header (Giữ nguyên)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "✅ Authorization set in header:",
        config.headers.Authorization
      );
    } else {
      console.warn("❌ Không có token trong localStorage");
    }
    console.log("➡️ Request bắt đầu:", config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// ---> 3. Thêm Response Interceptor để xử lý lỗi chung
api.interceptors.response.use(
  (response) => {
    // Log response thành công nếu cần debug
    console.log("API Response:", response);
    return response; // Trả về response nếu thành công
  },
  (error) => {
    console.error("API Error:", error.response || error.message); // Log lỗi chi tiết hơn

    // Xử lý lỗi 401 (Unauthorized) - Token không hợp lệ/hết hạn
    if (error.response && error.response.status === 401) {
      console.warn(
        "Unauthorized (401). Token might be invalid or expired. Logging out."
      );
      // Xóa token và role khỏi localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      // Chuyển hướng về trang đăng nhập
      // Dùng window.location.href để đảm bảo reload hoàn toàn, xóa state cũ
      if (window.location.pathname !== "/login") {
        // Tránh reload vòng lặp nếu đang ở trang login
        window.location.href = "/login";
        // Có thể hiển thị thông báo cho người dùng trước khi chuyển hướng
        alert(
          "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
        );
      }
    }

    // Xử lý các lỗi khác nếu cần (ví dụ: 403 Forbidden, 500 Server Error)
    // if (error.response && error.response.status === 403) {
    //   console.warn("Forbidden (403). User does not have permission.");
    //   // Có thể hiển thị thông báo không có quyền
    // }

    // Quan trọng: Reject promise để component gọi API biết là đã có lỗi xảy ra
    return Promise.reject(error);
  }
);

// 👉 Instance publicApi: dùng cho login, register (Giữ nguyên)
const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---> 4. Thêm hàm tiện ích để lấy thông tin từ Token
/**
 * Giải mã JWT token từ localStorage và trả về thông tin user.
 * @returns {object|null} Object chứa thông tin user (ví dụ: { username, role }) hoặc null nếu không có token hoặc lỗi.
 */
export const getUserInfoFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found in localStorage.");
    return null;
  }
  try {
    const decoded = jwtDecode(token);
    // Log để kiểm tra nội dung token được giải mã
    // console.log("Decoded Token:", decoded);

    // Giả sử token của bạn chứa username trong trường 'sub' (subject)
    // và role trong trường 'roles' (là một mảng)
    const userInfo = {
      username: decoded.sub, // 'sub' thường chứa username hoặc ID
      // Lấy role đầu tiên từ mảng roles (nếu có)
      role:
        Array.isArray(decoded.roles) && decoded.roles.length > 0
          ? decoded.roles[0]
          : null,
      // Bạn có thể thêm các trường khác từ token nếu cần
      // iat: decoded.iat, // Issued at
      // exp: decoded.exp, // Expiration time
    };

    // Kiểm tra xem token đã hết hạn chưa phía client (dù server và interceptor đã kiểm tra)
    const currentTime = Date.now() / 1000; // đổi sang giây
    if (decoded.exp && decoded.exp < currentTime) {
      console.warn("Token has expired (client-side check).");
      // Có thể thực hiện logout ở đây nếu cần thiết, dù interceptor sẽ xử lý khi gọi API tiếp theo
      // localStorage.removeItem("token");
      // localStorage.removeItem("role");
      // window.location.href = '/login';
      return null; // Coi như không có user info hợp lệ
    }

    console.log("User info from token:", userInfo);
    return userInfo;
  } catch (error) {
    console.error("Error decoding token:", error);
    // Token không hợp lệ -> Xóa token cũ và logout
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    if (window.location.pathname !== "/login") {
      // window.location.href = '/login'; // Cân nhắc việc tự động redirect ở đây
    }
    return null;
  }
};

export { api, publicApi }; // Giữ nguyên export
