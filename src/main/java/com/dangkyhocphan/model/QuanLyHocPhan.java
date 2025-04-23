package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuanLyHocPhan {
    @Id
    private String maQuanLy;

    @OneToMany
    private List<LopHocPhan> danhSachHocPhan;

    @ManyToOne
    @JoinColumn(name = "maAdmin", referencedColumnName = "maAdmin")
    private QuanTriVien quanTriVien;
}

