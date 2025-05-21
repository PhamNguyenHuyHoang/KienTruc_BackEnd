//package com.dangkyhocphan.dto;
//
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.NotNull;
//import jakarta.validation.constraints.Positive;
//import lombok.Getter;
//import lombok.Setter;
//
//@Getter
//@Setter
//public class LopHocPhanRequest {
//
//    @NotBlank(message = "Mã môn học không được để trống")
//    private String maMonHoc;
//
//    @NotBlank(message = "Tên lớp học phần không được để trống")
//    private String tenLopHocPhan;
//
//    @NotBlank(message = "Học kỳ không được để trống")
//    private String hocKy;
//
//    @NotNull(message = "Năm học không được để trống")
//    private Integer namHoc;
//
//    private String thoiGian;
//
//    private String diaDiem;
//
//    @Positive(message = "Số lượng sinh viên tối đa phải là số dương")
//    private Integer soLuongSinhVienToiDa;
//
//    private String giangVien;
//}
package com.dangkyhocphan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class LopHocPhanRequest {
    private String maLopHocPhan;

    @NotBlank(message = "Tên lớp học phần không được để trống")
    private String tenLopHocPhan;

    @NotBlank(message = "Học kỳ không được để trống")
    private String hocKy;

    @NotNull(message = "Năm học không được để trống")
    private String namHoc;

    @NotBlank(message = "Thứ học không được để trống (VD: Thứ 2, 4, 6)")
    private String thu;

    @NotBlank(message = "Tiết bắt đầu không được để trống")
    private String tietBatDau;

    @NotBlank(message = "Tiết kết thúc không được để trống")
    private String tietKetThuc;

    @NotBlank(message = "Địa điểm không được để trống")
    private String diaDiem;

    @Positive(message = "Số lượng sinh viên tối đa phải là số dương")
    private Integer soLuongSinhVienToiDa;

    private String giangVien;

    // Dữ liệu từ MonHoc (không cần toàn bộ MonHoc entity)
    @NotBlank(message = "Mã môn học không được để trống")
    private String maMonHoc;
    private String tenMonHoc;


}
