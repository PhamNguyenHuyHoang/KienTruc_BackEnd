package com.dangkyhocphan.controller;

import com.dangkyhocphan.dto.LichHocRequest;
import com.dangkyhocphan.dto.LichHocResponse;
import com.dangkyhocphan.service.LichHocService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/lichhoc")
@RequiredArgsConstructor
public class LichHocController {

    private final LichHocService lichHocService;

    // 1. Tạo lịch học (QUANTRIVIEN)
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    @PostMapping("/them")
    public ResponseEntity<?> taoLichHoc(@RequestBody LichHocRequest request) {
        return ResponseEntity.ok(lichHocService.taoLichHoc(request));
    }
    // 2. Cập nhật lịch học (QUANTRIVIEN)
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    @PutMapping("/capnhat/{maLichHoc}")
    public ResponseEntity<?> capNhatLichHoc(@PathVariable String maLichHoc, @RequestBody LichHocRequest request) {
        return ResponseEntity.ok(lichHocService.capNhatLichHoc(maLichHoc, request));
    }
    // 3. Xoá lịch học (QUANTRIVIEN)
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    @DeleteMapping("/xoa/{maLichHoc}")
    public ResponseEntity<?> xoaLichHoc(@PathVariable String maLichHoc) {
        return ResponseEntity.ok(lichHocService.xoaLichHoc(maLichHoc));
    }
    // 4. Lấy toàn bộ lịch học của 1 lớp học phần (SINHVIEN & QUANTRIVIEN)
    @PreAuthorize("hasAnyAuthority('SINHVIEN', 'QUANTRIVIEN')")
    @GetMapping("/lophocphan/{maLopHocPhan}")
    public ResponseEntity<List<LichHocResponse>> getLichHocTheoLop(@PathVariable String maLopHocPhan) {
        return ResponseEntity.ok(lichHocService.getLichHocTheoLop(maLopHocPhan));
    }
    // 5. Lấy lịch học sinh viên theo tuần (SINHVIEN & QUANTRIVIEN)
    @PreAuthorize("hasAnyAuthority('SINHVIEN', 'QUANTRIVIEN')")
    @GetMapping("/sinhvien/{maSinhVien}/tuan")
    public ResponseEntity<List<LichHocResponse>> getLichHocSinhVienTheoTuan(
            @PathVariable String maSinhVien,
            @RequestParam("tuan") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngayBatDauTuan) {
        return ResponseEntity.ok(lichHocService.getLichHocSinhVienTheoTuan(maSinhVien, ngayBatDauTuan));
    }
}