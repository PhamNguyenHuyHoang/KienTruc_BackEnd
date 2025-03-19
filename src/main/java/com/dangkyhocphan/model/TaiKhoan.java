package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaiKhoan implements UserDetails { // Implement UserDetails
    @Id
    @Column(name = "ma_tai_khoan", nullable = false, unique = true)
    private String maTaiKhoan;

    @Column(nullable = false, unique = true)
    private String tenDangNhap;

    @Column(nullable = false)
    private String matKhau;

    @Enumerated(EnumType.STRING)
    private LoaiTaiKhoan loaiTaiKhoan;

    // Trả về danh sách quyền (Authorities)
//    @Override
//    public Collection<? extends GrantedAuthority> getAuthorities() {
//        return List.of(new SimpleGrantedAuthority(loaiTaiKhoan.name()));
//    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(loaiTaiKhoan.name())); // Lấy đúng role từ DB
    }

    @PrePersist
    public void generateMaTaiKhoan() {
        if (this.maTaiKhoan == null || this.maTaiKhoan.isEmpty()) {
            this.maTaiKhoan = "TK" + (System.currentTimeMillis() % 10000); // Tạo mã ngẫu nhiên
        }
    }

    public void setMaTaiKhoan(String maTaiKhoan) {
        if (!maTaiKhoan.matches("^TK\\d{3,}$")) {
            throw new IllegalArgumentException("Mã tài khoản phải có định dạng TKxxx (VD: TK001)");
        }
        this.maTaiKhoan = maTaiKhoan;
    }

    @Override
    public String getPassword() {
        return matKhau;
    }

    @Override
    public String getUsername() {
        return tenDangNhap;
    }

    public LoaiTaiKhoan getLoaiTaiKhoan() { //
        return loaiTaiKhoan;
    }


    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
