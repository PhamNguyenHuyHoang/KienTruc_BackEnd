//package com.dangkyhocphan.service;
//
//import com.dangkyhocphan.model.SinhVien;
//import com.dangkyhocphan.repository.SinhVienRepository;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class SinhVienService {
//    private final SinhVienRepository sinhVienRepository;
//
//    public SinhVienService(SinhVienRepository sinhVienRepository) {
//        this.sinhVienRepository = sinhVienRepository;
//    }
//
//    public List<SinhVien> getAllSinhVien() {
//        return sinhVienRepository.findAll();
//    }
//
//    public Optional<SinhVien> getSinhVienById(String maSinhVien) {
//        return sinhVienRepository.findById(maSinhVien);
//    }
//
//    public Optional<SinhVien> getSinhVienByEmail(String email) {
//        return sinhVienRepository.findByEmail(email);
//    }
//
//    public SinhVien addSinhVien(SinhVien sinhVien) {
//        return sinhVienRepository.save(sinhVien);
//    }
//
//    public SinhVien updateSinhVien(String maSinhVien, SinhVien sinhVienMoi) {
//        return sinhVienRepository.findById(maSinhVien).map(sinhVien -> {
//            sinhVien.setHoTen(sinhVienMoi.getHoTen());
//            sinhVien.setEmail(sinhVienMoi.getEmail());
//            sinhVien.setTaiKhoan(sinhVienMoi.getTaiKhoan());
//            return sinhVienRepository.save(sinhVien);
//        }).orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên!"));
//    }
//
//    public void deleteSinhVien(String maSinhVien) {
//        sinhVienRepository.findById(maSinhVien).ifPresent(sinhVienRepository::delete);
//    }
//
//    public SinhVien findByEmail(String email) {
//        Optional<SinhVien> sinhVien = sinhVienRepository.findByEmail(email);
//        return sinhVien.orElse(null); // ✅ Trả về null nếu không tìm thấy
//    }
//}
package com.dangkyhocphan.service;

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
    public ResponseEntity<?> capNhatEmail(String maSinhVien, String email) {
        Optional<SinhVien> optionalSinhVien = sinhVienRepository.findById(maSinhVien);
        if (!optionalSinhVien.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Sinh viên không tồn tại!");
        }

        SinhVien sinhVien = optionalSinhVien.get();
        sinhVien.setEmail(email);  // Chỉ cập nhật email
        sinhVienRepository.save(sinhVien);
        return ResponseEntity.ok("Cập nhật email thành công!");
    }

    @Transactional
    public ResponseEntity<?> capNhatThongTin(String maSinhVien, SinhVien sinhVienMoi) {
        Optional<SinhVien> optionalSinhVien = sinhVienRepository.findById(maSinhVien);
        if (!optionalSinhVien.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Sinh viên không tồn tại!");
        }

        SinhVien sinhVien = optionalSinhVien.get();
        sinhVien.setHoTen(sinhVienMoi.getHoTen());
        sinhVien.setEmail(sinhVienMoi.getEmail());
        sinhVienRepository.save(sinhVien);

        return ResponseEntity.ok("Cập nhật thông tin thành công!");
    }


}
