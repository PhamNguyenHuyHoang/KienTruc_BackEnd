package com.dangkyhocphan.controller;

import com.dangkyhocphan.dto.DangKyHocPhanDTO;
import com.dangkyhocphan.dto.DangKyHocPhanRequest;
import com.dangkyhocphan.dto.LichHocResponse;
import com.dangkyhocphan.model.DangKyHocPhan;
import com.dangkyhocphan.service.DangKyHocPhanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dangkyhocphan")
public class DangKyHocPhanController {

    @Autowired
    private DangKyHocPhanService dangKyHocPhanService;

    // dang ky hoc phan bang email
    //    @PostMapping("/{maLopHocPhan}")
    //    public ResponseEntity<?> dangKyHocPhan(
    //            @RequestParam String email,
    //            @PathVariable String maLopHocPhan) {
    //        try {
    //            String result = dangKyHocPhanService.dangKy(email, maLopHocPhan);
    //            return ResponseEntity.ok(result);
    //        } catch (RuntimeException e) {
    //            return ResponseEntity.badRequest().body(e.getMessage());
    //        }
    //    }
    // Đăng ký học phần
    @PostMapping("/dangky")
    @PreAuthorize("hasAuthority('SINHVIEN')")
    public ResponseEntity<String> dangKyHocPhan(@RequestBody DangKyHocPhanRequest request) {
        String message = dangKyHocPhanService.dangKyHocPhan(request);
        return ResponseEntity.ok(message);
    }
    // cho SINHVIEN xem danh sách học phần đã đăng ký
    @GetMapping("/sinhvien/{maSinhVien}")
    @PreAuthorize("hasAuthority('SINHVIEN')")
    public ResponseEntity<List<DangKyHocPhanDTO>> getHocPhanDaDangKy(@PathVariable String maSinhVien) {
        List<DangKyHocPhan> dangKyList = dangKyHocPhanService.getHocPhanDaDangKy(maSinhVien);
        List<DangKyHocPhanDTO> dtoList = dangKyList.stream()
                .map(dangKyHocPhanService::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }
    // cho QUANTRIVIEN xem toàn bộ đăng ký
    @GetMapping
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<List<DangKyHocPhanDTO>> getAll() {
        List<DangKyHocPhan> allDangKy = dangKyHocPhanService.getAllDangKy();
        List<DangKyHocPhanDTO> dtoList = allDangKy.stream()
                .map(dangKyHocPhanService::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }
    // Hủy đăng ký học phần
    @DeleteMapping("/huy")
    @PreAuthorize("hasAuthority('SINHVIEN')")
    public ResponseEntity<String> huyDangKy(Authentication authentication, @RequestBody DangKyHocPhanRequest request) {
        if (authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("SINHVIEN"))) {
            String maSinhVienPrincipal = authentication.getName();
            if (maSinhVienPrincipal.equals(request.getMaSinhVien())) {
                try {
                    String result = dangKyHocPhanService.huyDangKyHocPhan(request);
                    return ResponseEntity.ok(result); // Trả về 200 OK với thông báo thành công
                } catch (RuntimeException e) {
                    return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND); // Trả về 404 Not Found nếu không tìm thấy
                } catch (Exception e) {
                    // Bắt các exception khác có thể xảy ra trong quá trình hủy
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã xảy ra lỗi trong quá trình hủy đăng ký.(Không tìm thấy lớp học phần)");
                }
            } else {
                return new ResponseEntity<>("Không có quyền hủy đăng ký cho sinh viên khác.", HttpStatus.FORBIDDEN);
            }
        } else {
            return new ResponseEntity<>("Không có quyền thực hiện hành động này.", HttpStatus.FORBIDDEN);
        }
    }
    // Kiểm tra xem lớp học phần đã đăng ký chưa
    @GetMapping("/trung-lich")
    public ResponseEntity<?> kiemTraTrungLich(@RequestParam String maSinhVien, @RequestParam String maLopHocPhan) {
        boolean trungLich = dangKyHocPhanService.isTrungLichHoc(maSinhVien, maLopHocPhan);
        if (trungLich) {
            return ResponseEntity.ok("⚠️ Lớp học phần bị trùng lịch với lớp khác đã đăng ký.");
        } else {
            return ResponseEntity.ok("✅ Không bị trùng lịch.");
        }
    }
    // Lấy lịch học theo tuần
    @GetMapping("/lichhoc/{maSinhVien}")
    @PreAuthorize("hasAuthority('SINHVIEN')")
    public ResponseEntity<List<LichHocResponse>> getLichHoc(@PathVariable String maSinhVien) {
        return ResponseEntity.ok(dangKyHocPhanService.getLichHocTheoTuan(maSinhVien));
    }
    // Hủy toàn bộ đăng ký của sinh viên
    @DeleteMapping("/admin/huytoanbo/{maSinhVien}")
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<String> huyToanBoDangKy(@PathVariable String maSinhVien) {
        String result = dangKyHocPhanService.huyTatCaDangKyCuaSinhVien(maSinhVien);
        return ResponseEntity.ok(result);
    }

}

