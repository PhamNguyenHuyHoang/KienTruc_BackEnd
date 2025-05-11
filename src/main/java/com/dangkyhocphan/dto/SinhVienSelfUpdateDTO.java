package com.dangkyhocphan.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;

@Getter
@Setter
@Data
public class SinhVienSelfUpdateDTO {
    private String hoTen;
    private String email;
    private String gioiTinh;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngaySinh;
    private String noiSinh;
    private String lopHoc;
}