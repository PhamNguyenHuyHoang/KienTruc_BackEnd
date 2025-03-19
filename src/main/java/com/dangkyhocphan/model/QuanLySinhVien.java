package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuanLySinhVien {
    @Id
    private String maQuanLy;

    @OneToMany
    private List<SinhVien> danhSachSinhVien;

    @ManyToOne
    @JoinColumn(name = "maAdmin", referencedColumnName = "maAdmin")
    private QuanTriVien quanTriVien;
}

