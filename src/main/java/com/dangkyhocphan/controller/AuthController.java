package com.dangkyhocphan.controller;

import com.dangkyhocphan.model.LoaiTaiKhoan;
import com.dangkyhocphan.model.SinhVien;
import com.dangkyhocphan.model.TaiKhoan;
import com.dangkyhocphan.repository.SinhVienRepository;
import com.dangkyhocphan.repository.TaiKhoanRepository;
import com.dangkyhocphan.security.JwtUtil;
import com.dangkyhocphan.security.TaiKhoanDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;
    private final TaiKhoanDetailsService taiKhoanDetailsService;
    private final SinhVienRepository sinhVienRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
                          TaiKhoanRepository taiKhoanRepository, PasswordEncoder passwordEncoder,
                          TaiKhoanDetailsService taiKhoanDetailsService, SinhVienRepository sinhVienRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.taiKhoanRepository = taiKhoanRepository;
        this.passwordEncoder = passwordEncoder;
        this.taiKhoanDetailsService = taiKhoanDetailsService;
        this.sinhVienRepository = sinhVienRepository;
    }
    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody TaiKhoan taiKhoan) {
        try {
            // Tìm tài khoản trong database
            Optional<TaiKhoan> userOpt = taiKhoanRepository.findByTenDangNhap(taiKhoan.getTenDangNhap());

            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Sai tên đăng nhập hoặc mật khẩu!");
            }

            TaiKhoan user = userOpt.get();

            // Kiểm tra mật khẩu
            if (!passwordEncoder.matches(taiKhoan.getMatKhau(), user.getMatKhau())) {
                return ResponseEntity.badRequest().body("Sai tên đăng nhập hoặc mật khẩu!");
            }

            // Xác thực thông tin đăng nhập với Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getTenDangNhap(), taiKhoan.getMatKhau())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);

//            return ResponseEntity.ok(token);
            return ResponseEntity.ok(Map.of("token", token));

        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest().body("Sai tên đăng nhập hoặc mật khẩu!");
        }
    }
    // Đăng ký
    @PostMapping("/register")
    @Transactional
    public ResponseEntity<String> register(@RequestBody TaiKhoan taiKhoan) {
        // Kiểm tra tài khoản đã tồn tại chưa
        if (taiKhoanRepository.findByTenDangNhap(taiKhoan.getTenDangNhap()).isPresent()) {
            return ResponseEntity.badRequest().body("Tài khoản đã tồn tại!");
        }

        // Lấy mã tài khoản lớn nhất trong database
        String lastMaTaiKhoan = taiKhoanRepository.findLastMaTaiKhoan();
        int newId = (lastMaTaiKhoan != null) ? Integer.parseInt(lastMaTaiKhoan.substring(2)) + 1 : 1;
        taiKhoan.setMaTaiKhoan(String.format("TK%03d", newId)); // Format thành TK001, TK002...

        // Gán quyền mặc định nếu chưa có
        if (taiKhoan.getLoaiTaiKhoan() == null) {
            taiKhoan.setLoaiTaiKhoan(LoaiTaiKhoan.SINHVIEN);
        }

        // Mã hóa mật khẩu
        taiKhoan.setMatKhau(passwordEncoder.encode(taiKhoan.getMatKhau()));

        // Lưu tài khoản vào database
        taiKhoanRepository.save(taiKhoan);

        // Nếu tài khoản là sinh viên, tự động thêm vào bảng `sinh_vien`
        if (taiKhoan.getLoaiTaiKhoan().equals(LoaiTaiKhoan.SINHVIEN)) {
            SinhVien sinhVien = new SinhVien();
            sinhVien.setMaSinhVien(taiKhoan.getTenDangNhap()); // Mã sinh viên trùng với tên đăng nhập
            sinhVien.setEmail(taiKhoan.getTenDangNhap() + "@example.com"); // Email tạm
            sinhVienRepository.save(sinhVien);
        }

        return ResponseEntity.ok("Đăng ký thành công!");
    }
    // Đổi mật khẩu
    @PostMapping("/doimatkhau")
    public ResponseEntity<?> doiMatKhau(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        boolean success = taiKhoanDetailsService.doiMatKhau(username, oldPassword, newPassword);
        if (success) {
            return ResponseEntity.ok("Đổi mật khẩu thành công!");
        }
        return ResponseEntity.status(400).body("Sai mật khẩu cũ hoặc tài khoản không tồn tại.");
    }
}