package com.dangkyhocphan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DangKyHocPhanDTO {
    private String maDK;
    private String maLopHocPhan;
    private String tenLopHocPhan; // Thêm thông tin cần thiết từ LopHocPhan
    private String maMonHoc;       // Thêm thông tin cần thiết từ MonHoc
    private String tenMonHoc;       // Thêm thông tin cần thiết từ MonHoc
    private LocalDateTime thoiGianDangKy;

}