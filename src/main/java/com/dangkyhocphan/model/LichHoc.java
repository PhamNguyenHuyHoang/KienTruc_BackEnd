package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LichHoc {
    @Id
    private String maLichHoc;

    private LocalDate ngayHoc;
    private LocalTime gioBatDau;
    private LocalTime gioKetThuc;

    @ManyToOne
    @JoinColumn(name = "maHocPhan", referencedColumnName = "maHocPhan")
    private HocPhan hocPhan;
}

