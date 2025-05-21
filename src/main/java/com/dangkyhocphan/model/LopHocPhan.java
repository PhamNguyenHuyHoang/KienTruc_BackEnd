package com.dangkyhocphan.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "lop_hoc_phan")
public class LopHocPhan {

    @Id
    @Column(name = "ma_lop_hoc_phan", nullable = false, unique = true)
    private String maLopHocPhan;


    @NotBlank(message = "Tên lớp học phần không được để trống")
    @Column(name = "ten_lop_hoc_phan", nullable = false)
    private String tenLopHocPhan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_mon_hoc", nullable = false)
    private MonHoc monHoc;

    // Quan hệ ManyToOne với HocKy entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "hoc_ky", referencedColumnName = "ma_hoc_ky"),
            @JoinColumn(name = "nam_hoc", referencedColumnName = "nam_hoc")
    })
    private HocKy hocKy;


    // Năm học giữ nguyên là String (lấy từ HocKy)
    @Column(name = "nam_hoc", insertable = false, updatable = false)
    private String namHoc;

    @Column(name = "thu")  // VD: Thứ 2, Thứ 3,...
    private String thu;

    @Column(name = "tiet_bat_dau")  // VD: Tiết 1
    private String tietBatDau;

    @Column(name = "tiet_ket_thuc") // VD: Tiết 3
    private String tietKetThuc;

    @Column(name = "dia_diem")
    private String diaDiem;

    @Positive(message = "Số lượng sinh viên tối đa phải là số dương")
    @Column(name = "so_luong_sv_toi_da", nullable = false)
    private Integer soLuongSinhVienToiDa;

    @Column(name = "giang_vien")
    private String giangVien;

//    @ManyToMany
//    @JoinTable(
//            name = "dang_ky_hoc_phan",
//            joinColumns = @JoinColumn(name = "ma_lop_hoc_phan"),
//            inverseJoinColumns = @JoinColumn(name = "ma_sinh_vien")
//    )
//    private List<SinhVien> danhSachSinhVien;

    @CreationTimestamp
    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @UpdateTimestamp
    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

//    public LopHocPhan(String maLopHocPhan, MonHoc monHoc, String tenLopHocPhan, String hocKy, String namHoc,
//                      String thu, String tietBatDau, String tietKetThuc, String diaDiem,
//                      Integer soLuongSinhVienToiDa, String giangVien) {
//        this.maLopHocPhan = maLopHocPhan;
//        this.monHoc = monHoc;
//        this.tenLopHocPhan = tenLopHocPhan;
//        this.hocKy = hocKy;
//        this.namHoc = namHoc;
//        this.thu = thu;
//        this.tietBatDau = tietBatDau;
//        this.tietKetThuc = tietKetThuc;
//        this.diaDiem = diaDiem;
//        this.soLuongSinhVienToiDa = soLuongSinhVienToiDa;
//        this.giangVien = giangVien;
//    }


//    public LopHocPhan(String maLopHocPhan, String tenLopHocPhan, MonHoc monHoc, HocKy hocKy, String thu, String tietBatDau, String tietKetThuc, String diaDiem, Integer soLuongSinhVienToiDa, String giangVien, LocalDateTime ngayTao, LocalDateTime ngayCapNhat) {
//        this.maLopHocPhan = maLopHocPhan;
//        this.tenLopHocPhan = tenLopHocPhan;
//        this.monHoc = monHoc;
//        this.hocKy = hocKy;
//        this.thu = thu;
//        this.tietBatDau = tietBatDau;
//        this.tietKetThuc = tietKetThuc;
//        this.diaDiem = diaDiem;
//        this.soLuongSinhVienToiDa = soLuongSinhVienToiDa;
//        this.giangVien = giangVien;
//        this.ngayTao = ngayTao;
//        this.ngayCapNhat = ngayCapNhat;
//    }

    public LopHocPhan(String maLopHocPhan,
                      MonHoc monHoc,
                      String tenLopHocPhan,
                      HocKy hocKy,
                      String namHoc,
                      String thu,
                      String tietBatDau,
                      String tietKetThuc,
                      String diaDiem,
                      Integer soLuongSinhVienToiDa,
                      String giangVien) {
        this.maLopHocPhan = maLopHocPhan;
        this.monHoc = monHoc;
        this.tenLopHocPhan = tenLopHocPhan;
        this.hocKy = hocKy;
        this.namHoc = namHoc;
        this.thu = thu;
        this.tietBatDau = tietBatDau;
        this.tietKetThuc = tietKetThuc;
        this.diaDiem = diaDiem;
        this.soLuongSinhVienToiDa = soLuongSinhVienToiDa;
        this.giangVien = giangVien;
    }

}
