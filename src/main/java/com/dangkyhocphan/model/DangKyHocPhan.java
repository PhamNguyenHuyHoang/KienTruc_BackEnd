package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DangKyHocPhan {
    @Id
    @Column(name = "madk")
    private String maDK;

    @ManyToOne
    @JoinColumn(name = "maSinhVien", referencedColumnName = "maSinhVien")
    private SinhVien sinhVien;

    @ManyToOne
    @JoinColumn(name = "ma_lop_hoc_phan", referencedColumnName = "ma_lop_hoc_phan")
    private LopHocPhan lopHocPhan;

    private LocalDateTime thoiGianDangKy;
}

