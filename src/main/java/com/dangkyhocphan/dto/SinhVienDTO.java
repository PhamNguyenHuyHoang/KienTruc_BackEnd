package com.dangkyhocphan.dto;

import com.dangkyhocphan.model.SinhVien;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SinhVienDTO {
    private String maSinhVien;
    private String hoTen;
    private String email;
    private String gioiTinh;
    private LocalDate ngaySinh;
    private String noiSinh;
    private String lopHoc;
    private String khoaHoc;
    private String bacDaoTao;
    private String loaiHinhDaoTao;
    private String maNganh;
    private String tenNganh;
    private String tenDangNhap;
    private String avatarUrl;

    public SinhVienDTO(SinhVien sv) {
        this.maSinhVien = sv.getMaSinhVien();
        this.hoTen = sv.getHoTen();
        this.email = sv.getEmail();
        this.gioiTinh = sv.getGioiTinh();
        this.ngaySinh = sv.getNgaySinh();
        this.noiSinh = sv.getNoiSinh();
        this.lopHoc = sv.getLopHoc();
        this.khoaHoc = sv.getKhoaHoc();
        this.bacDaoTao = sv.getBacDaoTao();
        this.loaiHinhDaoTao = sv.getLoaiHinhDaoTao();
        this.tenDangNhap = sv.getTaiKhoan().getTenDangNhap();
        this.avatarUrl = sv.getAvatarUrl();
//        this.maNganh = sv.getMaNganh();
        this.tenNganh = sv.getNganhHoc() != null ? sv.getNganhHoc().getTenNganh() : null;
    }
}

