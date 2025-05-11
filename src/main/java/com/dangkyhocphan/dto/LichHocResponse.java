package com.dangkyhocphan.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LichHocResponse {
    private String maLopHocPhan;
    private String tenMonHoc;
    private String thu;
    private String tietBatDau;
    private String tietKetThuc;
    private String diaDiem;
    private String giangVien;
    private LocalDate ngayHoc;
    private String loaiBuoi;
}

