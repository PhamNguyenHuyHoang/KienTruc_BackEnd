package com.dangkyhocphan.controller;

import com.dangkyhocphan.dto.MonHocRequest;
import com.dangkyhocphan.model.MonHoc;
import com.dangkyhocphan.service.MonHocService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/monhoc")
public class MonHocController {
    private final MonHocService monHocService;

    public MonHocController(MonHocService monHocService) {
        this.monHocService = monHocService;
    }

    // Lấy danh sách môn học
    @PreAuthorize("hasAnyAuthority('QUANTRIVIEN', 'SINHVIEN')")
    @GetMapping
    public ResponseEntity<List<MonHoc>> getAllMonHoc() {
        return ResponseEntity.ok(monHocService.getAllMonHoc());
    }
    // Lấy môn học theo mã
    @PreAuthorize("hasAnyAuthority('QUANTRIVIEN', 'SINHVIEN')")
    @GetMapping("/{maMonHoc}")
    public ResponseEntity<MonHoc> getMonHocByMa(@PathVariable String maMonHoc) {
        return ResponseEntity.ok(monHocService.getMonHocByMa(maMonHoc));
    }
    // Thêm môn học mới
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    @PostMapping
    public ResponseEntity<MonHoc> createMonHoc(@Valid @RequestBody MonHocRequest request) {
        return ResponseEntity.ok(monHocService.createMonHoc(request));
    }
    // Cập nhật môn học
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    @PutMapping("/{maMonHoc}")
    public ResponseEntity<MonHoc> updateMonHoc(@PathVariable String maMonHoc, @Valid @RequestBody MonHocRequest request) {
        return ResponseEntity.ok(monHocService.updateMonHoc(maMonHoc, request));
    }
    // Xóa môn học
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    @DeleteMapping("/{maMonHoc}")
    public ResponseEntity<String> deleteMonHoc(@PathVariable String maMonHoc) {
//        monHocService.deleteMonHoc(maMonHoc);
//
//        return ResponseEntity.noContent().build();
        if (!monHocService.getById(maMonHoc).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        try {
            monHocService.deleteMonHoc(maMonHoc);
            return ResponseEntity.ok("Xóa môn học thành công: " + maMonHoc);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống");
        }
    }
}
