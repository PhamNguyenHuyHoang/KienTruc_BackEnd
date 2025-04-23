package com.dangkyhocphan.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SinhVien {
    @Id
    @Column(name = "maSinhVien", nullable = false, unique = true)
    private String maSinhVien; // Nếu là String thì phải đảm bảo tất cả khóa ngoại dùng String

    private String hoTen;
    @Column(unique = true, nullable = false)
    private String email;

    @OneToOne
    @JoinColumn(name = "tenDangNhap", referencedColumnName = "tenDangNhap")
    private TaiKhoan taiKhoan;

}

