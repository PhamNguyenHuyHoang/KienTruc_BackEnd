package com.dangkyhocphan.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SinhVien {
    @Id
    @Column(name = "maSinhVien", nullable = false, unique = true)
    private String maSinhVien;

    @Column(name = "ho_ten")
    @JsonProperty("hoTen")
    private String hoTen;

    @Column(unique = true, nullable = false)
    private String email;

    private String gioiTinh;
    private LocalDate ngaySinh;
    private String noiSinh;
    private String lopHoc;
    private String khoaHoc;
    private String bacDaoTao;
    private String loaiHinhDaoTao;
    private String nganh;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "ten_Dang_Nhap", referencedColumnName = "tenDangNhap")
    private TaiKhoan taiKhoan;
}


