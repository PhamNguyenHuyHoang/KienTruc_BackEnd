package com.dangkyhocphan.service;

import com.dangkyhocphan.dto.DangKyHocPhanDTO;
import com.dangkyhocphan.dto.DangKyHocPhanDTO2;
import com.dangkyhocphan.dto.DangKyHocPhanRequest;
import com.dangkyhocphan.dto.LichHocResponse;
import com.dangkyhocphan.model.DangKyHocPhan;
import com.dangkyhocphan.model.LichHoc;
import com.dangkyhocphan.model.LopHocPhan;
import com.dangkyhocphan.model.SinhVien;
import com.dangkyhocphan.repository.DangKyHocPhanRepository;
import com.dangkyhocphan.repository.LichHocRepository;
import com.dangkyhocphan.repository.LopHocPhanRepository;
import com.dangkyhocphan.repository.SinhVienRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DangKyHocPhanService {

    @Autowired
    private DangKyHocPhanRepository dangKyHocPhanRepository;

    @Autowired
    private SinhVienRepository sinhVienRepository;

    @Autowired
    private LopHocPhanRepository lopHocPhanRepository;

    @Autowired
    private LichHocRepository lichHocRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Đăng ký học phần
    @Transactional
    public String dangKyHocPhan(DangKyHocPhanRequest request) {
        String maSinhVien = request.getMaSinhVien();
        String maLopHocPhan = request.getMaLopHocPhan();
        String maDK = generateMaDK();
        kiemTraThoiGianChoPhep();

        SinhVien sinhVien = sinhVienRepository.findById(maSinhVien)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sinh viên: " + maSinhVien));

        LopHocPhan lopHocPhanMoi = lopHocPhanRepository.findById(maLopHocPhan)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lớp học phần: " + maLopHocPhan));

        List<DangKyHocPhan> daDangKyList = dangKyHocPhanRepository.findBySinhVien_MaSinhVien(maSinhVien);

        if (daDangKyList.size() >= 8) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chỉ được đăng ký tối đa 6 học phần.");
        }

        int tongTinChi = daDangKyList.stream()
                .mapToInt(dk -> dk.getLopHocPhan().getMonHoc().getSoTinChi())
                .sum();
        int tinChiMoi = lopHocPhanMoi.getMonHoc().getSoTinChi();
        if (tongTinChi + tinChiMoi > 30) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tổng số tín chỉ vượt quá giới hạn cho phép là 30.");
        }

        boolean trungMon = daDangKyList.stream()
                .anyMatch(dk -> dk.getLopHocPhan().getMonHoc().getMaMonHoc()
                        .equals(lopHocPhanMoi.getMonHoc().getMaMonHoc()));
        if (trungMon) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã đăng ký môn học này ở lớp khác rồi.");
        }

        if (isTrungLichHoc(maSinhVien, maLopHocPhan) || isTrungLichHoc_LichHoc(maSinhVien, maLopHocPhan)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lớp học phần bị trùng lịch với lớp bạn đã đăng ký.");
        }

        String loaiBuoi = "LT";
        String tenMon = lopHocPhanMoi.getMonHoc().getTenMonHoc().toLowerCase();
        if (tenMon.contains("thực hành")) loaiBuoi = "TN";
        if (tenMon.contains("thi") || tenMon.contains("kiểm tra")) loaiBuoi = "THI";

        autoGenerateLichHocIfMissing(lopHocPhanMoi, LocalDate.of(2025, 5, 5), LocalDate.of(2025, 9, 15), loaiBuoi);

        DangKyHocPhan dangKy = new DangKyHocPhan();
        dangKy.setMaDK(maDK);
        dangKy.setSinhVien(sinhVien);
        dangKy.setLopHocPhan(lopHocPhanMoi);
        dangKy.setThoiGianDangKy(LocalDateTime.now());

        dangKyHocPhanRepository.save(dangKy);
        return "Đăng ký thành công với mã: " + maDK;
    }
//    // Đăng ký học phần
//    @Transactional
//    public String dangKyHocPhan(DangKyHocPhanRequest request) {
//        String maSinhVien = request.getMaSinhVien();
//        String maLopHocPhan = request.getMaLopHocPhan();
//        String maDK = generateMaDK();
//        kiemTraThoiGianChoPhep();
//
//        if (dangKyHocPhanRepository.existsById(maDK)) {
//            throw new RuntimeException("Mã đăng ký " + maDK + " đã tồn tại (lỗi hệ thống).");
//        }
//
//        SinhVien sinhVien = sinhVienRepository.findById(maSinhVien)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên: " + maSinhVien));
//
//        LopHocPhan lopHocPhanMoi = lopHocPhanRepository.findById(maLopHocPhan)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần: " + maLopHocPhan));
//
//        List<DangKyHocPhan> daDangKyList = dangKyHocPhanRepository.findBySinhVien_MaSinhVien(maSinhVien);
//
//        if (daDangKyList.size() >= 6) {
//            throw new RuntimeException("Bạn đã đăng ký đủ số lượng lớp học phần cho phép.");
//        }
//
//        int tongTinChi = daDangKyList.stream()
//                .mapToInt(dk -> dk.getLopHocPhan().getMonHoc().getSoTinChi())
//                .sum();
//        int tinChiMoi = lopHocPhanMoi.getMonHoc().getSoTinChi();
//        if (tongTinChi + tinChiMoi > 30) {
//            throw new RuntimeException("Vượt quá giới hạn tín chỉ cho phép.");
//        }
//
//        boolean trungMon = daDangKyList.stream()
//                .anyMatch(dk -> dk.getLopHocPhan().getMonHoc().getMaMonHoc()
//                        .equals(lopHocPhanMoi.getMonHoc().getMaMonHoc()));
//        if (trungMon) {
//            throw new RuntimeException("Bạn đã đăng ký môn học này ở lớp khác rồi.");
//        }
//
//        if (isTrungLichHoc_LichHoc(maSinhVien, maLopHocPhan)) {
//            throw new RuntimeException("Lớp học phần này bị trùng lịch với lớp bạn đã đăng ký.");
//        }
//
//        // ✅ Xác định loại buổi dựa trên tên môn học
//        String loaiBuoi = "LT";
//        String tenMon = lopHocPhanMoi.getMonHoc().getTenMonHoc().toLowerCase();
//        if (tenMon.contains("thực hành")) loaiBuoi = "TN";
//        if (tenMon.contains("thi") || tenMon.contains("kiểm tra")) loaiBuoi = "THI";
//
//        autoGenerateLichHocIfMissing(lopHocPhanMoi, LocalDate.of(2025, 5, 5), loaiBuoi);
//
//        DangKyHocPhan dangKy = new DangKyHocPhan();
//        dangKy.setMaDK(maDK);
//        dangKy.setSinhVien(sinhVien);
//        dangKy.setLopHocPhan(lopHocPhanMoi);
//        dangKy.setThoiGianDangKy(LocalDateTime.now());
//
//        dangKyHocPhanRepository.save(dangKy);
//        return "Đăng ký thành công với mã: " + maDK;
//    }

    private void autoGenerateLichHocIfMissing(
            LopHocPhan lop,
            LocalDate ngayBatDauTuan,
            LocalDate ngayKetThucHocKy,
            String loaiBuoi
    ) {
        if ("THI".equalsIgnoreCase(loaiBuoi)) return;

        List<LichHoc> lichDaCo = lichHocRepository.findByLopHocPhan_MaLopHocPhan(lop.getMaLopHocPhan());
        if (!lichDaCo.isEmpty()) return;

        int tietBD = Integer.parseInt(lop.getTietBatDau().replaceAll("\\D+", ""));
        int tietKT = Integer.parseInt(lop.getTietKetThuc().replaceAll("\\D+", ""));
        int soTietMotBuoi = tietKT - tietBD + 1;

        int soTinChi = lop.getMonHoc().getSoTinChi();
        int tongSoTiet = 15 * soTinChi;
        int tongSoBuoi = (int) Math.ceil((double) tongSoTiet / soTietMotBuoi);

        DayOfWeek dayOfWeek = switch (lop.getThu().toLowerCase()) {
            case "thứ 2" -> DayOfWeek.MONDAY;
            case "thứ 3" -> DayOfWeek.TUESDAY;
            case "thứ 4" -> DayOfWeek.WEDNESDAY;
            case "thứ 5" -> DayOfWeek.THURSDAY;
            case "thứ 6" -> DayOfWeek.FRIDAY;
            case "thứ 7" -> DayOfWeek.SATURDAY;
            case "chủ nhật" -> DayOfWeek.SUNDAY;
            default -> DayOfWeek.MONDAY;
        };

        LocalDate ngayHocDauTien = ngayBatDauTuan.with(dayOfWeek);
        List<LichHoc> danhSach = new ArrayList<>();

        for (int i = 0; i < tongSoBuoi; i++) {
            LocalDate ngayHoc = ngayHocDauTien.plusWeeks(i);
            if (ngayHoc.isAfter(ngayKetThucHocKy)) break;

            LichHoc lh = new LichHoc();
            lh.setMaLichHoc(lop.getMaLopHocPhan() + "-" + i);
            lh.setThu(lop.getThu());
            lh.setTietBatDau(String.valueOf(tietBD));
            lh.setTietKetThuc(String.valueOf(tietKT));
            lh.setDiaDiem(lop.getDiaDiem());
            lh.setGiangVien(lop.getGiangVien());
            lh.setNgayHoc(ngayHoc);
            lh.setLopHocPhan(lop);
            lh.setLoaiBuoi(loaiBuoi);
            danhSach.add(lh);
        }

        lichHocRepository.saveAll(danhSach);
        System.out.println("✅ Đã tạo " + danhSach.size() + " lịch học cho lớp " + lop.getMaLopHocPhan());
    }




    // Thay thế cơ chế generate mã DK bằng sequence_generator table
    @Transactional
    public String generateMaDK() {
        Integer currentValue = jdbcTemplate.queryForObject(
                "SELECT value FROM sequence_generator WHERE id = ? FOR UPDATE",
                new Object[]{"DK"},
                Integer.class
        );

        int nextValue = (currentValue != null) ? currentValue + 1 : 1000;

        jdbcTemplate.update(
                "UPDATE sequence_generator SET value = ? WHERE id = ?",
                nextValue, "DK"
        );

        return String.format("DK%03d", nextValue);
    }


    // Lấy danh sách lớp học phần đã đăng ký của sinh viên
    public List<DangKyHocPhan> getHocPhanDaDangKy(String maSinhVien) {
        return dangKyHocPhanRepository.findBySinhVien_MaSinhVien(maSinhVien);
    }
    // Lấy lịch học theo tuần của sinh viên
    public List<LichHocResponse> getLichHocTheoTuan(String maSinhVien) {
        List<DangKyHocPhan> danhSach = dangKyHocPhanRepository.findBySinhVien_MaSinhVien(maSinhVien);

        List<LichHocResponse> lichHocResponses = new ArrayList<>();

        for (DangKyHocPhan dk : danhSach) {
            String maLopHocPhan = dk.getLopHocPhan().getMaLopHocPhan();
            List<LichHoc> lichHocList = lichHocRepository.findByLopHocPhan_MaLopHocPhan(maLopHocPhan);

            for (LichHoc lh : lichHocList) {
                lichHocResponses.add(new LichHocResponse(
                        maLopHocPhan,
                        dk.getLopHocPhan().getMonHoc().getTenMonHoc(),
                        lh.getThu(),
                        lh.getTietBatDau(),
                        lh.getTietKetThuc(),
                        lh.getDiaDiem(),
                        lh.getGiangVien(),
                        lh.getNgayHoc(),
                        lh.getLoaiBuoi() // ✅ thêm trường này
                ));
            }
        }

        return lichHocResponses;
    }

    // Lấy danh sách tất cả đăng ký học phần
    public List<DangKyHocPhan> getAllDangKy() {
        return dangKyHocPhanRepository.findAll();
    }

    // Hủy đăng ký học phần
    public String huyDangKyHocPhan(DangKyHocPhanRequest request) {
        kiemTraThoiGianChoPhep();
        DangKyHocPhan dk = dangKyHocPhanRepository.findBySinhVien_MaSinhVienAndLopHocPhan_MaLopHocPhan(
                request.getMaSinhVien(), request.getMaLopHocPhan()
        ).orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký để hủy."));

        dangKyHocPhanRepository.delete(dk);
        return "Hủy đăng ký thành công!";
    }

    // Chuyển đổi từ DangKyHocPhan sang DangKyHocPhanDTO
    public DangKyHocPhanDTO toDTO(DangKyHocPhan dangKyHocPhan) {
        if (dangKyHocPhan == null) {
            return null;
        }
        return new DangKyHocPhanDTO(
                dangKyHocPhan.getMaDK(),
                dangKyHocPhan.getLopHocPhan().getMaLopHocPhan(),
                dangKyHocPhan.getLopHocPhan().getTenLopHocPhan(),
                dangKyHocPhan.getLopHocPhan().getMonHoc().getMaMonHoc(),
                dangKyHocPhan.getLopHocPhan().getMonHoc().getTenMonHoc(),
                dangKyHocPhan.getThoiGianDangKy()
        );
    }

    // Kiểm tra xem sinh viên có bị trùng lịch khi đăng ký học phần mới không.
    public boolean isTrungLichHoc(String maSinhVien, String maLopHocPhanMoi) {
        // 1. Kiểm tra sinh viên tồn tại
        SinhVien sinhVien = sinhVienRepository.findById(maSinhVien)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên: " + maSinhVien));

        // 2. Kiểm tra lớp học phần mới tồn tại
        LopHocPhan lopHocPhanMoi = lopHocPhanRepository.findById(maLopHocPhanMoi)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần: " + maLopHocPhanMoi));

        // 3. Lấy toàn bộ lớp học phần đã đăng ký
        List<DangKyHocPhan> daDangKyList = dangKyHocPhanRepository.findBySinhVien_MaSinhVien(maSinhVien);

        for (DangKyHocPhan dangKy : daDangKyList) {
            LopHocPhan lopDaDangKy = dangKy.getLopHocPhan();

            // Nếu cùng thứ
            if (lopDaDangKy.getThu().equalsIgnoreCase(lopHocPhanMoi.getThu())) {
                try {
                    int start1 = Integer.parseInt(lopDaDangKy.getTietBatDau().replaceAll("\\D+", ""));
                    int end1 = Integer.parseInt(lopDaDangKy.getTietKetThuc().replaceAll("\\D+", ""));

                    int start2 = Integer.parseInt(lopHocPhanMoi.getTietBatDau().replaceAll("\\D+", ""));
                    int end2 = Integer.parseInt(lopHocPhanMoi.getTietKetThuc().replaceAll("\\D+", ""));


                    // Kiểm tra trùng lịch
                    boolean isTrungLich = (start1 <= end2 && start2 <= end1);

                    if (isTrungLich) return true;

                } catch (NumberFormatException e) {
                    throw new RuntimeException("Lỗi định dạng tiết học. Vui lòng đảm bảo tiết là số nguyên.");
                }
            }
        }
        return false;
    }

    //    Cấu hình mốc thời gian
    private final LocalDateTime startTime = LocalDateTime.of(2025, 4, 15, 0, 0);
    private final LocalDateTime endTime = LocalDateTime.of(2025, 6, 20, 23, 59);

    // Kiểm tra thời gian cho phép đăng ký/hủy học phần
    private void kiemTraThoiGianChoPhep() {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(startTime) || now.isAfter(endTime)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Hiện tại không nằm trong thời gian cho phép đăng ký/hủy học phần.");
        }
    }

    public boolean isTrongThoiGianChoPhep() {
        LocalDateTime now = LocalDateTime.now();
        return !(now.isBefore(startTime) || now.isAfter(endTime));
    }


    // Hủy toàn bộ đăng ký học phần của sinh viên chỉ quản trị viên có quyền
    @Transactional
    public String huyTatCaDangKyCuaSinhVien(String maSinhVien) {
        SinhVien sv = sinhVienRepository.findById(maSinhVien)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên: " + maSinhVien));

        List<DangKyHocPhan> danhSach = dangKyHocPhanRepository.findBySinhVien_MaSinhVien(maSinhVien);

        if (danhSach.isEmpty()) {
            return "Sinh viên chưa đăng ký học phần nào.";
        }

        dangKyHocPhanRepository.deleteAll(danhSach);
        return "Đã huỷ toàn bộ đăng ký học phần cho sinh viên " + maSinhVien;
    }

    // Kiểm tra xem lớp học phần mới có bị trùng lịch với lớp đã đăng ký không
    public boolean isTrungLichHoc_LichHoc(String maSinhVien, String maLopHocPhanMoi) {
        SinhVien sinhVien = sinhVienRepository.findById(maSinhVien)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên: " + maSinhVien));

        LopHocPhan lopMoi = lopHocPhanRepository.findById(maLopHocPhanMoi)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần: " + maLopHocPhanMoi));

        // Lấy tất cả lịch học của lớp học phần mới
        List<LichHoc> lichHocMoiList = lichHocRepository.findByLopHocPhan_MaLopHocPhan(maLopHocPhanMoi);

        // Lấy tất cả lớp học phần đã đăng ký
        List<DangKyHocPhan> daDangKy = dangKyHocPhanRepository.findBySinhVien_MaSinhVien(maSinhVien);

        for (DangKyHocPhan dk : daDangKy) {
            List<LichHoc> lichHocDaDangKy = lichHocRepository.findByLopHocPhan_MaLopHocPhan(
                    dk.getLopHocPhan().getMaLopHocPhan());

            for (LichHoc lichMoi : lichHocMoiList) {
                for (LichHoc lichCu : lichHocDaDangKy) {
                    if (lichMoi.getThu().equalsIgnoreCase(lichCu.getThu())) {
                        try {
                            int startMoi = Integer.parseInt(lichMoi.getTietBatDau().replaceAll("\\D+", ""));
                            int endMoi = Integer.parseInt(lichMoi.getTietKetThuc().replaceAll("\\D+", ""));

                            int startCu = Integer.parseInt(lichCu.getTietBatDau().replaceAll("\\D+", ""));
                            int endCu = Integer.parseInt(lichCu.getTietKetThuc().replaceAll("\\D+", ""));


                            boolean isTrung = (startMoi <= endCu && startCu <= endMoi);
                            if (isTrung) {
                                System.out.println("Lịch trùng với lớp: " + dk.getLopHocPhan().getMaLopHocPhan());
                                return true;
                            }
                        } catch (NumberFormatException e) {
                            throw new RuntimeException("Tiết học phải là số nguyên", e);
                        }
                    }
                }
            }
        }

        return false;
    }

    public List<DangKyHocPhanDTO2> getHocPhanDaDangKy2(String maSinhVien) {
        List<DangKyHocPhan> danhSach = dangKyHocPhanRepository.findBySinhVien_MaSinhVien(maSinhVien);
        return danhSach.stream().map(dk -> new DangKyHocPhanDTO2(
                dk.getMaDK(),
                dk.getLopHocPhan().getMaLopHocPhan(),
                dk.getLopHocPhan().getTenLopHocPhan(),
                dk.getLopHocPhan().getMonHoc().getMaMonHoc(),
                dk.getLopHocPhan().getMonHoc().getTenMonHoc(),
                dk.getLopHocPhan().getMonHoc().getSoTinChi(),
                dk.getThoiGianDangKy()
        )).toList();
    }

}