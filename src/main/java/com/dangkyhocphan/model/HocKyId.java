package com.dangkyhocphan.model;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class HocKyId implements Serializable {
    @Column(name = "ma_hoc_ky")
    private String maHocKy;

    @Column(name = "nam_hoc")
    private String namHoc;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof HocKyId)) return false;
        HocKyId hocKyId = (HocKyId) o;
        return Objects.equals(maHocKy, hocKyId.maHocKy) && Objects.equals(namHoc, hocKyId.namHoc);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maHocKy, namHoc);
    }
}

