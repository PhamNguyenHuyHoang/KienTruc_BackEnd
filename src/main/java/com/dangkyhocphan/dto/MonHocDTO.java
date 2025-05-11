package com.dangkyhocphan.dto;

import lombok.Data;
import java.util.List;

@Data
public class MonHocDTO {
    private String maMonHoc;
    private String tenMonHoc;
    private int soTinChi;
    private String moTa;
    private Integer thoiLuongLyThuyet;
    private Integer thoiLuongThucHanh;
    private String trangThai;
    private List<String> tienQuyet;
}
