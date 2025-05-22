// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterForm from "./components/RegisterForm"; // Giả sử đường dẫn đúng

// Import Student components
import StudentLayout from "./pages/student/StudentLayout"; // Import layout mới
// import StudentDashboardContent from "./pages/student/StudentDashboardContent"; // Import nội dung dashboard
import StudentDashboardContent from "./pages/student/StudentDashboardContent";
import StudentCourseList from "./pages/student/StudentCourseList";
import StudentRegistration from "./pages/student/StudentRegistration";
import StudentSchedule from "./pages/student/StudentSchedule";
import StudentHistory from "./pages/student/StudentHistory";
import StudentProfile from "./pages/student/StudentProfile";
import ChangePassword from "./pages/student/ChangePassword";
import ChuongTrinhKhungList from "./pages/student/ChuongTrinhKhungList";
// ---
import PrivateRoute from "./components/PrivateRoute"; // Giả sử đường dẫn đúng
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized"; // Giả sử bạn có component này
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Admin components
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminCourses from "./pages/admin/AdminCourses";
// import AdminLecturers from "./pages/admin/AdminLecturers";
import AdminSubjects from "./pages/admin/AdminSubjects";
import AdminConflicts from "./pages/admin/AdminConflicts";
import AdminReports from "./pages/admin/AdminReports";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminNganhHoc from "./pages/admin/AdminNganhHoc";
import AdminChuongTrinhKhung from "./pages/admin/AdminChuongTrinhKhung";
import AdminAdministrators from "./pages/admin/AdminAdministrators";

import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

function AnimatedRoutes() {
  const location = useLocation(); // Đặt bên trong Router context

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        f{/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Admin Protected Routes */}
        <Route
          path="/pages/admin"
          element={
            <PrivateRoute allowedRoles={["QUANTRIVIEN"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          {/* <Route path="lecturers" element={<AdminLecturers />} /> */}
          <Route path="subjects" element={<AdminSubjects />} />
          <Route path="nganhhoc" element={<AdminNganhHoc />} />
          <Route path="chuongtrinhkhung" element={<AdminChuongTrinhKhung />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="conflicts" element={<AdminConflicts />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="administrators" element={<AdminAdministrators />} />
        </Route>
        {/* Student Protected Routes */}
        <Route
          path="/pages/student"
          element={
            <PrivateRoute allowedRoles={["SINHVIEN"]}>
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<StudentDashboardContent />} />
          <Route path="dashboard" element={<StudentDashboardContent />} />
          <Route path="courses" element={<StudentCourseList />} />
          <Route path="register-courses" element={<StudentRegistration />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="history" element={<StudentHistory />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="chuongtrinhkhung" element={<ChuongTrinhKhungList />} />
        </Route>
        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
