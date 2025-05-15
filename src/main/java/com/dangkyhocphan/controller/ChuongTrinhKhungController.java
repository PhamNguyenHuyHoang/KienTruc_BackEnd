package com.dangkyhocphan.controller;

import com.dangkyhocphan.dto.ChuongTrinhKhungDTO;
import com.dangkyhocphan.service.ChuongTrinhKhungService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chuongtrinhkhung")
@RequiredArgsConstructor
public class ChuongTrinhKhungController {
    private final ChuongTrinhKhungService service;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('QUANTRIVIEN', 'SINHVIEN')")
    public ResponseEntity<List<ChuongTrinhKhungDTO>> getAll() {
        List<ChuongTrinhKhungDTO> list = service.getAllDto();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{maNganh}/{maMonHoc}")
    @PreAuthorize("hasAnyAuthority('QUANTRIVIEN', 'SINHVIEN')")
    public ResponseEntity<ChuongTrinhKhungDTO> getById(
            @PathVariable String maNganh,
            @PathVariable String maMonHoc
    ) {
        ChuongTrinhKhungDTO dto = service.getByIdDto(maNganh, maMonHoc);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<ChuongTrinhKhungDTO> create(@RequestBody ChuongTrinhKhungDTO dto) {
        ChuongTrinhKhungDTO created = service.addDto(dto);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{maNganh}/{maMonHoc}")
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<ChuongTrinhKhungDTO> update(
            @PathVariable String maNganh,
            @PathVariable String maMonHoc,
            @RequestBody ChuongTrinhKhungDTO dto
    ) {
        ChuongTrinhKhungDTO updated = service.updateDto(maNganh, maMonHoc, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{maNganh}/{maMonHoc}")
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<Void> delete(
            @PathVariable String maNganh,
            @PathVariable String maMonHoc
    ) {
        service.delete(maNganh, maMonHoc);
        return ResponseEntity.noContent().build();
    }
}
