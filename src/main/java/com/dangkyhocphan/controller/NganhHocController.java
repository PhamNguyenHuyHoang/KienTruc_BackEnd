package com.dangkyhocphan.controller;

import com.dangkyhocphan.dto.NganhHocDTO;
import com.dangkyhocphan.model.NganhHoc;
import com.dangkyhocphan.service.NganhHocService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nganhhoc")
@RequiredArgsConstructor
public class NganhHocController {


    private final NganhHocService nganhHocService;

    @GetMapping
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<List<NganhHocDTO>> getAll() {
        List<NganhHocDTO> list = nganhHocService.getAllDto();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    // Thêm ngành học mới
    public ResponseEntity<NganhHoc> add(@Valid @RequestBody NganhHoc nganhHoc) {
        NganhHoc saved = nganhHocService.add(nganhHoc);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{maNganh}")
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<NganhHoc> update(@PathVariable String maNganh,
                                           @Valid @RequestBody NganhHoc nganhHoc) {
        NganhHoc updated = nganhHocService.update(maNganh, nganhHoc);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{maNganh}")
    @PreAuthorize("hasAuthority('QUANTRIVIEN')")
    public ResponseEntity<?> delete(@PathVariable String maNganh) {
        try {
            nganhHocService.delete(maNganh);
            return ResponseEntity.ok("Đã xóa ngành " + maNganh);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}

