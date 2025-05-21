package com.dangkyhocphan.config;

import com.dangkyhocphan.model.*;
import com.dangkyhocphan.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.ArrayList;
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
            NganhHocRepository nganhHocRepo,
            ChuongTrinhKhungRepository ctkkRepo,
            LopHocPhanRepository lopHocPhanRepo) {
        return args -> {
            System.out.println("Initializing data...");
            // xóa hết dữ liệu các bảng (chú ý thứ tự phải tuân cascade / FK)
//            dangKyHocPhanRepo.deleteAll();
//            lichHocRepo.deleteAll();
//            lopHocPhanRepo.deleteAll();
//            monHocTienQuyetRepo.deleteAll();
//            monHocRepo.deleteAll();
//            sinhVienRepo.deleteAll();
//            quanTriVienRepo.deleteAll();
//            taiKhoanRepo.deleteAll();
//            nganhHocRepo.deleteAll();
//            hocKyRepo.deleteAll();

            // Tạo tài khoản
            TaiKhoan svAccount = new TaiKhoan("TK005", "sv002", "$2a$12$n2RMtjiUZg9WzCtRx8lUPuwdt6GsPf3lI7QOhpOR/RIGIMlzjviMS", LoaiTaiKhoan.SINHVIEN);
            TaiKhoan svAccount1 = new TaiKhoan("TK008", "sv001", "$2a$12$n2RMtjiUZg9WzCtRx8lUPuwdt6GsPf3lI7QOhpOR/RIGIMlzjviMS", LoaiTaiKhoan.SINHVIEN);
            TaiKhoan qtvAccount = new TaiKhoan("TK006", "qtv001", "$2a$12$n2RMtjiUZg9WzCtRx8lUPuwdt6GsPf3lI7QOhpOR/RIGIMlzjviMS", LoaiTaiKhoan.QUANTRIVIEN);
            TaiKhoan qtvAccount1 = new TaiKhoan("TK007", "qtv002", "$2a$12$n2RMtjiUZg9WzCtRx8lUPuwdt6GsPf3lI7QOhpOR/RIGIMlzjviMS", LoaiTaiKhoan.QUANTRIVIEN);
            taiKhoanRepo.saveAll(List.of(svAccount,svAccount1,qtvAccount, qtvAccount1));
            System.out.println("Tai Khoan saved");

            // Tạo ngành học
            List<NganhHoc> dsNganh = List.of(
                    new NganhHoc("CNTT", "Công nghệ thông tin", 120, "Hệ thống, lập trình, mạng máy tính."),
                    new NganhHoc("KTPM", "Kỹ thuật phần mềm", 125, "Phát triển và quản lý phần mềm."),
                    new NganhHoc("AI", "Trí tuệ nhân tạo", 130, "Machine learning, deep learning và dữ liệu lớn.")
                    //,
//                    new NganhHoc("ATTT", "An toàn thông tin", 122, "Bảo mật hệ thống, mã hóa và phân tích rủi ro."),
//                    new NganhHoc("HTTT", "Hệ thống thông tin", 118, "Thiết kế hệ thống, quản trị và tích hợp dữ liệu."),
//                    new NganhHoc("CNĐPT", "Công nghệ đa phương tiện", 115, "Thiết kế đồ họa, âm thanh và video số."),
//                    new NganhHoc("KHMT", "Khoa học máy tính", 124, "Giải thuật, ngôn ngữ lập trình và kiến trúc máy tính."),
//                    new NganhHoc("CNPC", "Công nghệ phần cứng", 119, "Thiết kế vi mạch, phần cứng và hệ thống nhúng."),
//                    new NganhHoc("THUD", "Tin học ứng dụng", 110, "Ứng dụng CNTT trong các lĩnh vực khác."),
//                    new NganhHoc("PTDL", "Phân tích dữ liệu", 128, "Khai phá dữ liệu, thống kê và trực quan hóa.")
            );
            nganhHocRepo.saveAll(dsNganh);
            System.out.println("NganhHoc saved");


            // Tạo sinh viên đầy đủ thông tin
            SinhVien sv = new SinhVien();
            sv.setMaSinhVien("sv002");
            sv.setHoTen("Nguyễn Văn A");
            sv.setEmail("sinhvien@example.com");
            sv.setTaiKhoan(svAccount);
            sv.setGioiTinh("Nam");
            sv.setNgaySinh(LocalDate.of(2002, 1, 24));
            sv.setNoiSinh("Binh Thuận");
            sv.setLopHoc("DHKTPM16A");
            sv.setKhoaHoc("2020 - 2021");
            sv.setBacDaoTao("Đại học");
            sv.setLoaiHinhDaoTao("Chính quy");
            sv.setNganhHoc(
                    nganhHocRepo.findById("CNTT")
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy ngành CNTT"))
            );
            sv.setAvatarUrl("https://i.imgur.com/63xBHKu.png");

            SinhVien sv1 = new SinhVien();
            sv1.setMaSinhVien("sv001");
            sv1.setHoTen("Nguyễn Văn B");
            sv1.setEmail("sinhvien1@example.com");
            sv1.setTaiKhoan(svAccount1);
            sv1.setGioiTinh("Nam");
            sv1.setNgaySinh(LocalDate.of(2002, 1, 20));
            sv1.setNoiSinh("Ninh Thuận");
            sv1.setLopHoc("DHKTPM16B");
            sv1.setKhoaHoc("2021 - 2025");
            sv1.setBacDaoTao("Đại học");
            sv1.setLoaiHinhDaoTao("Chính quy");
            sv1.setNganhHoc(
                    nganhHocRepo.findById("KTPM")
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy ngành CNTT"))
            );
            sv.setAvatarUrl("https://i.imgur.com/63xBHKu.png");

            sinhVienRepo.saveAll(List.of(sv, sv1));
            System.out.println("SinhVien saved");

            // Tạo quản trị viên
            QuanTriVien qtv = new QuanTriVien("qtv001", "Admin User", "admin@example.com", qtvAccount);
            quanTriVienRepo.save(qtv);
            System.out.println("QuanTriVien saved");

            // Tạo môn học
            MonHoc java = new MonHoc("MH001", "Lập trình Java", 3, "Cơ bản về lập trình Java", List.of(), 30, 15, "Đang mở");
            MonHoc cplusplus = new MonHoc("MH002", "Lập trình C++", 3, "Cơ bản về lập trình C++", List.of(), 30, 15, "Đang mở");
            MonHoc python = new MonHoc("MH003", "Lập trình Python", 3, "Cơ bản về lập trình Python", List.of(), 30, 15, "Đang mở");
            MonHoc html = new MonHoc("MH004", "Thiết kế Web với HTML/CSS", 2, "Thiết kế giao diện web cơ bản", List.of(), 30, 15, "Đang mở");
            MonHoc sql = new MonHoc("MH005", "Cơ sở dữ liệu SQL", 3, "Quản lý cơ sở dữ liệu quan hệ", List.of(), 35, 15, "Đang mở");
            MonHoc ai = new MonHoc("MH006", "Trí tuệ nhân tạo", 4, "Giới thiệu về AI", List.of(), 25, 10, "Đang mở");
            MonHoc ml = new MonHoc("MH007", "Học máy cơ bản", 4, "Thuật toán học máy", List.of(), 30, 10, "Đang mở");
            MonHoc ds = new MonHoc("MH008", "Cấu trúc dữ liệu", 3, "Học các cấu trúc dữ liệu cơ bản", List.of(), 30, 10, "Đang mở");
            MonHoc algo = new MonHoc("MH009", "Giải thuật", 3, "Thiết kế và phân tích thuật toán", List.of(), 30, 10, "Đang mở");
            MonHoc network = new MonHoc("MH010", "Mạng máy tính", 3, "Cơ bản về mạng", List.of(), 30, 10, "Đang mở");
            MonHoc os = new MonHoc("MH011", "Hệ điều hành", 3, "Quản lý tài nguyên hệ thống", List.of(), 30, 10, "Đang mở");
            MonHoc se = new MonHoc("MH012", "Kỹ thuật phần mềm", 3, "Quản lý quy trình phát triển phần mềm", List.of(), 30, 10, "Đang mở");
            MonHoc eng = new MonHoc("MH013", "Tiếng Anh chuyên ngành CNTT", 2, "Từ vựng và kỹ năng giao tiếp CNTT", List.of(), 35, 10, "Đang mở");
            MonHoc ptpm = new MonHoc("MH203", "Kiểm thử phần mềm", 3, "Các kỹ thuật kiểm thử và đảm bảo chất lượng.", List.of(), 25, 10, "Đang mở");
            MonHoc qlduAn = new MonHoc("MH204", "Quản lý dự án phần mềm", 3, "Quản lý dự án và phương pháp Agile.", List.of(), 25, 10, "Đang mở");
            MonHoc toanAI = new MonHoc("MH301", "Toán học cho AI", 4, "Đại số tuyến tính, xác suất thống kê.", List.of(), 30, 10, "Đang mở");
            MonHoc mlCoBan = new MonHoc("MH302", "Machine Learning cơ bản", 4, "Các thuật toán học máy phổ biến.", List.of(), 30, 10, "Đang mở");
            MonHoc nlp = new MonHoc("MH303", "Xử lý ngôn ngữ tự nhiên (NLP)", 3, "Cơ bản về NLP và ứng dụng.", List.of(), 25, 10, "Đang mở");
            MonHoc deepLearning = new MonHoc("MH304", "Deep Learning", 4, "Mạng neuron sâu, học sâu.", List.of(), 30, 10, "Đang mở");
            MonHoc ungDungAI = new MonHoc("MH305", "Ứng dụng AI", 3, "Các ứng dụng AI trong thực tế.", List.of(), 25, 10, "Đang mở");

            // CHỈ LƯU KHI BẢNG TRỐNG
            if (monHocRepo.count() == 0) {
                monHocRepo.saveAll(List.of(
                        java, cplusplus, python, html, sql,
                        ai, ml, ds, algo, network,
                        os, se, eng, ptpm, qlduAn, toanAI, mlCoBan, nlp, deepLearning, ungDungAI
                ));
                System.out.println("MonHoc saved");
            } else {
                System.out.println("Bảng mon_hoc đã có dữ liệu, bỏ qua bước insert");
            }

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
            List<HocKy> hkmodangky = List.of(
                    new HocKy(new HocKyId("HK1", "2024-2025"), false),
                    new HocKy(new HocKyId("HK2", "2024-2025"), true),
                    new HocKy(new HocKyId("HK3", "2024-2025"), false),
                    new HocKy(new HocKyId("HK1", "2023-2024"), false),
                    new HocKy(new HocKyId("HK2", "2023-2024"), false),
                    new HocKy(new HocKyId("HK3", "2023-2024"), false)
            );
            List<HocKy> toSave = hkmodangky.stream()
                    .filter(hk -> !hocKyRepo.existsById(hk.getId()))
                    .toList();

            if (!toSave.isEmpty()) {
                hocKyRepo.saveAll(toSave);
            }
            System.out.println("HocKy saved");

            // Lấy lại danh sách môn học để dùng
            java = monHocRepo.findById("MH001").get();
            cplusplus = monHocRepo.findById("MH002").get();
            python = monHocRepo.findById("MH003").get();
            html = monHocRepo.findById("MH004").get();
            sql = monHocRepo.findById("MH005").get();
            ai = monHocRepo.findById("MH006").get();
            ml = monHocRepo.findById("MH007").get();
            ds = monHocRepo.findById("MH008").get();
            algo = monHocRepo.findById("MH009").get();
            network = monHocRepo.findById("MH010").get();
            os = monHocRepo.findById("MH011").get();
            se = monHocRepo.findById("MH012").get();
            eng = monHocRepo.findById("MH013").get();
            ptpm = monHocRepo.findById("MH203").get();
            qlduAn = monHocRepo.findById("MH204").get();
            toanAI = monHocRepo.findById("MH301").get();
            mlCoBan = monHocRepo.findById("MH302").get();
            nlp = monHocRepo.findById("MH303").get();
            deepLearning = monHocRepo.findById("MH304").get();
            ungDungAI = monHocRepo.findById("MH305").get();


            // Lấy học kỳ sẵn có (bạn có thể tạo trước hoặc lấy mặc định HK1, HK2...)
            HocKy hk1_24 = hocKyRepo.findById(new HocKyId("HK1", "2024-2025")).orElseThrow();
            HocKy hk2_24 = hocKyRepo.findById(new HocKyId("HK2", "2024-2025")).orElseThrow();
            HocKy hk3_24 = hocKyRepo.findById(new HocKyId("HK3", "2024-2025")).orElseThrow();

            // Lấy ngành học
            NganhHoc cntt = nganhHocRepo.findById("CNTT").orElseThrow();
            NganhHoc ktpm = nganhHocRepo.findById("KTPM").orElseThrow();
            NganhHoc aiNganh = nganhHocRepo.findById("AI").orElseThrow();
            // Tạo danh sách link chương trình khung
            List<ChuongTrinhKhung> dsCTKK = List.of(
                    // CNTT (15 môn)
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH001"), cntt, java, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH002"), cntt, cplusplus, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH004"), cntt, html, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH005"), cntt, sql, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH008"), cntt, ds, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH009"), cntt, algo, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH010"), cntt, network, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH011"), cntt, os, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH013"), cntt, eng, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH003"), cntt, python, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH006"), cntt, ai, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH007"), cntt, ml, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH012"), cntt, se, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH005"), cntt, sql, hk3_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("CNTT", "MH008"), cntt, ds, hk3_24),

                    // KTPM (15 môn)
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH001"), ktpm, java, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH002"), ktpm, cplusplus, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH012"), ktpm, se, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH009"), ktpm, algo, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH008"), ktpm, ds, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH011"), ktpm, os, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH005"), ktpm, sql, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH010"), ktpm, network, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH004"), ktpm, html, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH007"), ktpm, ml, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH006"), ktpm, ai, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH013"), ktpm, eng, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH003"), ktpm, python, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH203"), ktpm, ptpm, hk3_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("KTPM", "MH204"), ktpm, qlduAn, hk3_24),

                    // AI (15 môn)
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH006"), aiNganh, ai, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH007"), aiNganh, ml, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH008"), aiNganh, ds, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH009"), aiNganh, algo, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH301"), aiNganh, toanAI, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH302"), aiNganh, mlCoBan, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH303"), aiNganh, nlp, hk2_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH304"), aiNganh, deepLearning, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH305"), aiNganh, ungDungAI, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH011"), aiNganh, os, hk1_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH004"), aiNganh, html, hk3_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH005"), aiNganh, sql, hk3_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH013"), aiNganh, eng, hk3_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH001"), aiNganh, java, hk3_24),
                    new ChuongTrinhKhung(new ChuongTrinhKhungId("AI", "MH002"), aiNganh, cplusplus, hk3_24)
            );

            // Lưu chương trình khung
            ctkkRepo.saveAll(dsCTKK);
            System.out.println("Đã tạo chương trình khung chi tiết cho 3 ngành CNTT, KTPM, AI.");


            // Tạo lớp học phần
            List<LopHocPhan> themLopHocPhan = List.of(
                    new LopHocPhan("LHP001", python, "DHKDDL18B", hk1_24, "2024-2025",
                            "Thứ 2", "Tiết 1", "Tiết 3", "A101", 50, "Nguyễn Văn T"),
                    new LopHocPhan("LHP002", cplusplus, "DHDTMT17A", hk1_24, "2024-2025",
                            "Thứ 3", "Tiết 5", "Tiết 7", "C301", 60, "Lê Văn C"),
                    new LopHocPhan("LHP003", java, "DHKTMPM18A", hk2_24, "2024-2025",
                            "Thứ 4", "Tiết 8", "Tiết 10", "A102", 40, "Phạm Thị D"),
                    new LopHocPhan("LHP004", java, "DHKTMPM18B", hk2_24, "2024-2025",
                            "Thứ 4", "Tiết 8", "Tiết 10", "A103", 40, "Phạm Thị H"),
                    new LopHocPhan("LHP005", html, "DHTKW21A", hk1_24, "2024-2025",
                            "Thứ 5", "Tiết 2", "Tiết 3", "B103", 40, "Nguyễn Thị E"),
                    new LopHocPhan("LHP006", sql, "DHCSDL21A", hk1_24, "2024-2025",
                            "Thứ 6", "Tiết 5", "Tiết 6", "C204", 40, "Lê Văn F"),
                    new LopHocPhan("LHP007", ai, "DHCTT21A", hk2_24, "2024-2025",
                            "Thứ 2", "Tiết 7", "Tiết 9", "A301", 30, "Trần Văn G"),
                    new LopHocPhan("LHP008", ml, "DHML21A", hk2_24, "2024-2025",
                            "Thứ 3", "Tiết 7", "Tiết 9", "C101", 30, "Đặng Thị H"),
                    new LopHocPhan("LHP009", ds, "DHCTDL21A", hk1_24, "2024-2025",
                            "Thứ 4", "Tiết 3", "Tiết 5", "B302", 45, "Vũ Minh I"),
                    new LopHocPhan("LHP010", algo, "DHGTTT21A", hk2_24, "2024-2025",
                            "Thứ 5", "Tiết 6", "Tiết 8", "A202", 35, "Hoàng Kim J"),
                    new LopHocPhan("LHP011", network, "DHMANG21A", hk1_24, "2024-2025",
                            "Thứ 6", "Tiết 1", "Tiết 2", "B203", 50, "Ngô Hữu K"),
                    new LopHocPhan("LHP012", os, "DHHDH21A", hk1_24, "2024-2025",
                            "Thứ 2", "Tiết 3", "Tiết 5", "C303", 45, "Phạm Thành L"),
                    new LopHocPhan("LHP013", se, "DHKTPM21A", hk2_24, "2024-2025",
                            "Thứ 3", "Tiết 6", "Tiết 8", "A105", 40, "Trịnh Thị M"),
                    new LopHocPhan("LHP014", eng, "DHTA21A", hk1_24, "2024-2025",
                            "Thứ 4", "Tiết 1", "Tiết 3", "B105", 50, "Nguyễn Văn N"),
                    new LopHocPhan("LHP015", java, "DHKTMPM22A", hk2_24, "2024-2025",
                            "Thứ 3", "Tiết 1", "Tiết 3", "A104", 40, "Nguyễn Văn P"),
                    new LopHocPhan("LHP016", ai, "DHCTT22A", hk2_24, "2024-2025",
                            "Thứ 4", "Tiết 4", "Tiết 6", "B201", 35, "Lê Thị Q"),
                    new LopHocPhan("LHP017", ml, "DHML22A", hk2_24, "2024-2025",
                            "Thứ 5", "Tiết 7", "Tiết 9", "C102", 30, "Trần Văn R"),
                    new LopHocPhan("LHP018", se, "DHKTPM22A", hk2_24, "2024-2025",
                            "Thứ 6", "Tiết 2", "Tiết 4", "A106", 40, "Phạm Thị S"),
                    new LopHocPhan("LHP019", algo, "DHGTTT22A", hk2_24, "2024-2025",
                            "Thứ 3", "Tiết 6", "Tiết 8", "C205", 35, "Nguyễn Hữu T"),
                    new LopHocPhan("LHP020", os, "DHHDH22A", hk2_24, "2024-2025",
                            "Thứ 2", "Tiết 1", "Tiết 3", "C301", 45, "Ngô Minh U"),
                    new LopHocPhan("LHP021", html, "DHTKW22A", hk2_24, "2024-2025",
                            "Thứ 2", "Tiết 1", "Tiết 3", "B201", 40, "Nguyễn Văn A"),
                    new LopHocPhan("LHP022", sql, "DHCSDL22A", hk2_24, "2024-2025",
                            "Thứ 3", "Tiết 4", "Tiết 6", "C202", 40, "Trần Thị B"),
                    new LopHocPhan("LHP023", python, "DHPYT22A", hk2_24, "2024-2025",
                            "Thứ 4", "Tiết 2", "Tiết 4", "A203", 35, "Lê Văn C"),
                    new LopHocPhan("LHP024", ds, "DHCTDL22A", hk2_24, "2023-2024",
                            "Thứ 5", "Tiết 3", "Tiết 5", "B303", 45, "Phạm Minh D"),
                    new LopHocPhan("LHP025", network, "DHMANG22A", hk2_24, "2023-2024",
                            "Thứ 6", "Tiết 1", "Tiết 2", "C105", 50, "Nguyễn Thị E"),
                    new LopHocPhan("LHP026", se, "DHKTPM22B", hk2_24, "2024-2025",
                            "Thứ 3", "Tiết 6", "Tiết 8", "A107", 40, "Hoàng Văn F"),
                    new LopHocPhan("LHP027", ai, "DHCTT22B", hk2_24, "2024-2025",
                            "Thứ 4", "Tiết 7", "Tiết 9", "C106", 30, "Đặng Thị G"),
                    new LopHocPhan("LHP028", ml, "DHML22B", hk2_24, "2023-2024",
                            "Thứ 5", "Tiết 5", "Tiết 7", "B204", 30, "Trần Văn H"),
                    new LopHocPhan("LHP029", os, "DHHDH22B", hk2_24, "2024-2025",
                            "Thứ 6", "Tiết 3", "Tiết 5", "C303", 45, "Phạm Văn I"),
                    new LopHocPhan("LHP030", eng, "DHTA22A", hk2_24, "2023-2024",
                            "Thứ 2", "Tiết 4", "Tiết 6", "B102", 50, "Nguyễn Văn K")
            );

            // Lưu danh sách lớp học phần
            lopHocPhanRepo.saveAll(themLopHocPhan);
            System.out.println("LopHocPhan saved");

        };
    }

}

