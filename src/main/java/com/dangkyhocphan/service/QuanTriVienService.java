package com.dangkyhocphan.service;

import com.dangkyhocphan.dto.QuanTriVienRequest;
import com.dangkyhocphan.model.QuanTriVien;
import com.dangkyhocphan.model.TaiKhoan;
import com.dangkyhocphan.repository.QuanTriVienRepository;
import com.dangkyhocphan.repository.TaiKhoanRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuanTriVienService {

    @Autowired
    private QuanTriVienRepository quanTriVienRepository;
    @Autowired
    private TaiKhoanRepository taiKhoanRepository;
//    @Autowired
//    private final SomeRelatedEntityRepository someRelatedEntityRepository;

    public List<QuanTriVien> getAllQuanTriVien() {
        return quanTriVienRepository.findAll();
    }

    // Lấy thông tin chi tiết của một quản trị viên theo mã
    public Optional<QuanTriVien> getQuanTriVienById(String maQuanTriVien) {
        return quanTriVienRepository.findById(maQuanTriVien);
    }
//    // Xoa quan tri vien
//    public void xoaQuanTriVien(String maQuanTriVien) {
//        TaiKhoan taiKhoan = taiKhoanRepository.findById(maQuanTriVien)
//                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản với mã: " + maQuanTriVien));
//
//        // Kiểm tra xem có phải là QUANTRIVIEN không
//        if (taiKhoan.getLoaiTaiKhoan() != LoaiTaiKhoan.QUANTRIVIEN) {
//            throw new IllegalArgumentException("Tài khoản không phải là QUANTRIVIEN, không thể xóa.");
//        }
//
//        try {
//            taiKhoanRepository.delete(taiKhoan);
//        } catch (Exception e) {
//            throw new RuntimeException("Không thể xóa tài khoản do ràng buộc dữ liệu.");
//        }
//    }

    @Transactional
    public void xoaQuanTriVien(String maQuanTriVien) {
        // Lấy thông tin người dùng hiện tại từ SecurityContextHolder
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        // Chỉ cho phép QTV002 xóa
        if (!"qtv002".equals(currentUser)) {
            throw new AccessDeniedException("Bạn không có quyền xóa quản trị viên!");
        }
        QuanTriVien quanTriVien = quanTriVienRepository.findById(maQuanTriVien)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quản trị viên: " + maQuanTriVien));

//        // Xóa tất cả các thông tin liên quan
//        someRelatedEntityRepository.deleteByQuanTriVienId(maQuanTriVien);

        // Xóa quản trị viên
        quanTriVienRepository.delete(quanTriVien);
    }

    //    @Transactional
//    public QuanTriVien capNhatQuanTriVien(String maQuanTriVien, QuanTriVienRequest request, String nguoiDangNhap) {
//        // Tìm quản trị viên đang đăng nhập
//        QuanTriVien adminDangNhap = quanTriVienRepository.findById(nguoiDangNhap)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền cập nhật"));
//
//        // Kiểm tra nếu admin đang đăng nhập không phải là admin được cập nhật -> Từ chối quyền
//        if (!adminDangNhap.getMaAdmin().equals(maQuanTriVien)) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chỉ có thể cập nhật thông tin của chính mình");
//        }
//
//        // Tìm quản trị viên cần cập nhật (chính là admin đang đăng nhập)
//        QuanTriVien quanTriVien = quanTriVienRepository.findById(maQuanTriVien)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quản trị viên không tồn tại"));
//
//        // Cập nhật thông tin
//        quanTriVien.setHoTen(request.getHoTen());
//        quanTriVien.setEmail(request.getEmail());
//
//        // Nếu có cập nhật tài khoản thì kiểm tra tồn tại
//        if (request.getTenDangNhap() != null) {
//            TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap())
//                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));
//            quanTriVien.setTaiKhoan(taiKhoan);
//        }
//
//        return quanTriVienRepository.save(quanTriVien);
//    }
//    @Transactional
//    public QuanTriVien capNhatQuanTriVien(String maQuanTriVien, QuanTriVienRequest request, String nguoiDangNhap) {
//        // Tìm quản trị viên đang đăng nhập
//        QuanTriVien adminDangNhap = quanTriVienRepository.findById(nguoiDangNhap)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền cập nhật"));
//
//        // Kiểm tra nếu admin đang đăng nhập không phải admin được cập nhật
//        if (!adminDangNhap.getMaAdmin().equals(maQuanTriVien)) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chỉ có thể cập nhật thông tin của chính mình");
//        }
//
//        // Tìm quản trị viên cần cập nhật (chính là admin đang đăng nhập)
//        QuanTriVien quanTriVien = quanTriVienRepository.findById(maQuanTriVien)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quản trị viên không tồn tại"));
//
//        // Kiểm tra và cập nhật họ tên
//        if (request.getHoTen() != null && !request.getHoTen().isBlank()) {
//            quanTriVien.setHoTen(request.getHoTen());
//        }
//

    /// /        // Kiểm tra và cập nhật email (đảm bảo không trùng lặp)
    /// /        if (request.getEmail() != null && !request.getEmail().isBlank()) {
    /// /            boolean emailExists = quanTriVienRepository.existsByEmailAndMaAdminNot(request.getEmail(), maQuanTriVien);
    /// /            if (emailExists) {
    /// /                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được sử dụng bởi quản trị viên khác");
    /// /            }
    /// /            quanTriVien.setEmail(request.getEmail());
    /// /        }
//
//        // Kiểm tra và cập nhật tài khoản nếu có thay đổi
//        if (request.getTenDangNhap() != null) {
//            if (!request.getTenDangNhap().equals(quanTriVien.getTaiKhoan().getTenDangNhap())) {
//                TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap())
//                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));
//                quanTriVien.setTaiKhoan(taiKhoan);
//            }
//        }
//
//        return quanTriVienRepository.save(quanTriVien);
//    }
    @Transactional
    public QuanTriVien capNhatQuanTriVien(String maQuanTriVien, QuanTriVienRequest request, String nguoiDangNhap) {
        // Tìm quản trị viên đang đăng nhập theo mã tài khoản
        QuanTriVien adminDangNhap = quanTriVienRepository.findByTaiKhoan_MaTaiKhoan(nguoiDangNhap)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền cập nhật"));

        // Kiểm tra nếu admin đang đăng nhập không phải là admin được cập nhật (chỉ cho phép tự cập nhật)
        if (!adminDangNhap.getMaAdmin().equals(maQuanTriVien)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chỉ có thể cập nhật thông tin của chính mình");
        }

        // Tìm quản trị viên cần cập nhật (phải tồn tại trong hệ thống)
        QuanTriVien quanTriVien = quanTriVienRepository.findByMaAdmin(maQuanTriVien)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quản trị viên không tồn tại"));

        // Cập nhật họ tên nếu hợp lệ
        if (request.getHoTen() != null && !request.getHoTen().isBlank()) {
            quanTriVien.setHoTen(request.getHoTen());
        }
        // Kiểm tra và cập nhật email (đảm bảo không trùng lặp)
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            boolean emailExists = quanTriVienRepository.existsByEmailAndMaAdminNot(request.getEmail(), maQuanTriVien);
            if (emailExists) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được sử dụng bởi quản trị viên khác");
            }
            quanTriVien.setEmail(request.getEmail());
        }

        // Kiểm tra và cập nhật tài khoản nếu có thay đổi
        if (request.getTenDangNhap() != null && !request.getTenDangNhap().equals(quanTriVien.getTaiKhoan().getTenDangNhap())) {
            if (!taiKhoanRepository.existsByTenDangNhap(request.getTenDangNhap())) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tài khoản mới không tồn tại");
            }
            TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap()).get();
            quanTriVien.setTaiKhoan(taiKhoan);
        }

        // Lưu lại thông tin đã cập nhật
        return quanTriVienRepository.save(quanTriVien);
    }
}

