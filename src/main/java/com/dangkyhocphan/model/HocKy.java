package com.dangkyhocphan.model;

import jakarta.persistence.EmbeddedId;
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
    @EmbeddedId
    private HocKyId id;
    private boolean dangMoDangKy;


}

