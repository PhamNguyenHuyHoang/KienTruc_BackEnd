package com.dangkyhocphan.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DangKyHocPhanDTO2 {
    private String maDK;
    private String maLopHocPhan;
    private String tenLopHocPhan;
    private String maMonHoc;
    private String tenMonHoc;
    private Integer soTinChi;
    private LocalDateTime thoiGianDangKy;

}

