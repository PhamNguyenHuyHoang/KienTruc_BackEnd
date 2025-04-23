package com.dangkyhocphan.dto;

import lombok.*;

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
}

