package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DangKyHocPhan {
    @Id
    private String maDK;

    @ManyToOne
    @JoinColumn(name = "maSinhVien", referencedColumnName = "maSinhVien")
    private SinhVien sinhVien;

    @ManyToOne
    @JoinColumn(name = "maHocPhan", referencedColumnName = "maHocPhan")
    private HocPhan hocPhan;
}

