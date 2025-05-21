package com.dangkyhocphan.service;

import com.dangkyhocphan.dto.LopHocPhanRequest;
import com.dangkyhocphan.dto.LopHocPhanResponse;
import com.dangkyhocphan.model.*;
import com.dangkyhocphan.repository.DangKyHocPhanRepository;
import com.dangkyhocphan.repository.HocKyRepository;
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

    @Autowired
    private DangKyHocPhanRepository dangKyHocPhanRepository;

    @Autowired
    private HocKyRepository hocKyRepository;

    public LopHocPhan createLopHocPhan(LopHocPhanRequest request) {
        MonHoc monHoc = monHocRepository.findById(request.getMaMonHoc())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học không tồn tại"));

        HocKyId hocKyId = new HocKyId(request.getHocKy(), request.getNamHoc());  // lấy mã học kỳ và năm học từ request

        HocKy hocKy = hocKyRepository.findById(hocKyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Học kỳ không tồn tại"));


        String newMa = generateMaLopHocPhan();

        LopHocPhan lop = new LopHocPhan(
                newMa,
                monHoc,
                request.getTenLopHocPhan(),
                hocKy,
                hocKy.getId().getNamHoc(),
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

    public List<LopHocPhan> getAllLopHocPhan(String maHocKy, String namHoc) {
        if (maHocKy != null && namHoc != null) {
            return lopHocPhanRepository.findByHocKy_MaHocKyAndHocKy_NamHoc(maHocKy, namHoc);
        } else if (maHocKy != null) {
            return lopHocPhanRepository.findByHocKy_Id_MaHocKy(maHocKy);
        } else if (namHoc != null) {
            return lopHocPhanRepository.findByHocKy_Id_NamHoc(namHoc);
        } else {
            return lopHocPhanRepository.findAll();
        }
    }

    @Transactional
    public LopHocPhanRequest updateLopHocPhan(String maLopHocPhan, LopHocPhanRequest request) {
        LopHocPhan lopHocPhan = lopHocPhanRepository.findById(maLopHocPhan)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lớp học phần không tồn tại"));

        if (request.getTenLopHocPhan() != null) lopHocPhan.setTenLopHocPhan(request.getTenLopHocPhan());

        if (request.getHocKy() != null) {
            HocKyId hocKyId = new HocKyId(request.getHocKy(), request.getNamHoc());  // lấy mã học kỳ và năm học từ request

            HocKy hocKy = hocKyRepository.findById(hocKyId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Học kỳ không tồn tại"));
            ;
            lopHocPhan.setHocKy(hocKy);
            lopHocPhan.setNamHoc(hocKy.getId().getNamHoc());
        }

        if (request.getThu() != null) lopHocPhan.setThu(request.getThu());
        if (request.getTietBatDau() != null) lopHocPhan.setTietBatDau(request.getTietBatDau());
        if (request.getTietKetThuc() != null) lopHocPhan.setTietKetThuc(request.getTietKetThuc());
        if (request.getDiaDiem() != null) lopHocPhan.setDiaDiem(request.getDiaDiem());
        if (request.getSoLuongSinhVienToiDa() != null)
            lopHocPhan.setSoLuongSinhVienToiDa(request.getSoLuongSinhVienToiDa());
        if (request.getGiangVien() != null) lopHocPhan.setGiangVien(request.getGiangVien());

        if (request.getMaMonHoc() != null) {
            MonHoc monHoc = monHocRepository.findById(request.getMaMonHoc())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học không tồn tại"));
            lopHocPhan.setMonHoc(monHoc);
        }

        lopHocPhanRepository.save(lopHocPhan);

        return convertEntityToDto(lopHocPhan);
    }

    @Transactional
    public void deleteLopHocPhan(String maLopHocPhan) {
        List<DangKyHocPhan> dsDangKy = dangKyHocPhanRepository.findByLopHocPhan_MaLopHocPhan(maLopHocPhan);

        dangKyHocPhanRepository.deleteAll(dsDangKy);
        dangKyHocPhanRepository.flush();

        if (!lopHocPhanRepository.existsById(maLopHocPhan)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lớp học phần không tồn tại");
        }

        lopHocPhanRepository.deleteById(maLopHocPhan);
        lopHocPhanRepository.flush();
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

    public LopHocPhanResponse convertToResponseDTO(LopHocPhan entity) {
        LopHocPhanResponse dto = new LopHocPhanResponse();
        int daDangKy = dangKyHocPhanRepository.countByLopHocPhan_MaLopHocPhan(entity.getMaLopHocPhan());

        dto.setMaLopHocPhan(entity.getMaLopHocPhan());
        dto.setTenLopHocPhan(entity.getTenLopHocPhan());
        dto.setHocKy(entity.getHocKy().getId().getMaHocKy()); // lấy mã học kỳ: HK1, HK2, HK3
        dto.setNamHoc(entity.getHocKy().getId().getNamHoc());  // lấy năm học: 2024-2025
        dto.setThu(entity.getThu());
        dto.setTietBatDau(entity.getTietBatDau());
        dto.setTietKetThuc(entity.getTietKetThuc());
        dto.setDiaDiem(entity.getDiaDiem());
        dto.setSoLuongSinhVienToiDa(entity.getSoLuongSinhVienToiDa());
        dto.setSoLuongDaDangKy(daDangKy);
        dto.setGiangVien(entity.getGiangVien());
        dto.setSoTinChi(entity.getMonHoc().getSoTinChi());

        if (entity.getMonHoc() != null) {
            dto.setMaMonHoc(entity.getMonHoc().getMaMonHoc());
            dto.setTenMonHoc(entity.getMonHoc().getTenMonHoc());
        }

        return dto;
    }

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

        // Lấy entity HocKy theo mã từ dto, đảm bảo đúng quan hệ
        HocKyId hocKyId = new HocKyId(dto.getHocKy(), dto.getNamHoc());  // lấy mã học kỳ và năm học từ request

        HocKy hocKy = hocKyRepository.findById(hocKyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Học kỳ không tồn tại"));


        entity.setHocKy(hocKy);
        entity.setNamHoc(hocKy.getId().getNamHoc());

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

        dto.setHocKy(entity.getHocKy().getId().getMaHocKy());
        dto.setNamHoc(entity.getHocKy().getId().getNamHoc());

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

    public List<LopHocPhan> getLopHocPhanBySinhVien(String maSinhVien) {
        return dangKyHocPhanRepository.findLopHocPhanBySinhVien_MaSinhVien(maSinhVien);
    }

}
