package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

// Khóa chính phức hợp cho bảng ChuongTrinhKhung
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChuongTrinhKhungId implements Serializable {
    @Column(name = "ma_nganh", nullable = false)
    private String maNganh;

    @Column(name = "ma_mon_hoc", nullable = false)
    private String maMonHoc;
}
