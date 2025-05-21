package com.dangkyhocphan.service;

import com.dangkyhocphan.dto.ChuongTrinhKhungDTO;
import com.dangkyhocphan.model.ChuongTrinhKhung;
import com.dangkyhocphan.model.ChuongTrinhKhungId;
import com.dangkyhocphan.model.HocKyId;
import com.dangkyhocphan.model.SinhVien;
import com.dangkyhocphan.repository.*;
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
    private final ChuongTrinhKhungRepository ctkRepository;
    private final MonHocRepository monHocRepo;
    private final NganhHocRepository nganhHocRepo;
    private final HocKyRepository hocKyRepo;
    private final SinhVienRepository sinhVienRepo;

    public List<ChuongTrinhKhungDTO> getAllDto() {
        return ctkRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ChuongTrinhKhungDTO getByIdDto(String maNganh, String maMonHoc) {
        ChuongTrinhKhungId id = new ChuongTrinhKhungId(maNganh, maMonHoc);
        ChuongTrinhKhung entity = ctkRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chương trình khung không tồn tại"));
        return toDto(entity);
    }

    public List<ChuongTrinhKhungDTO> getChuongTrinhKhungForStudent(String username) {
        SinhVien sv = sinhVienRepo.findById(username)
                .orElseThrow(() -> new EntityNotFoundException("Sinh viên không tồn tại"));

        String maNganh = sv.getNganhHoc().getMaNganh();

        List<ChuongTrinhKhung> list = ctkRepository.findByNganhHoc_MaNganh(maNganh);

        return list.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChuongTrinhKhungDTO addDto(ChuongTrinhKhungDTO dto) {
        var nganh = nganhHocRepo.findById(dto.getMaNganh())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ngành không tồn tại"));
        var mon = monHocRepo.findById(dto.getMaMonHoc())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học không tồn tại"));
// Giả sử bạn có dto.getNamHoc() trả về năm học, nếu không thì cần lấy từ dto
        HocKyId hocKyId = new HocKyId(dto.getMaHocKy(), dto.getNamHoc());

        var hocKy = hocKyRepo.findById(hocKyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Học kỳ không tồn tại"));

        ChuongTrinhKhungId id = new ChuongTrinhKhungId(dto.getMaNganh(), dto.getMaMonHoc());
        if (ctkRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bản ghi đã tồn tại");
        }

        ChuongTrinhKhung entity = new ChuongTrinhKhung();
        entity.setId(id);
        entity.setNganhHoc(nganh);
        entity.setMonHoc(mon);
        entity.setHocKy(hocKy);

        ChuongTrinhKhung saved = ctkRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public ChuongTrinhKhungDTO updateDto(String maNganh, String maMonHoc, ChuongTrinhKhungDTO dto) {
        ChuongTrinhKhungId id = new ChuongTrinhKhungId(maNganh, maMonHoc);
        ChuongTrinhKhung existing = ctkRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chương trình khung không tồn tại"));

// Giả sử bạn có dto.getNamHoc() trả về năm học, nếu không thì cần lấy từ dto
        HocKyId hocKyId = new HocKyId(dto.getMaHocKy(), dto.getNamHoc());

        var hocKy = hocKyRepo.findById(hocKyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Học kỳ không tồn tại"));

        existing.setHocKy(hocKy);

        ChuongTrinhKhung updated = ctkRepository.save(existing);
        return toDto(updated);
    }

    @Transactional
    public void delete(String maNganh, String maMonHoc) {
        ChuongTrinhKhungId id = new ChuongTrinhKhungId(maNganh, maMonHoc);
        if (!ctkRepository.existsById(id)) {
            throw new EntityNotFoundException("Chương trình khung không tồn tại");
        }
        ctkRepository.deleteById(id);
    }

    public ChuongTrinhKhungDTO toDto(ChuongTrinhKhung entity) {
        if (entity == null) return null;
        // lấy thông tin cơ bản
        String maNganh    = entity.getNganhHoc().getMaNganh();
        String tenNganh   = entity.getNganhHoc().getTenNganh();
        String maMH       = entity.getMonHoc().getMaMonHoc();
        String tenMH      = entity.getMonHoc().getTenMonHoc();
        String maHK       = entity.getHocKy() != null ? entity.getHocKy().getId().getMaHocKy() : null;
        String namHoc     = entity.getHocKy() != null ? entity.getHocKy().getId().getNamHoc()   : null;

        // lấy tín chỉ và số tiết từ MonHoc
        Integer tc = entity.getMonHoc().getSoTinChi();
        Integer lt = entity.getMonHoc().getThoiLuongLyThuyet();
        Integer th = entity.getMonHoc().getThoiLuongThucHanh();

        return new ChuongTrinhKhungDTO(
                maNganh, tenNganh,
                maMH, tenMH,
                maHK, namHoc,
                tc,    // soTinChi
                lt,    // soTietLT
                th     // soTietTH
        );
    }


}
