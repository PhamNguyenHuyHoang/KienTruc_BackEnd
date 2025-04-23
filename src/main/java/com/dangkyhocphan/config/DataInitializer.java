package com.dangkyhocphan.config;

import com.dangkyhocphan.model.*;
import com.dangkyhocphan.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(
            TaiKhoanRepository taiKhoanRepo,
            SinhVienRepository sinhVienRepo,
            QuanTriVienRepository quanTriVienRepo,
            MonHocRepository monHocRepo,
            LopHocPhanRepository lopHocPhanRepo) {
        return args -> {
            System.out.println("Initializing data...");
            // Tạo tài khoản
            TaiKhoan svAccount = new TaiKhoan("TK005", "sv002", "123456", LoaiTaiKhoan.SINHVIEN);
            TaiKhoan qtvAccount = new TaiKhoan("TK006", "qtv001", "123456", LoaiTaiKhoan.QUANTRIVIEN);
            taiKhoanRepo.saveAll(List.of(svAccount, qtvAccount));
            System.out.println("TaiKhoan saved");

            // Tạo sinh viên
            SinhVien sv = new SinhVien("SV002", "Nguyễn Văn A", "sinhvien@example.com", svAccount);
            sinhVienRepo.save(sv);
            System.out.println("SinhVien saved");

            // Tạo quản trị viên
            QuanTriVien qtv = new QuanTriVien("QTV001", "Admin User", "admin@example.com", qtvAccount);
            quanTriVienRepo.save(qtv);
            System.out.println("QuanTriVien saved");

            // Tạo môn học
            MonHoc java = new MonHoc("MH001", "Lập trình Java", 3, "Cơ bản về lập trình Java", List.of(), 30, 15, "Đang mở");
            MonHoc cplusplus = new MonHoc("MH002", "Lập trình C++", 3, "Cơ bản về lập trình C++", List.of(), 30, 15, "Đang mở");
            MonHoc python = new MonHoc("MH003", "Lập trình Python", 3, "Cơ bản về lập trình C++", List.of(), 30, 15, "Đang đóng");
            monHocRepo.saveAll(List.of(java, cplusplus));
            System.out.println("MonHoc saved");

            // Tạo lớp học phần
            LopHocPhan javaLapTrinh1 = new LopHocPhan(
                    "LHP001", java, "Lập trình Java - Nhóm 1", "HK1", "2024-2025",
                    "Thứ 2, 4, 6", "Tiết 1", "Tiết 3", "A101", 50, "Nguyễn Văn T");

            LopHocPhan javaLapTrinh2 = new LopHocPhan(
                    "LHP002", java, "Lập trình Java - Nhóm 2", "HK1", "2024-2025",
                    "Thứ 3, 5, 7", "Tiết 2", "Tiết 4", "B202", 45, "Trần Thị B");

            LopHocPhan cppDaiCuong = new LopHocPhan(
                    "LHP003", cplusplus, "Lập trình C++ - Đại cương", "HK1", "2024-2025",
                    "Thứ 2, 4", "Tiết 5", "Tiết 7", "C301", 60, "Lê Văn C");

            LopHocPhan javaWeb = new LopHocPhan(
                    "LHP004", java, "Lập trình Web với Java", "HK2", "2024-2025",
                    "Thứ 3, 5", "Tiết 8", "Tiết 10", "A102", 40, "Phạm Thị D");

            // Lưu danh sách lớp học phần
            lopHocPhanRepo.saveAll(List.of(javaLapTrinh1, javaLapTrinh2, cppDaiCuong, javaWeb));
            System.out.println("LopHocPhan saved");

        };
    }

}

