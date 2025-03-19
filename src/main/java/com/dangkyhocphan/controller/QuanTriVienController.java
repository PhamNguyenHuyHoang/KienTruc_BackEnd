package com.dangkyhocphan.controller;

import com.dangkyhocphan.dto.QuanTriVienRequest;
import com.dangkyhocphan.model.LoaiTaiKhoan;
import com.dangkyhocphan.model.QuanTriVien;
import com.dangkyhocphan.model.TaiKhoan;
import com.dangkyhocphan.repository.QuanTriVienRepository;
import com.dangkyhocphan.repository.TaiKhoanRepository;
import com.dangkyhocphan.service.QuanTriVienService;
import jakarta.validation.Valid;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/quantrivien")
@PreAuthorize("hasAuthority('QUANTRIVIEN')") // Chỉ quản trị viên mới có quyền truy cập
public class QuanTriVienController {

    @Autowired
    private QuanTriVienService quanTriVienService;

    @Autowired
    private QuanTriVienRepository quanTriVienRepository;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    private static final Logger log = LogManager.getLogger(QuanTriVienController.class);



    // Lấy danh sách tất cả quản trị viên
    @GetMapping
    public ResponseEntity<List<QuanTriVien>> getAllQuanTriVien() {
        List<QuanTriVien> danhSachQTV = quanTriVienService.getAllQuanTriVien();
        return ResponseEntity.ok(danhSachQTV);
    }

    // Lấy thông tin chi tiết của một quản trị viên theo mã
    @GetMapping("/{maQuanTriVien}")
    public ResponseEntity<?> getQuanTriVienById(@PathVariable String maQuanTriVien) {
        Optional<QuanTriVien> quanTriVien = quanTriVienService.getQuanTriVienById(maQuanTriVien);
        if (quanTriVien.isPresent()) {
            return ResponseEntity.ok(quanTriVien.get()); // Trả về QuanTriVien nếu tìm thấy
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Không tìm thấy quản trị viên!")); // Trả về JSON thay vì String
    }

    @PostMapping
    @PreAuthorize("hasAuthority('QUANTRIVIEN')") // Chỉ cho phép quản trị viên
    public ResponseEntity<?> themQuanTriVien(@RequestBody QuanTriVien quanTriVien, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bạn chưa đăng nhập!");
        }
        // Kiểm tra người thực hiện có phải là "qtv002" hay không
        if (!authentication.getName().equals("qtv002")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Bạn không có quyền thêm quản trị viên!"));
        }

        // Kiểm tra xem mã quản trị viên đã tồn tại chưa
        if (quanTriVienRepository.existsById(quanTriVien.getMaAdmin())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Mã quản trị viên đã tồn tại!"));
        }

        // Tạo tài khoản mới
        TaiKhoan taiKhoan = new TaiKhoan();
        taiKhoan.setTenDangNhap(quanTriVien.getMaAdmin());
        taiKhoan.setMatKhau(passwordEncoder.encode("123456")); // Mật khẩu mặc định
        taiKhoan.setLoaiTaiKhoan(LoaiTaiKhoan.QUANTRIVIEN); // Quyền là QUANTRIVIEN
        taiKhoan = taiKhoanRepository.save(taiKhoan); // Lưu tài khoản

        // Gán tài khoản vào quản trị viên
        quanTriVien.setTaiKhoan(taiKhoan);

        // Lưu quản trị viên vào database
        QuanTriVien qtv = quanTriVienRepository.save(quanTriVien);

        return ResponseEntity.status(HttpStatus.CREATED).body(qtv);
    }

    @DeleteMapping("/{maQuanTriVien}")
    public ResponseEntity<String> xoaQuanTriVien(@PathVariable String maQuanTriVien) {

        try {
            quanTriVienService.xoaQuanTriVien(maQuanTriVien);
            return ResponseEntity.ok("Xóa quản trị viên thành công: " + maQuanTriVien);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống");
        }
    }

    @PutMapping("/{maQuanTriVien}")
    public ResponseEntity<?> capNhatQuanTriVien(@PathVariable String maQuanTriVien,
                                                @Valid @RequestBody QuanTriVienRequest request,
                                                @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Người dùng hiện tại: " + userDetails.getUsername());

        Optional<TaiKhoan> taiKhoanDangNhap = taiKhoanRepository.findByTenDangNhap(userDetails.getUsername());

        if (taiKhoanDangNhap.isEmpty()) {
            log.error("taiKhoanDangNhap bị null!");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không thể xác thực tài khoản.");
        }

        log.info("Cập nhật quản trị viên - Mã QTV: {}, Họ tên: {}, Email: {}",
                maQuanTriVien, request.getHoTen(), request.getEmail());

        QuanTriVien updatedAdmin = quanTriVienService.capNhatQuanTriVien(maQuanTriVien, request, taiKhoanDangNhap.get().getMaTaiKhoan());
        return ResponseEntity.ok(updatedAdmin);
    }

}

