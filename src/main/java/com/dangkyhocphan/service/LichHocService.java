package com.dangkyhocphan.service;

import com.dangkyhocphan.dto.LichHocRequest;
import com.dangkyhocphan.dto.LichHocResponse;
import com.dangkyhocphan.model.DangKyHocPhan;
import com.dangkyhocphan.model.LichHoc;
import com.dangkyhocphan.model.LopHocPhan;
import com.dangkyhocphan.repository.DangKyHocPhanRepository;
import com.dangkyhocphan.repository.LichHocRepository;
import com.dangkyhocphan.repository.LopHocPhanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LichHocService {

    private final LichHocRepository lichHocRepository;
    private final LopHocPhanRepository lopHocPhanRepository;
    private final DangKyHocPhanRepository dangKyHocPhanRepository;
    // 1. Tạo lịch học (QUANTRIVIEN)
    public String taoLichHoc(LichHocRequest request) {
        if (lichHocRepository.existsById(request.getMaLichHoc())) {
            throw new RuntimeException("Mã lịch học đã tồn tại: " + request.getMaLichHoc());
        }
        LopHocPhan lop = lopHocPhanRepository.findById(request.getMaLopHocPhan())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần."));

        LichHoc lich = new LichHoc(
                request.getMaLichHoc(),
                request.getThu(),
                request.getTietBatDau(),
                request.getTietKetThuc(),
                request.getDiaDiem(),
                request.getGiangVien(),
                lop
        );
        lichHocRepository.save(lich);
        return "Tạo lịch học thành công.";
    }
    // 2. Cập nhật lịch học (QUANTRIVIEN)
    public String capNhatLichHoc(String maLichHoc, LichHocRequest request) {
        LichHoc lich = lichHocRepository.findById(maLichHoc)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch học."));
        LopHocPhan lop = lopHocPhanRepository.findById(request.getMaLopHocPhan())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần."));

        lich.setThu(request.getThu());
        lich.setTietBatDau(request.getTietBatDau());
        lich.setTietKetThuc(request.getTietKetThuc());
        lich.setDiaDiem(request.getDiaDiem());
        lich.setGiangVien(request.getGiangVien());
        lich.setLopHocPhan(lop);
        lichHocRepository.save(lich);
        return "Cập nhật lịch học thành công.";
    }
    // 3. Xoá lịch học (QUANTRIVIEN)
    public String xoaLichHoc(String maLichHoc) {
        LichHoc lich = lichHocRepository.findById(maLichHoc)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch học."));
        lichHocRepository.delete(lich);
        return "Xoá lịch học thành công.";
    }
    // 4. Lấy toàn bộ lịch học của 1 lớp học phần (SINHVIEN & QUANTRIVIEN)
    public List<LichHocResponse> getLichHocTheoLop(String maLopHocPhan) {
        return lichHocRepository.findByLopHocPhan_MaLopHocPhan(maLopHocPhan)
                .stream()
                .map(lh -> new LichHocResponse(
                        lh.getMaLichHoc(),
                        lh.getThu(),
                        lh.getTietBatDau(),
                        lh.getTietKetThuc(),
                        lh.getDiaDiem(),
                        lh.getGiangVien(),
                        lh.getLopHocPhan().getMaLopHocPhan()
                )).toList();
    }
    // 5. Lấy lịch học sinh viên theo tuần (SINHVIEN & QUANTRIVIEN)
    public List<LichHocResponse> getLichHocSinhVienTheoTuan(String maSinhVien, LocalDate ngayBatDauTuan) {
        List<DangKyHocPhan> dks = dangKyHocPhanRepository.findBySinhVien_MaSinhVien(maSinhVien);
        List<LichHoc> allLichHoc = new ArrayList<>();
        for (DangKyHocPhan dk : dks) {
            List<LichHoc> lich = lichHocRepository.findByLopHocPhan_MaLopHocPhan(dk.getLopHocPhan().getMaLopHocPhan());
            allLichHoc.addAll(lich);
        }
        // Giả sử lịch học theo tuần là tất cả lịch có trong lớp học phần
        return allLichHoc.stream()
                .map(lh -> new LichHocResponse(
                        lh.getMaLichHoc(), lh.getThu(), lh.getTietBatDau(),
                        lh.getTietKetThuc(), lh.getDiaDiem(), lh.getGiangVien(),
                        lh.getLopHocPhan().getMaLopHocPhan()
                )).toList();
    }
}

