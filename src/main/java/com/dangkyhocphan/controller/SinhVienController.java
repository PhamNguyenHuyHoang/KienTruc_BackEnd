package com.dangkyhocphan.controller;

import com.dangkyhocphan.model.SinhVien;
import com.dangkyhocphan.repository.SinhVienRepository;
import com.dangkyhocphan.service.SinhVienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;


import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sinhvien")
public class SinhVienController {
    @Autowired
    private SinhVienService sinhVienService;

    @Autowired
    private SinhVienRepository sinhVienRepository;


    // Lấy danh sách tất cả sinh viên
    @GetMapping
    public ResponseEntity<List<SinhVien>> getAllSinhVien() {
        return ResponseEntity.ok(sinhVienService.getAllSinhVien());
    }

    // Lấy sinh viên theo mã sinh viên
    @GetMapping("/{maSinhVien}")
    public ResponseEntity<SinhVien> getSinhVienById(@PathVariable String maSinhVien) {
        Optional<SinhVien> sinhVien = sinhVienService.getSinhVienById(maSinhVien);
        return sinhVien.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Lấy sinh viên theo email
    @GetMapping("/email/{email}")
    public ResponseEntity<SinhVien> getSinhVienByEmail(@PathVariable String email) {
        Optional<SinhVien> sinhVien = sinhVienService.getSinhVienByEmail(email);
        return sinhVien.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Them sinh vien
    //http://localhost:9090/dangkyhocphan/api/sinhvien
    @PostMapping
    @PreAuthorize("hasAuthority('QUANTRIVIEN')") // Chỉ cho phép QUANTRIVIEN thêm sinh viên
    public ResponseEntity<?> themSinhVien(@RequestBody SinhVien sinhVien) {
        return sinhVienService.themSinhVien(sinhVien);
    }

    @DeleteMapping("/{maSinhVien}")
    @PreAuthorize("hasAuthority('QUANTRIVIEN')") // Chỉ QUANTRIVIEN được phép xóa
    public ResponseEntity<?> xoaSinhVien(@PathVariable String maSinhVien) {
        if (!sinhVienRepository.existsById(maSinhVien)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sinh viên không tồn tại!");
        }

        sinhVienRepository.deleteById(maSinhVien);
        return ResponseEntity.ok("Đã xóa sinh viên thành công!");
    }

    @PutMapping("/{maSinhVien}")
    @PreAuthorize("hasAnyAuthority('SINHVIEN', 'QUANTRIVIEN')") // Cả 2 role đều được phép
    public ResponseEntity<?> capNhatSinhVien(@PathVariable String maSinhVien,
                                             @RequestBody SinhVien sinhVienMoi,
                                             Authentication authentication) {
        // Kiểm tra sinh viên có tồn tại không
        Optional<SinhVien> optionalSinhVien = sinhVienService.getSinhVienById(maSinhVien);
        if (optionalSinhVien.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sinh viên không tồn tại!");
        }

        SinhVien sinhVienHienTai = optionalSinhVien.get();

        // Nếu người dùng có quyền 'SINHVIEN', họ chỉ có thể cập nhật chính mình
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("SINHVIEN"))) {
            String username = authentication.getName(); // Lấy tên đăng nhập từ security context
            if (!sinhVienHienTai.getEmail().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn chỉ có thể cập nhật thông tin của chính mình!");
            }
            return sinhVienService.capNhatEmail(maSinhVien, sinhVienMoi.getEmail());
        }

        // Nếu là QUANTRIVIEN, được phép cập nhật tất cả thông tin
        return sinhVienService.capNhatThongTin(maSinhVien, sinhVienMoi);
    }


}
