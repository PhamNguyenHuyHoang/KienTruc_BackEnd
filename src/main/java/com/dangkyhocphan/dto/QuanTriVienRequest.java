package com.dangkyhocphan.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

//QuanTriVienRequest là một DTO (Data Transfer Object) giúp định nghĩa dữ liệu đầu vào cho API Cập nhật quản trị viên.
//Thay vì dùng QuanTriVien trực tiếp, ta dùng một lớp riêng để kiểm soát dữ liệu nhập vào.
@Getter
@Setter
public class QuanTriVienRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String hoTen;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    private String tenDangNhap; // Nếu cần cập nhật tài khoản mới
}
