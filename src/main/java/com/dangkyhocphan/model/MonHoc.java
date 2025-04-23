package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Table(name = "mon_hoc")
public class MonHoc {
    @Id
    @Column(name = "ma_mon_hoc", nullable = false, unique = true)
    private String maMonHoc; // ID chính có dạng MHxxx

    @Column(nullable = false)
    private String tenMonHoc;

    @Column(name = "so_tin_chi")
    private Integer soTinChi;

    @Column(columnDefinition = "TEXT")
    private String moTa;

    @OneToMany(mappedBy = "monHoc", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MonHocTienQuyet> monTienQuyet;

//    @ElementCollection
//    @CollectionTable(name = "mon_hoc_tien_quyet", joinColumns = @JoinColumn(name = "ma_mon_hoc"))
//    @Column(name = "mon_tien_quyet")
//    private List<String> monTienQuyet; // Danh sách môn tiên quyết (chứa mã môn học)

    private Integer thoiLuongLyThuyet; // Số giờ lý thuyết
    private Integer thoiLuongThucHanh; // Số giờ thực hành

    @Column(name = "trang_thai", nullable = false)
    private String trangThai;

}

