package com.dangkyhocphan.controller;

import com.dangkyhocphan.dto.LopHocPhanRequest;
import com.dangkyhocphan.dto.LopHocPhanResponse;
import com.dangkyhocphan.model.LopHocPhan;
import com.dangkyhocphan.service.LopHocPhanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController // tra ve JSON de test postman
@RequestMapping("/api/lophocphan")
public class LopHocPhanController {

    @Autowired
    private LopHocPhanService lopHocPhanService;
    // Lấy thông tin lớp học phần theo mã lớp học phần
    @PreAuthorize("hasAnyAuthority('QUANTRIVIEN', 'SINHVIEN')")
    @GetMapping("/{maLopHocPhan}")
    public ResponseEntity<LopHocPhanResponse> getLopHocPhan(@PathVariable String maLopHocPhan) {
        LopHocPhanResponse dto = lopHocPhanService.getLopHocPhanDTO(maLopHocPhan); // Gọi service trả về DTO
        return ResponseEntity.ok(dto);
    }
    // Lấy danh sách lớp học phần theo học kỳ và năm học
    @PreAuthorize("hasAnyAuthority('QUANTRIVIEN', 'SINHVIEN')")
    @GetMapping
    public ResponseEntity<List<LopHocPhanResponse>> getAllLopHocPhan(@RequestParam(required = false) String hocKy, @RequestParam(required = false) String namHoc) {
        List<LopHocPhan> lopHocPhans = lopHocPhanService.getAllLopHocPhan(hocKy, namHoc);

        // Convert sang DTO
        List<LopHocPhanResponse> dtoList = lopHocPhans.stream()
                .map(lopHocPhanService::convertToResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }
    // Lấy danh sách lớp học phần theo mã sinh viên
    @GetMapping("/sinhvien/{maSinhVien}")
    @PreAuthorize("hasAuthority('SINHVIEN')")
    public ResponseEntity<List<LopHocPhanResponse>> getLopHocPhanBySinhVien(@PathVariable String maSinhVien) {
        List<LopHocPhan> dsLop = lopHocPhanService.getLopHocPhanBySinhVien(maSinhVien);
        List<LopHocPhanResponse> responseList = dsLop.stream()
                .map(lopHocPhanService::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }
    // Tao lop hoc phan
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    @PostMapping
    public ResponseEntity<LopHocPhan> createLopHocPhan(@Valid @RequestBody LopHocPhanRequest request) {
        LopHocPhan created = lopHocPhanService.saveLopHocPhan(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    // Cập nhật thông tin lớp học phần
    @PutMapping("/{maLopHocPhan}")
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<LopHocPhanRequest> updateLopHocPhan(@PathVariable String maLopHocPhan, @RequestBody LopHocPhanRequest request) {
        LopHocPhanRequest updated = lopHocPhanService.updateLopHocPhan(maLopHocPhan, request);
        return ResponseEntity.ok(updated);
    }
    // Xóa lớp học phần
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    @DeleteMapping("/{maLopHocPhan}")
    public ResponseEntity<Void> deleteLopHocPhan(@PathVariable String maLopHocPhan) {
        lopHocPhanService.deleteLopHocPhan(maLopHocPhan);
        return ResponseEntity.noContent().build();
    }
}