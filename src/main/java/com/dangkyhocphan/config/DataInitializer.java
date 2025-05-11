package com.dangkyhocphan.config;

import com.dangkyhocphan.model.*;
import com.dangkyhocphan.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(
            TaiKhoanRepository taiKhoanRepo,
            SinhVienRepository sinhVienRepo,
            QuanTriVienRepository quanTriVienRepo,
            MonHocRepository monHocRepo,
            MonHocTienQuyetRepository monHocTienQuyetRepo,
            HocKyRepository hocKyRepo,
            LopHocPhanRepository lopHocPhanRepo) {
        return args -> {
            System.out.println("Initializing data...");
            // Tạo tài khoản
            TaiKhoan svAccount = new TaiKhoan("TK005", "sv002", "123456", LoaiTaiKhoan.SINHVIEN);
            TaiKhoan qtvAccount = new TaiKhoan("TK006", "qtv001", "123456", LoaiTaiKhoan.QUANTRIVIEN);
            taiKhoanRepo.saveAll(List.of(svAccount, qtvAccount));
            System.out.println("Tai Khoan saved");

            // Tạo sinh viên đầy đủ thông tin
            SinhVien sv = new SinhVien();
            sv.setMaSinhVien("SV002");
            sv.setHoTen("Nguyễn Văn A");
            sv.setEmail("sinhvien@example.com");
            sv.setTaiKhoan(svAccount);
            sv.setGioiTinh("Nam");
            sv.setNgaySinh(LocalDate.of(2002, 1, 24)); // YYYY-MM-DD
            sv.setNoiSinh("Binh Thuận");
            sv.setLopHoc("DHKTPM16A");
            sv.setKhoaHoc("2020 - 2021");
            sv.setBacDaoTao("Dai hoc");
            sv.setLoaiHinhDaoTao("Chính quy");
            sv.setNganh("Ky thuật phần mềm");
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
            MonHoc html = new MonHoc("MH004", "Thiết kế Web với HTML/CSS", 2, "Thiết kế giao diện web cơ bản", List.of(), 30, 15, "Đang mở");
            MonHoc sql = new MonHoc("MH005", "Cơ sở dữ liệu SQL", 3, "Quản lý cơ sở dữ liệu quan hệ", List.of(), 35, 15, "Đang mở");
            MonHoc ai = new MonHoc("MH006", "Trí tuệ nhân tạo", 4, "Giới thiệu về AI", List.of(), 25, 10, "Đang đóng");
            MonHoc ml = new MonHoc("MH007", "Học máy cơ bản", 4, "Thuật toán học máy", List.of(), 30, 10, "Đang mở");
            MonHoc ds = new MonHoc("MH008", "Cấu trúc dữ liệu", 3, "Học các cấu trúc dữ liệu cơ bản", List.of(), 30, 10, "Đang mở");
            MonHoc algo = new MonHoc("MH009", "Giải thuật", 3, "Thiết kế và phân tích thuật toán", List.of(), 30, 10, "Đang mở");
            MonHoc network = new MonHoc("MH010", "Mạng máy tính", 3, "Cơ bản về mạng", List.of(), 30, 10, "Đang đóng");
            MonHoc os = new MonHoc("MH011", "Hệ điều hành", 3, "Quản lý tài nguyên hệ thống", List.of(), 30, 10, "Đang mở");
            MonHoc se = new MonHoc("MH012", "Kỹ thuật phần mềm", 3, "Quản lý quy trình phát triển phần mềm", List.of(), 30, 10, "Đang đóng");
            MonHoc eng = new MonHoc("MH013", "Tiếng Anh chuyên ngành CNTT", 2, "Từ vựng và kỹ năng giao tiếp CNTT", List.of(), 35, 10, "Đang đóng");
            monHocRepo.saveAll(List.of(java, cplusplus, python, html, sql, ai, ml, ds, algo, network, os, se, eng));
            System.out.println("MonHoc saved");

            List<MonHocTienQuyet> tienQuyetList = List.of(
                    new MonHocTienQuyet(null, java, cplusplus),
                    new MonHocTienQuyet(null, ml, ds),
                    new MonHocTienQuyet(null, ml, algo),
                    new MonHocTienQuyet(null, ai, ml),
                    new MonHocTienQuyet(null, algo, ds),
                    new MonHocTienQuyet(null, sql, java),
                    new MonHocTienQuyet(null, se, java),
                    new MonHocTienQuyet(null, os, ds),
                    new MonHocTienQuyet(null, ai, python),
                    new MonHocTienQuyet(null, se, algo)
            );
            monHocTienQuyetRepo.saveAll(tienQuyetList);
            System.out.println("MonHocTienQuyet saved");

            // Tạo học kỳ
            HocKy hkmodangky = new HocKy("HK2", "2024-2025", true);
            hocKyRepo.save(hkmodangky);
            System.out.println("HocKy saved");

            // Tạo lớp học phần
            List<LopHocPhan> themLopHocPhan = List.of(
                    new LopHocPhan("LHP001", python, "DHKDDL18B", "HK1", "2024-2025",
                            "Thứ 2", "Tiết 1", "Tiết 3", "A101", 50, "Nguyễn Văn T"),
                    new LopHocPhan("LHP003", cplusplus, "DHDTMT17A", "HK1", "2024-2025",
                            "Thứ 3", "Tiết 5", "Tiết 7", "C301", 60, "Lê Văn C"),
                    new LopHocPhan("LHP004", java, "DHKTMPM18A", "HK2", "2024-2025",
                            "Thứ 4", "Tiết 8", "Tiết 10", "A102", 40, "Phạm Thị D"),
                    new LopHocPhan("LHP004", java, "DHKTMPM18B", "HK2", "2024-2025",
                            "Thứ 4", "Tiết 8", "Tiết 10", "A103", 40, "Phạm Thị H"),
                    new LopHocPhan("LHP005", html, "DHTKW21A", "HK1", "2024-2025",
                            "Thứ 5", "Tiết 2", "Tiết 3", "B103", 40, "Nguyễn Thị E"),
                    new LopHocPhan("LHP006", sql, "DHCSDL21A", "HK1", "2024-2025",
                            "Thứ 6", "Tiết 5", "Tiết 6", "C204", 40, "Lê Văn F"),
                    new LopHocPhan("LHP007", ai, "DHCTT21A", "HK2", "2024-2025",
                            "Thứ 2", "Tiết 7", "Tiết 9", "A301", 30, "Trần Văn G"),
                    new LopHocPhan("LHP008", ml, "DHML21A", "HK2", "2024-2025",
                            "Thứ 3", "Tiết 7", "Tiết 9", "C101", 30, "Đặng Thị H"),
                    new LopHocPhan("LHP009", ds, "DHCTDL21A", "HK1", "2024-2025",
                            "Thứ 4", "Tiết 3", "Tiết 5", "B302", 45, "Vũ Minh I"),
                    new LopHocPhan("LHP010", algo, "DHGTTT21A", "HK2", "2024-2025",
                            "Thứ 5", "Tiết 6", "Tiết 8", "A202", 35, "Hoàng Kim J"),
                    new LopHocPhan("LHP011", network, "DHMANG21A", "HK1", "2024-2025",
                            "Thứ 6", "Tiết 1", "Tiết 2", "B203", 50, "Ngô Hữu K"),
                    new LopHocPhan("LHP012", os, "DHHDH21A", "HK1", "2024-2025",
                            "Thứ 2", "Tiết 3", "Tiết 5", "C303", 45, "Phạm Thành L"),
                    new LopHocPhan("LHP013", se, "DHKTPM21A", "HK2", "2024-2025",
                            "Thứ 3", "Tiết 6", "Tiết 8", "A105", 40, "Trịnh Thị M"),
                    new LopHocPhan("LHP014", eng, "DHTA21A", "HK1", "2024-2025",
                            "Thứ 4", "Tiết 1", "Tiết 3", "B105", 50, "Nguyễn Văn N"),
                    new LopHocPhan("LHP015", java, "DHKTMPM22A", "HK2", "2024-2025",
                            "Thứ 3", "Tiết 1", "Tiết 3", "A104", 40, "Nguyễn Văn P"),
                    new LopHocPhan("LHP016", ai, "DHCTT22A", "HK2", "2024-2025",
                            "Thứ 4", "Tiết 4", "Tiết 6", "B201", 35, "Lê Thị Q"),
                    new LopHocPhan("LHP017", ml, "DHML22A", "HK2", "2024-2025",
                            "Thứ 5", "Tiết 7", "Tiết 9", "C102", 30, "Trần Văn R"),
                    new LopHocPhan("LHP018", se, "DHKTPM22A", "HK2", "2024-2025",
                            "Thứ 6", "Tiết 2", "Tiết 4", "A106", 40, "Phạm Thị S"),
                    new LopHocPhan("LHP019", algo, "DHGTTT22A", "HK2", "2024-2025",
                            "Thứ 3", "Tiết 6", "Tiết 8", "C205", 35, "Nguyễn Hữu T"),
                    new LopHocPhan("LHP020", os, "DHHDH22A", "HK2", "2024-2025",
                            "Thứ 2", "Tiết 1", "Tiết 3", "C301", 45, "Ngô Minh U"),
                    new LopHocPhan("LHP021", html, "DHTKW22A", "HK2", "2024-2025",
                            "Thứ 2", "Tiết 1", "Tiết 3", "B201", 40, "Nguyễn Văn A"),
                    new LopHocPhan("LHP022", sql, "DHCSDL22A", "HK2", "2024-2025",
                            "Thứ 3", "Tiết 4", "Tiết 6", "C202", 40, "Trần Thị B"),
                    new LopHocPhan("LHP023", python, "DHPYT22A", "HK2", "2024-2025",
                            "Thứ 4", "Tiết 2", "Tiết 4", "A203", 35, "Lê Văn C"),
                    new LopHocPhan("LHP024", ds, "DHCTDL22A", "HK2", "2024-2025",
                            "Thứ 5", "Tiết 3", "Tiết 5", "B303", 45, "Phạm Minh D"),
                    new LopHocPhan("LHP025", network, "DHMANG22A", "HK2", "2024-2025",
                            "Thứ 6", "Tiết 1", "Tiết 2", "C105", 50, "Nguyễn Thị E"),
                    new LopHocPhan("LHP026", se, "DHKTPM22B", "HK2", "2024-2025",
                            "Thứ 3", "Tiết 6", "Tiết 8", "A107", 40, "Hoàng Văn F"),
                    new LopHocPhan("LHP027", ai, "DHCTT22B", "HK2", "2024-2025",
                            "Thứ 4", "Tiết 7", "Tiết 9", "C106", 30, "Đặng Thị G"),
                    new LopHocPhan("LHP028", ml, "DHML22B", "HK2", "2024-2025",
                            "Thứ 5", "Tiết 5", "Tiết 7", "B204", 30, "Trần Văn H"),
                    new LopHocPhan("LHP029", os, "DHHDH22B", "HK2", "2024-2025",
                            "Thứ 6", "Tiết 3", "Tiết 5", "C303", 45, "Phạm Văn I"),
                    new LopHocPhan("LHP030", eng, "DHTA22A", "HK2", "2024-2025",
                            "Thứ 2", "Tiết 4", "Tiết 6", "B102", 50, "Nguyễn Văn K")


            );


            // Lưu danh sách lớp học phần
            lopHocPhanRepo.saveAll(themLopHocPhan);
            System.out.println("LopHocPhan saved");


        };
    }

}

