package com.dangkyhocphan.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    @ManyToOne
    @JoinColumn(name = "ma_lop_hoc_phan", referencedColumnName = "ma_lop_hoc_phan")
    private LopHocPhan lopHocPhan;
}

