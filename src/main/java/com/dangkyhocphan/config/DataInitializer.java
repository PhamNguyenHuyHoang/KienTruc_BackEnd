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
            HocPhanRepository hocPhanRepo) {
        return args -> {
            System.out.println("Initializing data...");
            // Tạo tài khoản
            TaiKhoan svAccount = new TaiKhoan("TK005","sv002", "123456", LoaiTaiKhoan.SINHVIEN);
            TaiKhoan qtvAccount = new TaiKhoan("TK006","qtv001", "admin", LoaiTaiKhoan.QUANTRIVIEN);
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
            MonHoc monHoc = new MonHoc("MH001", "Lập trình Java");
            monHocRepo.save(monHoc);
            System.out.println("MonHoc saved");

            // Tạo học phần
            HocPhan hocPhan = new HocPhan("HP001", "Lập trình Java - Nhóm 1", monHoc);
            hocPhanRepo.save(hocPhan);
            System.out.println("HocPhan saved");
        };
    }

}

