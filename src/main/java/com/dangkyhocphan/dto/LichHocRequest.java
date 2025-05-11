package com.dangkyhocphan.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LichHocRequest {
    private String maLichHoc;
    private String thu;
    private String tietBatDau;
    private String tietKetThuc;
    private String diaDiem;
    private String giangVien;
    private String maLopHocPhan;
    private LocalDate ngayHoc;

}
