package com.dangkyhocphan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MonHocRequest {
    private String maMonHoc; // Cho phép người dùng nhập mã hoặc tự động tạo

    @NotBlank(message = "Tên môn học không được để trống")
    private String tenMonHoc;

    @Positive(message = "Số tín chỉ phải lớn hơn 0")
    private int soTinChi;

    private String moTa;
    private List<String> monTienQuyet;
    private Integer thoiLuongLyThuyet;
    private Integer thoiLuongThucHanh;

    @NotBlank(message = "Trạng thái không được để trống")
    private String trangThai;
}
