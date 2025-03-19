package com.dangkyhocphan.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonHoc {
    @Id
    private String maMonHoc;

    private String tenMonHoc;
}
