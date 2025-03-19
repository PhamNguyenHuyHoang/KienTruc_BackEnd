package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HocPhan {
    @Id
    private String maHocPhan;

    private String tenHocPhan;

    @ManyToOne
    @JoinColumn(name = "maMonHoc", referencedColumnName = "maMonHoc")
    private MonHoc monHoc;
}

