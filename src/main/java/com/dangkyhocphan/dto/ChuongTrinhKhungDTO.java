package com.dangkyhocphan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChuongTrinhKhungDTO {
    private String maNganh;
    private String tenNganh;
    private String maMonHoc;
    private String tenMonHoc;
    private String maHocKy;
    private String namHoc;
    private Integer soTinChi;
    private Integer soTietLT;
    private Integer soTietTH;

}
