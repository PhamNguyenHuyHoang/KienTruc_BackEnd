package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Entity đại diện cho bảng liên kết chương trình khung
@Entity
@Table(name = "chuong_trinh_khung")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChuongTrinhKhung {
    @EmbeddedId
    private ChuongTrinhKhungId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maNganh")
    @JoinColumn(name = "ma_nganh", nullable = false)
    private NganhHoc nganhHoc;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maMonHoc")
    @JoinColumn(name = "ma_mon_hoc", nullable = false)
    private MonHoc monHoc;

//    // Trường học kỳ
//    @Column(name = "hoc_ky")
//    private String hocKy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_hoc_ky")  // khóa ngoại đến HocKy
    private HocKy hocKy;
}
