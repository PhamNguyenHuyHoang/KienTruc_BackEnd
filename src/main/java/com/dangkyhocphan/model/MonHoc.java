package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Table(name = "mon_hoc")
public class MonHoc {
    @Id
    @Column(name = "ma_mon_hoc", nullable = false, unique = true)
    private String maMonHoc; // ID chính có dạng MHxxx

    @Column(name = "ten_mon_hoc", nullable = false)
    private String tenMonHoc;

    @Column(name = "so_tin_chi")
    private Integer soTinChi;

    @Column(columnDefinition = "TEXT")
    private String moTa;

    private Integer thoiLuongLyThuyet; // Số giờ lý thuyết
    private Integer thoiLuongThucHanh; // Số giờ thực hành

    @Column(name = "trang_thai", nullable = false)
    private String trangThai;

    @OneToMany(mappedBy = "monHoc", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MonHocTienQuyet> monTienQuyet;

    @OneToMany(mappedBy = "monHoc", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChuongTrinhKhung> chuongTrinhKhungs = new HashSet<>();

//    @ElementCollection
//    @CollectionTable(name = "mon_hoc_tien_quyet", joinColumns = @JoinColumn(name = "ma_mon_hoc"))
//    @Column(name = "mon_tien_quyet")
//    private List<String> monTienQuyet; // Danh sách môn tiên quyết (chứa mã môn học)


    public MonHoc(String maMonHoc, String tenMonHoc, Integer soTinChi, String moTa, List<MonHocTienQuyet> monTienQuyet, Integer thoiLuongLyThuyet, Integer thoiLuongThucHanh, String trangThai) {
        this.maMonHoc = maMonHoc;
        this.tenMonHoc = tenMonHoc;
        this.soTinChi = soTinChi;
        this.moTa = moTa;
        this.monTienQuyet = monTienQuyet;
        this.thoiLuongLyThuyet = thoiLuongLyThuyet;
        this.thoiLuongThucHanh = thoiLuongThucHanh;
        this.trangThai = trangThai;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MonHoc)) return false;
        MonHoc that = (MonHoc) o;
        return maMonHoc != null && maMonHoc.equals(that.getMaMonHoc());
    }

    @Override
    public int hashCode() {
        return maMonHoc == null ? 0 : maMonHoc.hashCode();
    }
}

