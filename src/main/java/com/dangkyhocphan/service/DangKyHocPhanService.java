package com.dangkyhocphan.service;

import com.dangkyhocphan.dto.DangKyHocPhanDTO;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

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
    // Đăng ký học phần
    @Transactional
    public String dangKyHocPhan(DangKyHocPhanRequest request) {
        String maSinhVien = request.getMaSinhVien();
        String maLopHocPhan = request.getMaLopHocPhan();
        String maDK = generateMaDK();
        kiemTraThoiGianChoPhep();
        if (dangKyHocPhanRepository.existsById(maDK)) {
            throw new RuntimeException("Mã đăng ký " + maDK + " đã tồn tại (lỗi hệ thống).");
        }

        // ✅ Kiểm tra sinh viên & lớp học phần tồn tại
        SinhVien sinhVien = sinhVienRepository.findById(maSinhVien)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên: " + maSinhVien));

        LopHocPhan lopHocPhanMoi = lopHocPhanRepository.findById(maLopHocPhan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần: " + maLopHocPhan));

        // ✅ Lấy danh sách các lớp đã đăng ký
        List<DangKyHocPhan> daDangKyList = dangKyHocPhanRepository.findBySinhVien_MaSinhVien(maSinhVien);

        // ✅ 1. Giới hạn số lượng lớp học phần (ví dụ: 6 lớp)
        if (daDangKyList.size() >= 6) {
            throw new RuntimeException("Bạn đã đăng ký đủ số lượng lớp học phần cho phép.");
        }

        // ✅ 2. Giới hạn số tín chỉ (ví dụ: tối đa 20)
        int tongTinChi = daDangKyList.stream()
                .mapToInt(dk -> dk.getLopHocPhan().getMonHoc().getSoTinChi())
                .sum();
        int tinChiMoi = lopHocPhanMoi.getMonHoc().getSoTinChi();
        if (tongTinChi + tinChiMoi > 30) {
            throw new RuntimeException("Vượt quá giới hạn tín chỉ cho phép.");
        }

        // ✅ 3. Tránh đăng ký trùng môn học (cùng môn nhưng lớp khác)
        boolean trungMon = daDangKyList.stream()
                .anyMatch(dk -> dk.getLopHocPhan().getMonHoc().getMaMonHoc()
                        .equals(lopHocPhanMoi.getMonHoc().getMaMonHoc()));
        if (trungMon) {
            throw new RuntimeException("Bạn đã đăng ký môn học này ở lớp khác rồi.");
        }

        // ✅ 4. Kiểm tra trùng lịch học phần
        if (isTrungLichHoc_LichHoc(maSinhVien, maLopHocPhan)) {
            throw new RuntimeException("Lớp học phần này bị trùng lịch với lớp bạn đã đăng ký.");
        }
//        for (DangKyHocPhan dangKy : daDangKyList) {
//            LopHocPhan lopDaDangKy = dangKy.getLopHocPhan();
//
//            if (lopDaDangKy.getThu().equalsIgnoreCase(lopHocPhanMoi.getThu())) {
//                try {
//                    int start1 = Integer.parseInt(lopDaDangKy.getTietBatDau());
//                    int end1 = Integer.parseInt(lopDaDangKy.getTietKetThuc());
//
//                    int start2 = Integer.parseInt(lopHocPhanMoi.getTietBatDau());
//                    int end2 = Integer.parseInt(lopHocPhanMoi.getTietKetThuc());
//
//                    boolean isTrungLich = (start1 <= end2 && start2 <= end1);
//
//                    if (isTrungLich) {
//                        throw new RuntimeException("Lớp học phần bị trùng lịch với lớp đã đăng ký: "
//                                + lopDaDangKy.getMaLopHocPhan());
//                    }
//                } catch (NumberFormatException e) {
//                    throw new RuntimeException("Lỗi định dạng tiết học. Đảm bảo tiết là số nguyên.", e);
//                }
//            }
//        }

        // ✅ 5. Tạo và lưu đăng ký học phần
        DangKyHocPhan dangKy = new DangKyHocPhan();
        dangKy.setMaDK(maDK);
        dangKy.setSinhVien(sinhVien);
        dangKy.setLopHocPhan(lopHocPhanMoi);
        dangKy.setThoiGianDangKy(LocalDateTime.now());

        dangKyHocPhanRepository.save(dangKy);

        return "Đăng ký thành công với mã: " + maDK;
    }
    // Tạo mã đăng ký học phần tự động
    private String generateMaDK() {
        Optional<String> lastMaDKOptional = dangKyHocPhanRepository.findLastMaDKForUpdate("DK");
        int nextSequence = 1;

        if (lastMaDKOptional.isPresent()) {
            String lastMaDK = lastMaDKOptional.get();
            Pattern pattern = Pattern.compile("DK(\\d+)");
            Matcher matcher = pattern.matcher(lastMaDK);
            if (matcher.find()) {
                try {
                    int lastSequence = Integer.parseInt(matcher.group(1));
                    nextSequence = lastSequence + 1;
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Lỗi khi phân tích mã đăng ký: " + lastMaDK, e);
                }
            }
        }
        return String.format("DK%03d", nextSequence);
    }
    // Lấy danh sách lớp học phần đã đăng ký của sinh viên
    public List<DangKyHocPhan> getHocPhanDaDangKy(String maSinhVien) {
        return dangKyHocPhanRepository.findBySinhVien_MaSinhVien(maSinhVien);
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
                    int start1 = Integer.parseInt(lopDaDangKy.getTietBatDau());
                    int end1 = Integer.parseInt(lopDaDangKy.getTietKetThuc());

                    int start2 = Integer.parseInt(lopHocPhanMoi.getTietBatDau());
                    int end2 = Integer.parseInt(lopHocPhanMoi.getTietKetThuc());

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
            throw new RuntimeException("Hiện tại không nằm trong thời gian cho phép đăng ký/hủy học phần.");
        }
    }
    // Lấy lịch học theo tuần của sinh viên
    public List<LichHocResponse> getLichHocTheoTuan(String maSinhVien) {
        List<DangKyHocPhan> danhSach = dangKyHocPhanRepository.findBySinhVien_MaSinhVien(maSinhVien);

        return danhSach.stream().map(dk -> {
            LopHocPhan lhp = dk.getLopHocPhan();
            return new LichHocResponse(
                    lhp.getMaLopHocPhan(),
                    lhp.getMonHoc().getTenMonHoc(),
                    lhp.getThu(),
                    lhp.getTietBatDau(),
                    lhp.getTietKetThuc(),
                    lhp.getDiaDiem(),
                    lhp.getGiangVien()
            );
        }).collect(Collectors.toList());
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
                            int startMoi = Integer.parseInt(lichMoi.getTietBatDau());
                            int endMoi = Integer.parseInt(lichMoi.getTietKetThuc());

                            int startCu = Integer.parseInt(lichCu.getTietBatDau());
                            int endCu = Integer.parseInt(lichCu.getTietKetThuc());

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

}