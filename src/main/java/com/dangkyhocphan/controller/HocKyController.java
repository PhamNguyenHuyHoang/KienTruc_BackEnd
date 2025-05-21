package com.dangkyhocphan.controller;

import com.dangkyhocphan.model.HocKy;
import com.dangkyhocphan.service.HocKyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hocky")
public class HocKyController {

    private final HocKyService hocKyService;

    public HocKyController(HocKyService hocKyService) {
        this.hocKyService = hocKyService;
    }

    @GetMapping("/current")
    @PreAuthorize("hasAnyAuthority('QUANTRIVIEN', 'SINHVIEN')")
    public ResponseEntity<?> getCurrentSemester() {
        HocKy hocKy = hocKyService.findHocKyDangMoDangKy();
        if (hocKy == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy học kỳ đang mở"));
        }
        return ResponseEntity.ok(Map.of(
                "hocKy", hocKy.getId().getMaHocKy(),
                "namHoc", hocKy.getId().getNamHoc()
        ));
    }
}
