package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuanTriVien {
    @Id
    private String maAdmin;

    private String hoTen;

    @Column(unique = true, nullable = false)
    private String email;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "tenDangNhap", referencedColumnName = "tenDangNhap")
    private TaiKhoan taiKhoan;
}

