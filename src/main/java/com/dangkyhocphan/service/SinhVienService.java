package com.dangkyhocphan.service;

import com.dangkyhocphan.dto.SinhVienSelfUpdateDTO;
import com.dangkyhocphan.model.SinhVien;
import com.dangkyhocphan.model.TaiKhoan;
import com.dangkyhocphan.repository.SinhVienRepository;
import com.dangkyhocphan.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SinhVienService {
    @Autowired
    private SinhVienRepository sinhVienRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    public List<SinhVien> getAllSinhVien() {
        return sinhVienRepository.findAll();
    }

    public Optional<SinhVien> getSinhVienById(String maSinhVien) {
        return sinhVienRepository.findById(maSinhVien);
    }

    public Optional<SinhVien> getSinhVienByEmail(String email) {
        return sinhVienRepository.findByEmail(email);
    }

    @Transactional
    public ResponseEntity<?> themSinhVien(SinhVien sinhVien) {
        if (sinhVienRepository.existsById(sinhVien.getMaSinhVien())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Mã sinh viên đã tồn tại!");
        }

        SinhVien sv = sinhVienRepository.save(sinhVien);
        return ResponseEntity.status(HttpStatus.CREATED).body(sv);
    }

    @Transactional
    public ResponseEntity<?> xoaSinhVien(String maSinhVien) {
        // Kiểm tra sinh viên có tồn tại không
        Optional<SinhVien> optionalSinhVien = sinhVienRepository.findById(maSinhVien);
        if (optionalSinhVien.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sinh viên không tồn tại!");
        }

        SinhVien sinhVien = optionalSinhVien.get();

        // 🛠 Xóa tài khoản trước nếu có
        TaiKhoan taiKhoan = sinhVien.getTaiKhoan();
        if (taiKhoan != null) {
            taiKhoanRepository.delete(taiKhoan);
        }

        // 🛠 Xóa sinh viên
        sinhVienRepository.delete(sinhVien);

        return ResponseEntity.status(HttpStatus.OK).body("Đã xóa sinh viên thành công!");
    }

    @Transactional
    public ResponseEntity<?> sinhVienCapNhatThongTin(String maSinhVien, SinhVienSelfUpdateDTO dto) {
        Optional<SinhVien> optionalSinhVien = sinhVienRepository.findById(maSinhVien);
        if (optionalSinhVien.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy sinh viên!");
        }

        SinhVien sinhVien = optionalSinhVien.get();
        sinhVien.setHoTen(dto.getHoTen());
        sinhVien.setEmail(dto.getEmail());
        sinhVien.setGioiTinh(dto.getGioiTinh());
        sinhVien.setNgaySinh(dto.getNgaySinh());
        sinhVien.setNoiSinh(dto.getNoiSinh());

        sinhVienRepository.save(sinhVien);

        return ResponseEntity.ok("Cập nhật thông tin thành công!");
    }

    @Transactional
    public ResponseEntity<?> quanTriVienCapNhatThongTin(String maSinhVien, SinhVien sinhVienMoi) {
        Optional<SinhVien> optional = sinhVienRepository.findById(maSinhVien);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sinh viên không tồn tại!");
        }

        SinhVien sv = optional.get();
        sv.setHoTen(sinhVienMoi.getHoTen());
        sv.setEmail(sinhVienMoi.getEmail());
        sv.setNoiSinh(sinhVienMoi.getNoiSinh());
        sv.setLopHoc(sinhVienMoi.getLopHoc());
        sv.setNganh(sinhVienMoi.getNganh());
        sv.setLoaiHinhDaoTao(sinhVienMoi.getLoaiHinhDaoTao());
        sv.setBacDaoTao(sinhVienMoi.getBacDaoTao());
        sv.setKhoaHoc(sinhVienMoi.getKhoaHoc());
        sv.setGioiTinh(sinhVienMoi.getGioiTinh());
        sv.setNgaySinh(sinhVienMoi.getNgaySinh());

        sinhVienRepository.save(sv);

        return ResponseEntity.ok("Cập nhật thông tin toàn bộ thành công!");
    }

}
