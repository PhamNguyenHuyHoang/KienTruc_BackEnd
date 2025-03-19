package com.dangkyhocphan.security;

import com.dangkyhocphan.model.SinhVien;
import com.dangkyhocphan.repository.SinhVienRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class SinhVienDetailsService implements UserDetailsService {
    private final SinhVienRepository sinhVienRepository;

    public SinhVienDetailsService(SinhVienRepository sinhVienRepository) {
        this.sinhVienRepository = sinhVienRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        SinhVien sinhVien = sinhVienRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy sinh viên với email: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(sinhVien.getEmail())
                .password("")  // Nếu có mật khẩu thì thêm vào đây
                .roles("SINHVIEN")
                .build();
    }
}
