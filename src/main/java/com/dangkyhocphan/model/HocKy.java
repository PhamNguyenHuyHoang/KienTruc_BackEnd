package com.dangkyhocphan.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HocKy {
    @Id
    private String maHocKy;
    private String namHoc;
    private boolean dangMoDangKy;
}

