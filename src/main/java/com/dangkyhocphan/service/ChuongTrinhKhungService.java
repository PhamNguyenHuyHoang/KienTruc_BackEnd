package com.dangkyhocphan.service;

import com.dangkyhocphan.dto.ChuongTrinhKhungDTO;
import com.dangkyhocphan.model.ChuongTrinhKhung;
import com.dangkyhocphan.model.ChuongTrinhKhungId;
import com.dangkyhocphan.model.HocKy;
import com.dangkyhocphan.repository.ChuongTrinhKhungRepository;
import com.dangkyhocphan.repository.HocKyRepository;
import com.dangkyhocphan.repository.MonHocRepository;
import com.dangkyhocphan.repository.NganhHocRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChuongTrinhKhungService {
    private final ChuongTrinhKhungRepository repository;
    private final MonHocRepository monHocRepo;
    private final NganhHocRepository nganhHocRepo;
    private final HocKyRepository hocKyRepo;  // Nếu bạn dùng HocKy

    public List<ChuongTrinhKhungDTO> getAllDto() {
        return repository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ChuongTrinhKhungDTO getByIdDto(String maNganh, String maMonHoc) {
        ChuongTrinhKhungId id = new ChuongTrinhKhungId(maNganh, maMonHoc);
        ChuongTrinhKhung entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chương trình khung không tồn tại"));
        return toDto(entity);
    }

    @Transactional
    public ChuongTrinhKhungDTO addDto(ChuongTrinhKhungDTO dto) {
        var nganh = nganhHocRepo.findById(dto.getMaNganh())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ngành không tồn tại"));
        var mon = monHocRepo.findById(dto.getMaMonHoc())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học không tồn tại"));
        var hocKy = hocKyRepo.findById(dto.getMaHocKy())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Học kỳ không tồn tại"));

        ChuongTrinhKhungId id = new ChuongTrinhKhungId(dto.getMaNganh(), dto.getMaMonHoc());
        if (repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bản ghi đã tồn tại");
        }

        ChuongTrinhKhung entity = new ChuongTrinhKhung();
        entity.setId(id);
        entity.setNganhHoc(nganh);
        entity.setMonHoc(mon);
        entity.setHocKy(hocKy);

        ChuongTrinhKhung saved = repository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public ChuongTrinhKhungDTO updateDto(String maNganh, String maMonHoc, ChuongTrinhKhungDTO dto) {
        ChuongTrinhKhungId id = new ChuongTrinhKhungId(maNganh, maMonHoc);
        ChuongTrinhKhung existing = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chương trình khung không tồn tại"));

        var hocKy = hocKyRepo.findById(dto.getMaHocKy())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Học kỳ không tồn tại"));

        existing.setHocKy(hocKy);

        ChuongTrinhKhung updated = repository.save(existing);
        return toDto(updated);
    }

    @Transactional
    public void delete(String maNganh, String maMonHoc) {
        ChuongTrinhKhungId id = new ChuongTrinhKhungId(maNganh, maMonHoc);
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Chương trình khung không tồn tại");
        }
        repository.deleteById(id);
    }

    public ChuongTrinhKhungDTO toDto(ChuongTrinhKhung entity) {
        if (entity == null) return null;
        var hocKy = entity.getHocKy();
        return new ChuongTrinhKhungDTO(
                entity.getNganhHoc().getMaNganh(),
                entity.getNganhHoc().getTenNganh(),
                entity.getMonHoc().getMaMonHoc(),
                entity.getMonHoc().getTenMonHoc(),
                hocKy != null ? hocKy.getMaHocKy() : null,
                hocKy != null ? hocKy.getNamHoc() : null
        );
    }
}

