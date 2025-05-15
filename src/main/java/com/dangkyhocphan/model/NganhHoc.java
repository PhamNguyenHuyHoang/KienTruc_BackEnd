// model/NganhHoc.java
package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class NganhHoc {

    @Id
    @Column(name = "ma_nganh")
    private String maNganh;

    @Column(name = "ten_nganh")
    private String tenNganh;

    @Column(name = "so_tin_chi_tot_nghiep", nullable = false)
    private int soTinChiTotNghiep;

    @Column(name = "mo_ta")
    private String moTa;


    @OneToMany(mappedBy = "nganhHoc", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChuongTrinhKhung> chuongTrinhKhungs = new HashSet<>();

    public NganhHoc(String maNganh, String tenNganh, int soTinChiTotNghiep, String moTa) {
        this.maNganh = maNganh;
        this.tenNganh = tenNganh;
        this.soTinChiTotNghiep = soTinChiTotNghiep;
        this.moTa = moTa;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof NganhHoc)) return false;
        NganhHoc that = (NganhHoc) o;
        return maNganh != null && maNganh.equals(that.getMaNganh());
    }

    @Override
    public int hashCode() {
        return maNganh == null ? 0 : maNganh.hashCode();
    }
}
