// model/NganhHoc.java
package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NganhHoc {

    @Id
    @Column(name = "ma_nganh")
    private String maNganh;

    @Column(name = "ten_nganh")
    private String tenNganh;

    @Column(name = "so_tin_chi_tot_nghiep", nullable = false)
    private int soTinChiTotNghiep;

    @Column(name = "mo_ta")
    private String moTa;
}
