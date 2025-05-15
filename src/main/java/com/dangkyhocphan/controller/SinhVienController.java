package com.dangkyhocphan.controller;

import com.dangkyhocphan.dto.ProgressDTO;
import com.dangkyhocphan.dto.SinhVienDTO;
import com.dangkyhocphan.dto.SinhVienSelfUpdateDTO;
import com.dangkyhocphan.model.SinhVien;
import com.dangkyhocphan.repository.SinhVienRepository;
import com.dangkyhocphan.service.SinhVienService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sinhvien")
public class SinhVienController {

    @Autowired
    private SinhVienService sinhVienService;

    @Autowired
    private SinhVienRepository sinhVienRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<List<SinhVien>> getAllSinhVien() {
        return ResponseEntity.ok(sinhVienService.getAllSinhVien());
    }

    @GetMapping("/{maSinhVien}")
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<SinhVien> getSinhVienById(@PathVariable String maSinhVien) {
        Optional<SinhVien> sinhVien = sinhVienService.getSinhVienById(maSinhVien);
        return sinhVien.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    //    @GetMapping("/me")
//    @PreAuthorize("hasAuthority('SINHVIEN')")
//    public ResponseEntity<?> getCurrentSinhVien(Authentication authentication) {
//        String tenDangNhap = authentication.getName();
//        Optional<SinhVien> sv = sinhVienRepository.findByTaiKhoan_TenDangNhap(tenDangNhap);
//        if (sv.isEmpty()) return ResponseEntity.status(404).body("Không tìm thấy sinh viên");
//        return ResponseEntity.ok(sv.get());
    // DÙNG
    @GetMapping("/me")
    @PreAuthorize("hasAuthority('SINHVIEN')")
    public ResponseEntity<?> getCurrentSinhVien(Authentication authentication) {
        String tenDangNhap = authentication.getName();
        Optional<SinhVien> svOpt = sinhVienRepository.findByTaiKhoan_TenDangNhap(tenDangNhap);
        if (svOpt.isEmpty()) return ResponseEntity.status(404).body("Không tìm thấy sinh viên");

        SinhVien sv = svOpt.get();
        String tenNganh = sv.getNganhHoc() != null ? sv.getNganhHoc().getTenNganh() : null;

        SinhVienDTO dto = new SinhVienDTO(
                sv.getMaSinhVien(),
                sv.getHoTen(),
                sv.getEmail(),
                sv.getGioiTinh(),
                sv.getNgaySinh(),
                sv.getNoiSinh(),
                sv.getLopHoc(),
                sv.getKhoaHoc(),
                sv.getBacDaoTao(),
                sv.getLoaiHinhDaoTao(),
                sv.getNganhHoc() != null ? sv.getNganhHoc().getMaNganh() : null,
                tenNganh,
                sv.getTaiKhoan() != null ? sv.getTaiKhoan().getTenDangNhap() : null,
                sv.getAvatarUrl()
        );

        return ResponseEntity.ok(dto);
    }

    // DÙNG
    @GetMapping("/tien-do-hoc-tap")
    @PreAuthorize("hasAuthority('SINHVIEN')")
    public ResponseEntity<?> getTienDoHocTap(Authentication authentication) {
        String tenDangNhap = authentication.getName();
        ProgressDTO progress = sinhVienService.getTienDoHocTap(tenDangNhap);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<SinhVien> getSinhVienByEmail(@PathVariable String email) {
        Optional<SinhVien> sinhVien = sinhVienService.getSinhVienByEmail(email);
        return sinhVien.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<?> themSinhVien(@RequestBody SinhVien sinhVien) {
        return sinhVienService.themSinhVien(sinhVien);
    }

    @DeleteMapping("/{maSinhVien}")
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<?> xoaSinhVien(@PathVariable String maSinhVien) {
        if (!sinhVienRepository.existsById(maSinhVien)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sinh viên không tồn tại!");
        }

        sinhVienRepository.deleteById(maSinhVien);
        return ResponseEntity.ok("Đã xóa sinh viên thành công!");
    }

    @PutMapping("/{maSinhVien}")
    @PreAuthorize("hasAnyAuthority('SINHVIEN', 'QUANTRIVIEN')")
    public ResponseEntity<?> capNhatSinhVien(@PathVariable String maSinhVien,
                                             @RequestBody Object payload,
                                             Authentication authentication) {
        Optional<SinhVien> optionalSinhVien = sinhVienService.getSinhVienById(maSinhVien);
        if (optionalSinhVien.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sinh viên không tồn tại!");
        }

        SinhVien sinhVienHienTai = optionalSinhVien.get();
        String username = authentication.getName();
        boolean isSinhVien = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("SINHVIEN"));

        if (isSinhVien) {
            if (!sinhVienHienTai.getTaiKhoan().getTenDangNhap().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Bạn chỉ có thể cập nhật thông tin của chính mình!");
            }

            SinhVienSelfUpdateDTO dto = objectMapper.convertValue(payload, SinhVienSelfUpdateDTO.class);
            return sinhVienService.sinhVienCapNhatThongTin(maSinhVien, dto);
        } else {
            SinhVien dto = objectMapper.convertValue(payload, SinhVien.class);
            return sinhVienService.quanTriVienCapNhatThongTin(maSinhVien, dto);
        }
    }


}
