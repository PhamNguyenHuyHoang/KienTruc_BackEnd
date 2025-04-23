package com.dangkyhocphan.security;

import com.dangkyhocphan.model.TaiKhoan;
import com.dangkyhocphan.repository.TaiKhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service("taiKhoanDetailsService")

public class TaiKhoanDetailsService implements UserDetailsService {
    private final TaiKhoanRepository taiKhoanRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public TaiKhoanDetailsService(TaiKhoanRepository taiKhoanRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
    }

    //    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        System.out.println("🔍 Kiểm tra đăng nhập: " + username); // Log username đăng nhập
//        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(username)
//                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản"));
//
//        System.out.println("Tìm thấy tài khoản: " + taiKhoan.getTenDangNhap());
//        System.out.println("Quyền: " + taiKhoan.getLoaiTaiKhoan()); // In ra roles của user
//
//        return new org.springframework.security.core.userdetails.User(
//                taiKhoan.getTenDangNhap(),
//                taiKhoan.getMatKhau(),
//                AuthorityUtils.createAuthorityList(taiKhoan.getLoaiTaiKhoan().name()) // Thêm prefix ROLE_
//        );
//
//    }
//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        System.out.println("Kiểm tra đăng nhập: " + username); // Log username đăng nhập
//        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(username)
//                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản"));
//
//        System.out.println("Tìm thấy tài khoản: " + taiKhoan.getTenDangNhap());
//        System.out.println("Quyền: " + taiKhoan.getLoaiTaiKhoan()); // In ra roles của user
//
//        // ✅ Trả về chính `TaiKhoan` vì nó đã implement `UserDetails`
//        return taiKhoan;
//    }
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản: " + username));

        return new User(taiKhoan.getTenDangNhap(), taiKhoan.getMatKhau(),
                Collections.singletonList(new SimpleGrantedAuthority(taiKhoan.getLoaiTaiKhoan().name())));
    }


    @Transactional
    public boolean doiMatKhau(String username, String oldPassword, String newPassword) {
        Optional<TaiKhoan> userOpt = taiKhoanRepository.findByTenDangNhap(username);

        if (userOpt.isPresent()) {
            TaiKhoan user = userOpt.get();

            // Kiểm tra mật khẩu cũ có đúng không
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                return false; // Mật khẩu cũ không khớp
            }

            // Mã hóa và cập nhật mật khẩu mới
            user.setMatKhau(passwordEncoder.encode(newPassword));
            taiKhoanRepository.save(user);
            return true;
        }

        return false; // Không tìm thấy người dùng
    }


}
