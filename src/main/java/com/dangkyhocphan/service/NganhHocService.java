package com.dangkyhocphan.service;

import com.dangkyhocphan.dto.NganhHocDTO;
import com.dangkyhocphan.model.NganhHoc;
import com.dangkyhocphan.repository.NganhHocRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NganhHocService {

    private final NganhHocRepository repo;

    public List<NganhHocDTO> getAllDto() {
        return repo.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public NganhHoc add(NganhHoc nganhHoc) {
        if (repo.existsById(nganhHoc.getMaNganh())) {
            throw new IllegalArgumentException("Mã ngành đã tồn tại");
        }
        return repo.save(nganhHoc);
    }

    public NganhHoc update(String maNganh, NganhHoc nganhHoc) {
        NganhHoc existing = repo.findById(maNganh)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy ngành"));
        existing.setTenNganh(nganhHoc.getTenNganh());
        existing.setSoTinChiTotNghiep(nganhHoc.getSoTinChiTotNghiep());
        existing.setMoTa(nganhHoc.getMoTa());
        return repo.save(existing);
    }

    public void delete(String maNganh) {
        if (!repo.existsById(maNganh)) {
            throw new EntityNotFoundException("Không tìm thấy ngành");
        }
        repo.deleteById(maNganh);
    }

    public NganhHocDTO toDto(NganhHoc entity) {
        if (entity == null) return null;
        return new NganhHocDTO(
                entity.getMaNganh(),
                entity.getTenNganh(),
                entity.getSoTinChiTotNghiep(),
                entity.getMoTa()
        );
    }
}
