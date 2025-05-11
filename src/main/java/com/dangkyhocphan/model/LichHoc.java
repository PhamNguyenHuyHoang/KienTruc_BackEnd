package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LichHoc {
    @Id
    private String maLichHoc;

    private String thu;
    private String tietBatDau;
    private String tietKetThuc;
    private String diaDiem;
    private String giangVien;
    @Column(name = "ngay_hoc")
    private LocalDate ngayHoc;
    @Column(name = "loai_buoi") // nếu tên cột là loai_buoi trong DB
    private String loaiBuoi;


    @ManyToOne
    @JoinColumn(name = "ma_lop_hoc_phan", referencedColumnName = "ma_lop_hoc_phan")
    private LopHocPhan lopHocPhan;

    public LichHoc(String maLichHoc, String thu, String tietBatDau, String tietKetThuc,
                   String diaDiem, String giangVien, LopHocPhan lopHocPhan) {
        this.maLichHoc = maLichHoc;
        this.thu = thu;
        this.tietBatDau = tietBatDau;
        this.tietKetThuc = tietKetThuc;
        this.diaDiem = diaDiem;
        this.giangVien = giangVien;
        this.lopHocPhan = lopHocPhan;
    }

}

