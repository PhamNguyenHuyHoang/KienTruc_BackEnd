package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "mon_hoc_tien_quyet")
public class MonHocTienQuyet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Hoặc một ID phù hợp khác

    @ManyToOne
    @JoinColumn(name = "ma_mon_hoc", nullable = false)
    private MonHoc monHoc;

    @ManyToOne
    @JoinColumn(name = "ma_tien_quyet", nullable = false)
    private MonHoc tienQuyet;

    // Bạn có thể muốn thêm các ràng buộc để ngăn chặn các mục trùng lặp
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MonHocTienQuyet that = (MonHocTienQuyet) o;
        return monHoc.equals(that.monHoc) && tienQuyet.equals(that.tienQuyet);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(monHoc, tienQuyet);
    }
}