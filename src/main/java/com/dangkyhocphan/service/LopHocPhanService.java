package com.dangkyhocphan.service;

import com.dangkyhocphan.dto.LopHocPhanRequest;
import com.dangkyhocphan.dto.LopHocPhanResponse;
import com.dangkyhocphan.model.LopHocPhan;
import com.dangkyhocphan.model.MonHoc;
import com.dangkyhocphan.repository.LopHocPhanRepository;
import com.dangkyhocphan.repository.MonHocRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class LopHocPhanService {

    @Autowired
    private LopHocPhanRepository lopHocPhanRepository;

    @Autowired
    private MonHocRepository monHocRepository;

    public LopHocPhan createLopHocPhan(LopHocPhanRequest request) {
        MonHoc monHoc = monHocRepository.findById(request.getMaMonHoc())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học không tồn tại"));

        String newMa = generateMaLopHocPhan();
        LopHocPhan lop = new LopHocPhan(
                newMa,
                monHoc,
                request.getTenLopHocPhan(),
                request.getHocKy(),
                request.getNamHoc(),
                request.getThu(),
                request.getTietBatDau(),
                request.getTietKetThuc(),
                request.getDiaDiem(),
                request.getSoLuongSinhVienToiDa(),
                request.getGiangVien()
        );
        return lopHocPhanRepository.save(lop);
    }

    public LopHocPhanResponse getLopHocPhanDTO(String maLopHocPhan) {
        LopHocPhan lhp = lopHocPhanRepository.findById(maLopHocPhan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần"));

        return convertToResponseDTO(lhp);
    }


    public List<LopHocPhan> getAllLopHocPhan(String hocKy, String namHoc) {
        if (hocKy != null && namHoc != null) {
            return lopHocPhanRepository.findByHocKyAndNamHoc(hocKy, namHoc);
        } else if (hocKy != null) {
            return lopHocPhanRepository.findByHocKy(hocKy);
        } else if (namHoc != null) {
            return lopHocPhanRepository.findByNamHoc(namHoc);
        } else {
            return lopHocPhanRepository.findAll();
        }
    }

    @Transactional
    public LopHocPhanRequest updateLopHocPhan(String maLopHocPhan, LopHocPhanRequest request) {
        LopHocPhan lopHocPhan = lopHocPhanRepository.findById(maLopHocPhan)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lớp học phần không tồn tại"));

        // Cập nhật các trường nếu khác null và hợp lệ
        if (request.getTenLopHocPhan() != null) lopHocPhan.setTenLopHocPhan(request.getTenLopHocPhan());
        if (request.getHocKy() != null) lopHocPhan.setHocKy(request.getHocKy());
        if (request.getNamHoc() != null) lopHocPhan.setNamHoc(request.getNamHoc());
        if (request.getThu() != null) lopHocPhan.setThu(request.getThu());
        if (request.getTietBatDau() != null) lopHocPhan.setTietBatDau(request.getTietBatDau());
        if (request.getTietKetThuc() != null) lopHocPhan.setTietKetThuc(request.getTietKetThuc());
        if (request.getDiaDiem() != null) lopHocPhan.setDiaDiem(request.getDiaDiem());
        if (request.getSoLuongSinhVienToiDa() != null)
            lopHocPhan.setSoLuongSinhVienToiDa(request.getSoLuongSinhVienToiDa());
        if (request.getGiangVien() != null) lopHocPhan.setGiangVien(request.getGiangVien());

        // xử lý MonHoc nếu có
        if (request.getMaMonHoc() != null) {
            MonHoc monHoc = monHocRepository.findById(request.getMaMonHoc())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học"));
            lopHocPhan.setMonHoc(monHoc);
        }
        // Lưu lại
        lopHocPhanRepository.save(lopHocPhan);
        // Trả về DTO
        return convertEntityToDto(lopHocPhan);
    }


    public void deleteLopHocPhan(String maLopHocPhan) {
        if (!lopHocPhanRepository.existsById(maLopHocPhan)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lớp học phần không tồn tại");
        }
        lopHocPhanRepository.deleteById(maLopHocPhan);
    }

    private String generateMaLopHocPhan() {
        Optional<LopHocPhan> last = lopHocPhanRepository.findTopByOrderByMaLopHocPhanDesc();
        int nextId = 1;
        if (last.isPresent()) {
            try {
                nextId = Integer.parseInt(last.get().getMaLopHocPhan().substring(3)) + 1;
            } catch (NumberFormatException e) {
                System.err.println("Lỗi khi đọc mã lớp học phần: " + e.getMessage());
            }
        }
        return String.format("LHP%03d", nextId);
    }

    // DUNG LopHocPhanRequest de tranh loi @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ma_mon_hoc", nullable = false)
    public LopHocPhanResponse convertToResponseDTO(LopHocPhan entity) {
        LopHocPhanResponse dto = new LopHocPhanResponse();

        dto.setMaLopHocPhan(entity.getMaLopHocPhan());
        dto.setTenLopHocPhan(entity.getTenLopHocPhan());
        dto.setHocKy(entity.getHocKy());
        dto.setNamHoc(entity.getNamHoc());
        dto.setThu(entity.getThu());
        dto.setTietBatDau(entity.getTietBatDau());
        dto.setTietKetThuc(entity.getTietKetThuc());
        dto.setDiaDiem(entity.getDiaDiem());
        dto.setSoLuongSinhVienToiDa(entity.getSoLuongSinhVienToiDa());
        dto.setGiangVien(entity.getGiangVien());

        // Gán thông tin từ MonHoc
        if (entity.getMonHoc() != null) {
            dto.setMaMonHoc(entity.getMonHoc().getMaMonHoc());
            dto.setTenMonHoc(entity.getMonHoc().getTenMonHoc());
        }

        return dto;
    }

    // Tu LopHocPhanRequest chuyển thành Entity đầy đủ để lưu vào DB.
    public LopHocPhan convertDtoToEntity(LopHocPhanRequest dto) {
        LopHocPhan entity = new LopHocPhan();

        entity.setMaLopHocPhan(dto.getMaLopHocPhan());
        entity.setTenLopHocPhan(dto.getTenLopHocPhan());
        entity.setGiangVien(dto.getGiangVien());
        entity.setThu(dto.getThu());
        entity.setTietBatDau(dto.getTietBatDau());
        entity.setTietKetThuc(dto.getTietKetThuc());
        entity.setDiaDiem(dto.getDiaDiem());
        entity.setSoLuongSinhVienToiDa(dto.getSoLuongSinhVienToiDa());
        entity.setHocKy(dto.getHocKy());
        entity.setNamHoc(dto.getNamHoc());

        // 🔥 Truy xuất MonHoc từ repository
        MonHoc monHoc = monHocRepository.findById(dto.getMaMonHoc())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học: " + dto.getMaMonHoc()));

        entity.setMonHoc(monHoc);

        return entity;
    }

    public LopHocPhanRequest convertEntityToDto(LopHocPhan entity) {
        LopHocPhanRequest dto = new LopHocPhanRequest();

        dto.setMaLopHocPhan(entity.getMaLopHocPhan());
        dto.setTenLopHocPhan(entity.getTenLopHocPhan());
        dto.setGiangVien(entity.getGiangVien());
        dto.setThu(entity.getThu());
        dto.setTietBatDau(entity.getTietBatDau());
        dto.setTietKetThuc(entity.getTietKetThuc());
        dto.setDiaDiem(entity.getDiaDiem());
        dto.setSoLuongSinhVienToiDa(entity.getSoLuongSinhVienToiDa());
        dto.setHocKy(entity.getHocKy());
        dto.setNamHoc(entity.getNamHoc());

        if (entity.getMonHoc() != null) {
            dto.setMaMonHoc(entity.getMonHoc().getMaMonHoc());
            dto.setTenMonHoc(entity.getMonHoc().getTenMonHoc());
        }

        return dto;
    }

    public LopHocPhan saveLopHocPhan(LopHocPhanRequest dto) {
        LopHocPhan entity = convertDtoToEntity(dto);
        return lopHocPhanRepository.save(entity);
    }

}

