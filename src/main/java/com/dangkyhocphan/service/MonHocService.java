package com.dangkyhocphan.service;

import com.dangkyhocphan.dto.MonHocRequest;
import com.dangkyhocphan.model.MonHoc;
import com.dangkyhocphan.model.MonHocTienQuyet;
import com.dangkyhocphan.repository.MonHocRepository;
import com.dangkyhocphan.repository.MonHocTienQuyetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MonHocService {


    @Autowired
    private MonHocRepository monHocRepository;

    @Autowired
    private MonHocTienQuyetRepository monHocTienQuyetRepository; // Inject repository

    public MonHocService(MonHocRepository monHocRepository, MonHocTienQuyetRepository monHocTienQuyetRepository) {
        this.monHocRepository = monHocRepository;
        this.monHocTienQuyetRepository = monHocTienQuyetRepository;
    }

    // Tạo mã môn học tự động dạng MHxxx
    private String generateMaMonHoc() {
        long count = monHocRepository.count() + 1;
        return String.format("MH%03d", count);
    }

    // Lấy danh sách môn học
    public List<MonHoc> getAllMonHoc() {
        return monHocRepository.findAll();
    }

    // Lấy môn học theo mã
    public MonHoc getMonHocByMa(String maMonHoc) {
        return monHocRepository.findById(maMonHoc)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học không tồn tại"));
    }

    public Optional<MonHoc> getById(String maMonHoc) {
        return monHocRepository.findById(maMonHoc);
    }

    //    // Thêm môn học mới
//    @Transactional
//    public MonHoc createMonHoc(MonHocRequest request) {
//        String maMonHoc = request.getMaMonHoc() != null ? request.getMaMonHoc() : generateMaMonHoc();
//
//        if (monHocRepository.existsByMaMonHoc(maMonHoc)) {
//            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã môn học đã tồn tại");
//        }
//
//        MonHoc monHoc = new MonHoc();
//        monHoc.setMaMonHoc(maMonHoc);
//        monHoc.setTenMonHoc(request.getTenMonHoc());
//        monHoc.setSoTinChi(request.getSoTinChi());
//        monHoc.setMoTa(request.getMoTa());
//        monHoc.setMonTienQuyet(request.);
//        monHoc.setThoiLuongLyThuyet(request.getThoiLuongLyThuyet());
//        monHoc.setThoiLuongThucHanh(request.getThoiLuongThucHanh());
//        monHoc.setTrangThai(request.getTrangThai());
//
//        return monHocRepository.save(monHoc);
//    }
//
//    // Cập nhật môn học
//    @Transactional
//    public MonHoc updateMonHoc(String maMonHoc, MonHocRequest request) {
//        MonHoc monHoc = monHocRepository.findById(maMonHoc)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học không tồn tại"));
//
//        monHoc.setTenMonHoc(request.getTenMonHoc());
//        monHoc.setSoTinChi(request.getSoTinChi());
//        monHoc.setMoTa(request.getMoTa());
//        monHoc.setMonTienQuyet(request.getMonTienQuyet());
//        monHoc.setThoiLuongLyThuyet(request.getThoiLuongLyThuyet());
//        monHoc.setThoiLuongThucHanh(request.getThoiLuongThucHanh());
//        monHoc.setTrangThai(request.getTrangThai());
//
//        return monHocRepository.save(monHoc);
//    }
// Thêm môn học mới
    @Transactional
    public MonHoc createMonHoc(MonHocRequest request) {
        String maMonHoc = request.getMaMonHoc() != null ? request.getMaMonHoc() : generateMaMonHoc();

        if (monHocRepository.existsByMaMonHoc(maMonHoc)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã môn học đã tồn tại");
        }

        MonHoc monHoc = new MonHoc();
        monHoc.setMaMonHoc(maMonHoc);
        monHoc.setTenMonHoc(request.getTenMonHoc());
        monHoc.setSoTinChi(request.getSoTinChi());
        monHoc.setMoTa(request.getMoTa());
        monHoc.setThoiLuongLyThuyet(request.getThoiLuongLyThuyet());
        monHoc.setThoiLuongThucHanh(request.getThoiLuongThucHanh());
        monHoc.setTrangThai(request.getTrangThai());

        List<MonHocTienQuyet> monTienQuyetList = new ArrayList<>();
        List<String> tienQuyetCodes = request.getMonTienQuyet(); // Giả sử MonHocRequest có getMonTienQuyet() trả về List<String>
        if (tienQuyetCodes != null) {
            for (String tienQuyetCode : tienQuyetCodes) {
                MonHoc tienQuyetMonHoc = monHocRepository.findById(tienQuyetCode)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học tiên quyết có mã " + tienQuyetCode + " không tồn tại"));
                MonHocTienQuyet monHocTienQuyet = new MonHocTienQuyet();
                monHocTienQuyet.setMonHoc(monHoc);
                monHocTienQuyet.setTienQuyet(tienQuyetMonHoc);
                monTienQuyetList.add(monHocTienQuyet);
            }
        }
        monHoc.setMonTienQuyet(monTienQuyetList);

        return monHocRepository.save(monHoc);
    }

    // Cập nhật môn học
//    @Transactional
//    public MonHoc updateMonHoc(String maMonHoc, MonHocRequest request) {
//        MonHoc existingMonHoc = monHocRepository.findById(maMonHoc)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học không tồn tại"));
//
//        existingMonHoc.setTenMonHoc(request.getTenMonHoc());
//        existingMonHoc.setSoTinChi(request.getSoTinChi());
//        existingMonHoc.setMoTa(request.getMoTa());
//        existingMonHoc.setThoiLuongLyThuyet(request.getThoiLuongLyThuyet());
//        existingMonHoc.setThoiLuongThucHanh(request.getThoiLuongThucHanh());
//        existingMonHoc.setTrangThai(request.getTrangThai());
//
//        // Xóa các môn tiên quyết hiện có và thêm các môn tiên quyết mới
//        existingMonHoc.getMonTienQuyet().clear();
//
//        List<String> tienQuyetCodes = request.getMonTienQuyet(); // Giả sử MonHocRequest có getMonTienQuyet() trả về List<String>
//        if (tienQuyetCodes != null) {
//            for (String tienQuyetCode : tienQuyetCodes) {
//                MonHoc tienQuyetMonHoc = monHocRepository.findById(tienQuyetCode)
//                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học tiên quyết có mã " + tienQuyetCode + " không tồn tại"));
//                MonHocTienQuyet monHocTienQuyet = new MonHocTienQuyet();
//                monHocTienQuyet.setMonHoc(existingMonHoc);
//                monHocTienQuyet.setTienQuyet(tienQuyetMonHoc);
//                existingMonHoc.getMonTienQuyet().add(monHocTienQuyet);
//            }
//        }
//
//        return monHocRepository.save(existingMonHoc);
//    }

    @Transactional
    public MonHoc updateMonHoc(String maMonHoc, MonHocRequest request) {
        MonHoc existingMonHoc = monHocRepository.findById(maMonHoc)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học không tồn tại"));

        // Cập nhật các trường nếu chúng có giá trị trong request
        if (request.getTenMonHoc() != null) {
            existingMonHoc.setTenMonHoc(request.getTenMonHoc());
        }
        if (request.getSoTinChi() > 0) {
            existingMonHoc.setSoTinChi(request.getSoTinChi());
        }
        if (request.getMoTa() != null) {
            existingMonHoc.setMoTa(request.getMoTa());
        }
        if (request.getThoiLuongLyThuyet() != null) {
            existingMonHoc.setThoiLuongLyThuyet(request.getThoiLuongLyThuyet());
        }
        if (request.getThoiLuongThucHanh() != null) {
            existingMonHoc.setThoiLuongThucHanh(request.getThoiLuongThucHanh());
        }
        if (request.getTrangThai() != null) {
            existingMonHoc.setTrangThai(request.getTrangThai());
        }

        // Xử lý cập nhật môn tiên quyết
        existingMonHoc.getMonTienQuyet().clear();
        List<String> tienQuyetCodes = request.getMonTienQuyet();
        if (tienQuyetCodes != null) {
            for (String tienQuyetCode : tienQuyetCodes) {
                MonHoc tienQuyetMonHoc = monHocRepository.findById(tienQuyetCode)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học tiên quyết có mã " + tienQuyetCode + " không tồn tại"));
                MonHocTienQuyet monHocTienQuyet = new MonHocTienQuyet();
                monHocTienQuyet.setMonHoc(existingMonHoc);
                monHocTienQuyet.setTienQuyet(tienQuyetMonHoc);
                existingMonHoc.getMonTienQuyet().add(monHocTienQuyet);
            }
        }

        return monHocRepository.save(existingMonHoc);
    }

    // Xóa môn học
//    @Transactional
//    public void deleteMonHoc(String maMonHoc) {
//        MonHoc monHoc = monHocRepository.findById(maMonHoc)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học không tồn tại"));
//
//        monHocRepository.delete(monHoc);
//    }

    @Transactional
    public void deleteMonHoc(String maMonHoc) {
        MonHoc monHoc = monHocRepository.findById(maMonHoc)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Môn học không tồn tại"));

        // Kiểm tra xem môn học này có đang là tiên quyết của môn khác không
        List<MonHoc> danhSachPhuThuoc = monHocRepository.findMonHocByTienQuyet(maMonHoc);
        if (!danhSachPhuThuoc.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể xóa. Môn học này đang là tiên quyết của các môn: " +
                            danhSachPhuThuoc.stream().map(MonHoc::getMaMonHoc).toList()
            );
        }

        monHocRepository.delete(monHoc);
    }


    public boolean isMonHocTienQuyet(String maMonHoc) {
        return !monHocRepository.findMonHocByTienQuyet(maMonHoc).isEmpty();
    }

}
